#!/usr/bin/env python3
"""
REAL-TIME PREDICTION SYSTEM
Provides streaming predictions and signal generation with caching
"""

import asyncio
import json
import logging
import time
from datetime import datetime, timedelta
from enum import Enum
from functools import lru_cache
from typing import Any, Callable, Dict, List, Optional, Set, Tuple, Union

import numpy as np
import pandas as pd
from fastapi import BackgroundTasks, WebSocket, WebSocketDisconnect

# Import local modules
from model_registry import ModelRegistry, ModelVersion
from signal_format import Signal, SignalBatch, SignalDirection, SignalType, SignalTimeframe


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class SignalGenerationStatus(str, Enum):
    """Status of signal generation process"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELED = "canceled"


class PredictionCache:
    """Cache for model predictions to avoid redundant calculations"""
    
    def __init__(self, max_size: int = 1000, ttl_seconds: int = 300):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.max_size = max_size
        self.ttl_seconds = ttl_seconds
        self.access_times: Dict[str, float] = {}
    
    def _generate_key(self, model_id: str, version_id: Optional[str], input_data: Any) -> str:
        """Generate a cache key from model and input data"""
        # Convert input data to a string representation
        if isinstance(input_data, pd.DataFrame):
            data_str = str(hash(pd.util.hash_pandas_object(input_data).values.sum()))
        elif isinstance(input_data, np.ndarray):
            data_str = str(hash(input_data.tobytes()))
        elif isinstance(input_data, dict):
            # Sort keys for consistent hashing
            data_str = json.dumps(input_data, sort_keys=True)
        else:
            data_str = str(input_data)
        
        version_part = f":{version_id}" if version_id else ""
        return f"{model_id}{version_part}:{data_str}"
    
    def get(self, model_id: str, version_id: Optional[str], input_data: Any) -> Optional[Dict[str, Any]]:
        """Get a cached prediction if available and not expired"""
        key = self._generate_key(model_id, version_id, input_data)
        
        if key in self.cache:
            entry = self.cache[key]
            timestamp = self.access_times[key]
            
            # Check if entry is expired
            if time.time() - timestamp > self.ttl_seconds:
                # Remove expired entry
                del self.cache[key]
                del self.access_times[key]
                return None
            
            # Update access time
            self.access_times[key] = time.time()
            return entry
        
        return None
    
    def set(self, model_id: str, version_id: Optional[str], input_data: Any, result: Dict[str, Any]) -> None:
        """Store a prediction result in the cache"""
        key = self._generate_key(model_id, version_id, input_data)
        
        # Ensure we don't exceed max size
        if len(self.cache) >= self.max_size:
            # Remove oldest entry
            oldest_key = min(self.access_times, key=self.access_times.get)
            del self.cache[oldest_key]
            del self.access_times[oldest_key]
        
        # Store result
        self.cache[key] = result
        self.access_times[key] = time.time()
    
    def clear(self) -> None:
        """Clear the entire cache"""
        self.cache.clear()
        self.access_times.clear()
    
    def remove_for_model(self, model_id: str) -> int:
        """Remove all cached entries for a specific model"""
        keys_to_remove = [k for k in self.cache.keys() if k.startswith(f"{model_id}:")]
        
        for key in keys_to_remove:
            del self.cache[key]
            del self.access_times[key]
        
        return len(keys_to_remove)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        return {
            "size": len(self.cache),
            "max_size": self.max_size,
            "ttl_seconds": self.ttl_seconds,
            "models": self._count_models(),
            "oldest_entry_age": self._get_oldest_entry_age(),
            "memory_usage_estimate": self._estimate_memory_usage()
        }
    
    def _count_models(self) -> Dict[str, int]:
        """Count cache entries by model"""
        models = {}
        for key in self.cache.keys():
            model_id = key.split(":")[0]
            models[model_id] = models.get(model_id, 0) + 1
        return models
    
    def _get_oldest_entry_age(self) -> float:
        """Get age of oldest cache entry in seconds"""
        if not self.access_times:
            return 0
        
        oldest_time = min(self.access_times.values())
        return time.time() - oldest_time
    
    def _estimate_memory_usage(self) -> int:
        """Estimate memory usage of cache in bytes (rough approximation)"""
        import sys
        
        # Rough estimate
        total = sys.getsizeof(self.cache) + sys.getsizeof(self.access_times)
        
        # Add size of keys and values
        for key, value in self.cache.items():
            total += sys.getsizeof(key) + sys.getsizeof(value)
        
        return total


class SignalConnectionManager:
    """Manager for WebSocket connections receiving signal streams"""
    
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.client_subscriptions: Dict[WebSocket, Set[str]] = {}
        self.connection_details: Dict[WebSocket, Dict[str, Any]] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str, metadata: Optional[Dict[str, Any]] = None) -> None:
        """Connect a new WebSocket client"""
        await websocket.accept()
        
        if client_id not in self.active_connections:
            self.active_connections[client_id] = []
        
        self.active_connections[client_id].append(websocket)
        self.client_subscriptions[websocket] = set()
        self.connection_details[websocket] = {
            "client_id": client_id,
            "connected_at": datetime.now(),
            "metadata": metadata or {},
            "last_activity": datetime.now()
        }
        
        logger.info(f"Client connected: {client_id}")
    
    def disconnect(self, websocket: WebSocket) -> None:
        """Disconnect a WebSocket client"""
        # Find client_id for this websocket
        client_id = self.connection_details.get(websocket, {}).get("client_id")
        
        if client_id and client_id in self.active_connections:
            if websocket in self.active_connections[client_id]:
                self.active_connections[client_id].remove(websocket)
            
            # Clean up empty client entries
            if not self.active_connections[client_id]:
                del self.active_connections[client_id]
        
        # Clean up subscriptions and details
        if websocket in self.client_subscriptions:
            del self.client_subscriptions[websocket]
        
        if websocket in self.connection_details:
            del self.connection_details[websocket]
        
        logger.info(f"Client disconnected: {client_id}")
    
    def subscribe(self, websocket: WebSocket, topic: str) -> None:
        """Subscribe a client to a specific topic"""
        if websocket in self.client_subscriptions:
            self.client_subscriptions[websocket].add(topic)
            
            # Update last activity
            if websocket in self.connection_details:
                self.connection_details[websocket]["last_activity"] = datetime.now()
            
            logger.info(f"Client subscribed to: {topic}")
    
    def unsubscribe(self, websocket: WebSocket, topic: str) -> None:
        """Unsubscribe a client from a specific topic"""
        if websocket in self.client_subscriptions and topic in self.client_subscriptions[websocket]:
            self.client_subscriptions[websocket].remove(topic)
            
            # Update last activity
            if websocket in self.connection_details:
                self.connection_details[websocket]["last_activity"] = datetime.now()
            
            logger.info(f"Client unsubscribed from: {topic}")
    
    async def broadcast(self, message: Any, topic: Optional[str] = None) -> int:
        """Broadcast a message to all clients or those subscribed to a topic"""
        sent_count = 0
        
        for websocket, subscriptions in self.client_subscriptions.items():
            try:
                # If topic is specified, only send to subscribed clients
                if topic is None or topic in subscriptions:
                    await websocket.send_json(message)
                    sent_count += 1
                    
                    # Update last activity
                    if websocket in self.connection_details:
                        self.connection_details[websocket]["last_activity"] = datetime.now()
            except Exception as e:
                logger.error(f"Error sending message: {str(e)}")
                # Don't disconnect here, let the caller handle disconnects
        
        return sent_count
    
    async def send_personal_message(self, message: Any, websocket: WebSocket) -> bool:
        """Send a message to a specific client"""
        try:
            await websocket.send_json(message)
            
            # Update last activity
            if websocket in self.connection_details:
                self.connection_details[websocket]["last_activity"] = datetime.now()
            
            return True
        except Exception as e:
            logger.error(f"Error sending personal message: {str(e)}")
            return False
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Get statistics about current connections"""
        now = datetime.now()
        
        stats = {
            "total_clients": len(self.active_connections),
            "total_connections": sum(len(conns) for conns in self.active_connections.values()),
            "subscriptions": self._count_subscriptions(),
            "clients": {}
        }
        
        # Add client-specific stats
        for client_id, connections in self.active_connections.items():
            client_stats = {
                "connections": len(connections),
                "subscriptions": set(),
                "connection_duration": []
            }
            
            for conn in connections:
                # Add subscriptions
                if conn in self.client_subscriptions:
                    client_stats["subscriptions"].update(self.client_subscriptions[conn])
                
                # Add connection duration
                if conn in self.connection_details:
                    connected_at = self.connection_details[conn].get("connected_at")
                    if connected_at:
                        duration = (now - connected_at).total_seconds()
                        client_stats["connection_duration"].append(duration)
            
            # Convert set to list for JSON serialization
            client_stats["subscriptions"] = list(client_stats["subscriptions"])
            
            stats["clients"][client_id] = client_stats
        
        return stats
    
    def _count_subscriptions(self) -> Dict[str, int]:
        """Count subscriptions by topic"""
        topic_counts = {}
        
        for subscriptions in self.client_subscriptions.values():
            for topic in subscriptions:
                topic_counts[topic] = topic_counts.get(topic, 0) + 1
        
        return topic_counts
    
    def cleanup_inactive_connections(self, max_idle_seconds: int = 3600) -> int:
        """Clean up connections that have been inactive for too long"""
        now = datetime.now()
        connections_to_remove = []
        
        for websocket, details in self.connection_details.items():
            last_activity = details.get("last_activity")
            if last_activity and (now - last_activity).total_seconds() > max_idle_seconds:
                connections_to_remove.append(websocket)
        
        for websocket in connections_to_remove:
            self.disconnect(websocket)
        
        return len(connections_to_remove)


class RealTimePredictionService:
    """
    Service for generating real-time predictions and signals
    
    This service uses the model registry to load models and generate signals
    that can be streamed to clients in real-time.
    """
    
    def __init__(
        self, 
        model_registry: ModelRegistry,
        cache_size: int = 1000,
        cache_ttl_seconds: int = 300
    ):
        self.model_registry = model_registry
        self.cache = PredictionCache(max_size=cache_size, ttl_seconds=cache_ttl_seconds)
        self.connection_manager = SignalConnectionManager()
        self.active_jobs: Dict[str, Dict[str, Any]] = {}
        self.loaded_models: Dict[str, Any] = {}
    
    async def handle_websocket(self, websocket: WebSocket, client_id: str) -> None:
        """Handle a WebSocket connection for real-time signal streaming"""
        try:
            # Accept connection
            await self.connection_manager.connect(websocket, client_id)
            
            # Send welcome message
            welcome_msg = {
                "type": "welcome",
                "client_id": client_id,
                "timestamp": datetime.now().isoformat(),
                "message": "Connected to signal stream"
            }
            await self.connection_manager.send_personal_message(welcome_msg, websocket)
            
            # Handle messages
            while True:
                data = await websocket.receive_json()
                
                # Process the message based on its type
                msg_type = data.get("type", "")
                
                if msg_type == "subscribe":
                    # Handle subscription request
                    topic = data.get("topic")
                    if topic:
                        self.connection_manager.subscribe(websocket, topic)
                        await self.connection_manager.send_personal_message({
                            "type": "subscription_success",
                            "topic": topic,
                            "timestamp": datetime.now().isoformat()
                        }, websocket)
                
                elif msg_type == "unsubscribe":
                    # Handle unsubscription request
                    topic = data.get("topic")
                    if topic:
                        self.connection_manager.unsubscribe(websocket, topic)
                        await self.connection_manager.send_personal_message({
                            "type": "unsubscription_success",
                            "topic": topic,
                            "timestamp": datetime.now().isoformat()
                        }, websocket)
                
                elif msg_type == "request_signal":
                    # Handle signal request
                    await self._handle_signal_request(websocket, data)
                
                elif msg_type == "ping":
                    # Handle ping (keep-alive)
                    await self.connection_manager.send_personal_message({
                        "type": "pong",
                        "timestamp": datetime.now().isoformat()
                    }, websocket)
                
                else:
                    # Unknown message type
                    await self.connection_manager.send_personal_message({
                        "type": "error",
                        "error": "Unknown message type",
                        "timestamp": datetime.now().isoformat()
                    }, websocket)
        
        except WebSocketDisconnect:
            # Client disconnected
            self.connection_manager.disconnect(websocket)
        
        except Exception as e:
            # Handle other errors
            logger.error(f"WebSocket error: {str(e)}")
            try:
                await self.connection_manager.send_personal_message({
                    "type": "error",
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }, websocket)
            except:
                pass
            
            # Disconnect client
            self.connection_manager.disconnect(websocket)
    
    async def _handle_signal_request(self, websocket: WebSocket, data: Dict[str, Any]) -> None:
        """Handle a request for signal generation"""
        model_id = data.get("model_id")
        instrument_id = data.get("instrument_id")
        
        if not model_id or not instrument_id:
            await self.connection_manager.send_personal_message({
                "type": "error",
                "error": "Missing required parameters: model_id and instrument_id",
                "timestamp": datetime.now().isoformat()
            }, websocket)
            return
        
        # Create a job ID
        job_id = f"{model_id}_{instrument_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{id(websocket)}"
        
        # Register the job
        self.active_jobs[job_id] = {
            "model_id": model_id,
            "instrument_id": instrument_id,
            "status": SignalGenerationStatus.PENDING,
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "websocket": websocket,
            "params": data
        }
        
        # Notify client that job has been created
        await self.connection_manager.send_personal_message({
            "type": "signal_job_created",
            "job_id": job_id,
            "model_id": model_id,
            "instrument_id": instrument_id,
            "status": SignalGenerationStatus.PENDING,
            "timestamp": datetime.now().isoformat()
        }, websocket)
        
        # Start processing in the background
        asyncio.create_task(self._process_signal_job(job_id))
    
    async def _process_signal_job(self, job_id: str) -> None:
        """Process a signal generation job"""
        if job_id not in self.active_jobs:
            logger.error(f"Job not found: {job_id}")
            return
        
        job = self.active_jobs[job_id]
        websocket = job["websocket"]
        model_id = job["model_id"]
        instrument_id = job["instrument_id"]
        params = job["params"]
        
        # Update job status
        job["status"] = SignalGenerationStatus.PROCESSING
        job["updated_at"] = datetime.now()
        
        try:
            # Notify client that processing has started
            await self.connection_manager.send_personal_message({
                "type": "signal_job_update",
                "job_id": job_id,
                "status": SignalGenerationStatus.PROCESSING,
                "timestamp": datetime.now().isoformat()
            }, websocket)
            
            # Get the model version ID (if specified)
            version_id = params.get("version_id")
            
            # Try to get from cache first
            cache_key_data = {
                "instrument_id": instrument_id,
                "params": {k: v for k, v in params.items() if k not in ["type", "model_id", "instrument_id", "websocket"]}
            }
            
            cached_result = self.cache.get(model_id, version_id, cache_key_data)
            
            if cached_result:
                # Use cached result
                logger.info(f"Using cached result for job {job_id}")
                signals = cached_result.get("signals", [])
                is_cached = True
            else:
                # Generate new prediction
                signals = await self._generate_signals(model_id, instrument_id, version_id, params)
                is_cached = False
                
                # Cache the result
                self.cache.set(model_id, version_id, cache_key_data, {"signals": signals})
            
            # Update job status
            job["status"] = SignalGenerationStatus.COMPLETED
            job["updated_at"] = datetime.now()
            job["completed_at"] = datetime.now()
            job["result"] = {
                "signals": signals,
                "cached": is_cached
            }
            
            # Convert Signal objects to dictionaries
            signal_dicts = [signal.to_dict() for signal in signals]
            
            # Send result to client
            await self.connection_manager.send_personal_message({
                "type": "signal_result",
                "job_id": job_id,
                "model_id": model_id,
                "instrument_id": instrument_id,
                "signals": signal_dicts,
                "cached": is_cached,
                "timestamp": datetime.now().isoformat()
            }, websocket)
            
            # Also broadcast to any subscribers
            await self.connection_manager.broadcast({
                "type": "signal_update",
                "model_id": model_id,
                "instrument_id": instrument_id,
                "signals": signal_dicts,
                "timestamp": datetime.now().isoformat()
            }, f"signals:{model_id}:{instrument_id}")
        
        except Exception as e:
            # Handle errors
            logger.error(f"Error processing job {job_id}: {str(e)}")
            
            # Update job status
            job["status"] = SignalGenerationStatus.FAILED
            job["updated_at"] = datetime.now()
            job["error"] = str(e)
            
            # Notify client of error
            try:
                await self.connection_manager.send_personal_message({
                    "type": "signal_error",
                    "job_id": job_id,
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }, websocket)
            except:
                # Client might be disconnected
                pass
        
        finally:
            # Keep the job record for a while, but remove the websocket reference
            if job_id in self.active_jobs:
                self.active_jobs[job_id]["websocket"] = None
                
                # Schedule job cleanup
                asyncio.create_task(self._cleanup_job(job_id, delay_seconds=3600))
    
    async def _cleanup_job(self, job_id: str, delay_seconds: int = 3600) -> None:
        """Clean up a job after a delay"""
        await asyncio.sleep(delay_seconds)
        
        if job_id in self.active_jobs:
            del self.active_jobs[job_id]
            logger.info(f"Cleaned up job {job_id}")
    
    async def _generate_signals(
        self, 
        model_id: str, 
        instrument_id: str, 
        version_id: Optional[str] = None,
        params: Optional[Dict[str, Any]] = None
    ) -> List[Signal]:
        """Generate signals using the specified model"""
        # Get model from registry
        model_def = self.model_registry.get_model(model_id)
        if not model_def:
            raise ValueError(f"Model not found: {model_id}")
        
        # Get specific version or default
        if version_id:
            version = self.model_registry.get_model_version(model_id, version_id)
            if not version:
                raise ValueError(f"Version {version_id} not found for model {model_id}")
        else:
            version = self.model_registry.get_default_model_version(model_id)
            if not version:
                raise ValueError(f"No default version available for model {model_id}")
        
        # Extract parameters
        timeframe = params.get("timeframe", SignalTimeframe.H1.value)
        signal_type = params.get("signal_type", SignalType.ENTRY.value)
        limit = int(params.get("limit", 1))
        
        # In a real implementation, this would load the model and generate predictions
        # For this example, we'll create mock signals
        signals = []
        
        # Generate signals based on model type
        model_type = model_def.model_type
        
        if model_type == "classification":
            # Classification model - generate entry signals
            for i in range(limit):
                # Mock confidence scores
                confidence = 0.5 + (np.random.random() * 0.4)  # 0.5 to 0.9
                direction = SignalDirection.LONG if np.random.random() > 0.4 else SignalDirection.SHORT
                
                # Create price levels
                current_price = 1000 + (np.random.random() * 100)
                
                # Set stop loss and take profit based on direction
                if direction == SignalDirection.LONG:
                    stop_loss = current_price * 0.97  # 3% below
                    take_profit = current_price * 1.05  # 5% above
                else:
                    stop_loss = current_price * 1.03  # 3% above
                    take_profit = current_price * 0.95  # 5% below
                
                # Create a signal
                signal = Signal(
                    instrument_id=instrument_id,
                    signal_type=signal_type,
                    direction=direction,
                    timeframe=timeframe,
                    entry_price=current_price,
                    current_price=current_price,
                    stop_loss=stop_loss,
                    take_profit=take_profit,
                    confidence=confidence,
                    confidence_metrics={
                        "probability": confidence,
                        "model_agreement": 0.8 + (np.random.random() * 0.2),
                        "win_rate": 0.6 + (np.random.random() * 0.2)
                    },
                    strategy_id=model_def.metadata.get("strategy_id", "unknown"),
                    model_id=model_id,
                    model_version=version.version_id,
                    expiration=datetime.now() + timedelta(hours=24),
                    metadata={
                        "source": "realtime_prediction_service",
                        "generated_by": "RealTimePredictionService"
                    }
                )
                
                signals.append(signal)
        
        elif model_type == "regression":
            # Regression model - generate price predictions
            for i in range(limit):
                # Mock price predictions
                current_price = 1000 + (np.random.random() * 100)
                predicted_price = current_price * (1 + (np.random.random() * 0.1 - 0.05))  # +/- 5%
                
                # Determine direction based on predicted price
                direction = SignalDirection.LONG if predicted_price > current_price else SignalDirection.SHORT
                
                # Set confidence based on prediction difference
                price_diff_pct = abs(predicted_price - current_price) / current_price
                confidence = min(0.5 + price_diff_pct * 10, 0.95)  # Scale confidence
                
                # Create a signal
                signal = Signal(
                    instrument_id=instrument_id,
                    signal_type=SignalType.ENTRY,
                    direction=direction,
                    timeframe=timeframe,
                    current_price=current_price,
                    entry_price=current_price,
                    confidence=confidence,
                    confidence_metrics={
                        "predicted_price": predicted_price,
                        "predicted_change": (predicted_price - current_price) / current_price,
                        "prediction_horizon": "24h"
                    },
                    expected_return=((predicted_price - current_price) / current_price) * (1 if direction == SignalDirection.LONG else -1),
                    strategy_id=model_def.metadata.get("strategy_id", "unknown"),
                    model_id=model_id,
                    model_version=version.version_id,
                    expiration=datetime.now() + timedelta(hours=24),
                    metadata={
                        "source": "realtime_prediction_service",
                        "generated_by": "RealTimePredictionService"
                    }
                )
                
                signals.append(signal)
        
        else:
            # Default case - generic signals
            for i in range(limit):
                signal = Signal(
                    instrument_id=instrument_id,
                    signal_type=signal_type,
                    timeframe=timeframe,
                    strategy_id=model_def.metadata.get("strategy_id", "unknown"),
                    model_id=model_id,
                    model_version=version.version_id,
                    metadata={
                        "source": "realtime_prediction_service",
                        "generated_by": "RealTimePredictionService"
                    }
                )
                
                signals.append(signal)
        
        # Simulate some processing time
        await asyncio.sleep(0.5)
        
        return signals
    
    def get_stats(self) -> Dict[str, Any]:
        """Get service statistics"""
        return {
            "cache": self.cache.get_stats(),
            "connections": self.connection_manager.get_connection_stats(),
            "active_jobs": len(self.active_jobs),
            "jobs_by_status": self._count_jobs_by_status(),
            "loaded_models": len(self.loaded_models)
        }
    
    def _count_jobs_by_status(self) -> Dict[str, int]:
        """Count jobs by status"""
        status_counts = {}
        
        for job in self.active_jobs.values():
            status = job.get("status", SignalGenerationStatus.PENDING)
            if isinstance(status, SignalGenerationStatus):
                status = status.value
            
            status_counts[status] = status_counts.get(status, 0) + 1
        
        return status_counts
    
    async def start_background_tasks(self) -> None:
        """Start background tasks for service maintenance"""
        # Start periodic cache cleanup
        asyncio.create_task(self._periodic_cache_cleanup())
        
        # Start periodic connection cleanup
        asyncio.create_task(self._periodic_connection_cleanup())
    
    async def _periodic_cache_cleanup(self, interval_seconds: int = 300) -> None:
        """Periodically clean up expired cache entries"""
        while True:
            try:
                # Wait for the interval
                await asyncio.sleep(interval_seconds)
                
                # Get current cache stats before cleanup
                before_stats = self.cache.get_stats()
                
                # Clean up the cache (this will happen automatically during gets,
                # but this ensures we regularly clean up even without activity)
                # In this implementation, we'll just clear all expired entries
                # which is handled automatically by the cache get operations
                
                # Get stats after cleanup for logging
                after_stats = self.cache.get_stats()
                
                logger.info(
                    f"Cache cleanup: before={before_stats['size']} entries, "
                    f"after={after_stats['size']} entries"
                )
            except Exception as e:
                logger.error(f"Error in periodic cache cleanup: {str(e)}")
    
    async def _periodic_connection_cleanup(self, interval_seconds: int = 1800, max_idle_seconds: int = 3600) -> None:
        """Periodically clean up inactive connections"""
        while True:
            try:
                # Wait for the interval
                await asyncio.sleep(interval_seconds)
                
                # Get connection stats before cleanup
                before_stats = self.connection_manager.get_connection_stats()
                before_count = before_stats["total_connections"]
                
                # Clean up inactive connections
                removed_count = self.connection_manager.cleanup_inactive_connections(
                    max_idle_seconds=max_idle_seconds
                )
                
                # Log results
                if removed_count > 0:
                    logger.info(f"Connection cleanup: removed {removed_count} inactive connections")
                    
                    # Get stats after cleanup
                    after_stats = self.connection_manager.get_connection_stats()
                    after_count = after_stats["total_connections"]
                    
                    logger.info(f"Connection cleanup: before={before_count}, after={after_count}")
            except Exception as e:
                logger.error(f"Error in periodic connection cleanup: {str(e)}")
