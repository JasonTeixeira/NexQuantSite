#!/usr/bin/env python3
"""
FASTAPI MODEL SELECTOR API
REST API endpoints for multi-model architecture selection

This provides HTTP endpoints for switching between different ML model architectures,
viewing model performance, and managing model configurations.
"""

import logging
import os
from datetime import datetime
from typing import Any, Optional

import redis
import uvicorn
from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from model_selector import ModelManager, ModelSelectorAPI
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="Nexural Trading - Model Selector API",
    description="Multi-model architecture selection for elite trading ML system",
    version="1.0.0",
)

# CORS middleware - SECURE CONFIGURATION
from security_config import SecurityConfig

cors_config = SecurityConfig.get_cors_config()
app.add_middleware(CORSMiddleware, **cors_config)

# Global model manager instance
model_manager: Optional[ModelManager] = None
model_api: Optional[ModelSelectorAPI] = None


# Pydantic models for API requests/responses
class ModelSwitchRequest(BaseModel):
    model_id: str = Field(..., description="ID of the model to switch to")


class ModelEvaluationRequest(BaseModel):
    model_id: str = Field(..., description="ID of the model to evaluate")
    days: int = Field(default=30, description="Number of days to evaluate")


class ModelPerformanceResponse(BaseModel):
    model_id: str
    performance: Optional[dict[str, Any]]
    success: bool
    message: str


class ModelComparisonResponse(BaseModel):
    current_model: str
    models: dict[str, dict[str, Any]]
    success: bool
    message: str


class AvailableModelsResponse(BaseModel):
    models: dict[str, dict[str, Any]]
    current_model: str
    success: bool
    message: str


class ModelSwitchResponse(BaseModel):
    success: bool
    current_model: str
    message: str


# Dependency to get model manager
async def get_model_manager() -> ModelManager:
    if model_manager is None:
        raise HTTPException(status_code=500, detail="Model manager not initialized")
    return model_manager


async def get_model_api() -> ModelSelectorAPI:
    if model_api is None:
        raise HTTPException(status_code=500, detail="Model API not initialized")
    return model_api


@app.on_event("startup")
async def startup_event():
    """Initialize model manager on startup"""
    global model_manager, model_api

    try:
        # Initialize Redis connection
        redis_client = redis.Redis(
            host=os.getenv("REDIS_HOST", "localhost"),
            port=int(os.getenv("REDIS_PORT", 6379)),
            db=int(os.getenv("REDIS_DB", 0)),
            decode_responses=True,
        )

        # Test Redis connection
        redis_client.ping()
        logger.info("Redis connection established")

        # Initialize model manager
        model_manager = ModelManager(redis_client=redis_client)
        model_api = ModelSelectorAPI(model_manager)

        logger.info("Model selector API initialized successfully")

    except Exception as e:
        logger.error(f"Failed to initialize model selector API: {e}")
        raise


@app.get("/", response_model=dict[str, str])
async def root():
    """Root endpoint"""
    return {
        "message": "Nexural Trading - Model Selector API",
        "version": "1.0.0",
        "status": "operational",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        if model_manager is None:
            return {"status": "unhealthy", "message": "Model manager not initialized"}

        # Test basic functionality
        current_model = model_manager.get_current_model()
        available_models = model_manager.get_available_models()

        return {
            "status": "healthy",
            "current_model": current_model,
            "available_models_count": len(available_models),
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        return {"status": "unhealthy", "message": str(e)}


@app.get("/models", response_model=AvailableModelsResponse)
async def get_available_models(api: ModelSelectorAPI = Depends(get_model_api)):
    """Get all available models"""
    try:
        models_data = await api.get_available_models()
        return AvailableModelsResponse(
            models=models_data["models"],
            current_model=models_data["current_model"],
            success=True,
            message="Available models retrieved successfully",
        )
    except Exception as e:
        logger.error(f"Failed to get available models: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/models/switch", response_model=ModelSwitchResponse)
async def switch_model(request: ModelSwitchRequest, api: ModelSelectorAPI = Depends(get_model_api)):
    """Switch to a different model architecture"""
    try:
        result = await api.switch_model(request.model_id)
        return ModelSwitchResponse(
            success=result["success"],
            current_model=result["current_model"],
            message=result["message"],
        )
    except Exception as e:
        logger.error(f"Failed to switch model: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/models/{model_id}/performance", response_model=ModelPerformanceResponse)
async def get_model_performance(model_id: str, api: ModelSelectorAPI = Depends(get_model_api)):
    """Get performance data for a specific model"""
    try:
        result = await api.get_model_performance(model_id)
        return ModelPerformanceResponse(
            model_id=result["model_id"],
            performance=result["performance"],
            success=True,
            message="Model performance retrieved successfully",
        )
    except Exception as e:
        logger.error(f"Failed to get model performance: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/models/{model_id}/evaluate", response_model=ModelPerformanceResponse)
async def evaluate_model(
    model_id: str, request: ModelEvaluationRequest, api: ModelSelectorAPI = Depends(get_model_api)
):
    """Evaluate performance of a specific model"""
    try:
        result = await api.evaluate_model(model_id, request.days)
        return ModelPerformanceResponse(
            model_id=result["model_id"],
            performance=result["performance"],
            success=True,
            message=f"Model evaluation completed for {request.days} days",
        )
    except Exception as e:
        logger.error(f"Failed to evaluate model: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/models/comparison", response_model=ModelComparisonResponse)
async def get_model_comparison(api: ModelSelectorAPI = Depends(get_model_api)):
    """Get comparison of all model performances"""
    try:
        result = await api.get_model_comparison()
        return ModelComparisonResponse(
            current_model=result["current_model"],
            models=result["models"],
            success=True,
            message="Model comparison retrieved successfully",
        )
    except Exception as e:
        logger.error(f"Failed to get model comparison: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/models/current")
async def get_current_model(api: ModelSelectorAPI = Depends(get_model_api)):
    """Get current active model"""
    try:
        current_model = model_manager.get_current_model()
        config = model_manager.get_model_config(current_model)

        return {
            "current_model": current_model,
            "config": asdict(config) if config else None,
            "success": True,
            "message": "Current model retrieved successfully",
        }
    except Exception as e:
        logger.error(f"Failed to get current model: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/models/{model_id}/predict")
async def make_prediction(
    model_id: str, data: dict[str, Any], api: ModelSelectorAPI = Depends(get_model_api)
):
    """Make prediction using specified model"""
    try:
        # Temporarily switch to the specified model for prediction
        original_model = model_manager.get_current_model()

        if model_id != original_model:
            await model_manager.switch_model(model_id)

        # Make prediction
        prediction = await model_manager.predict(data)

        # Switch back to original model
        if model_id != original_model:
            await model_manager.switch_model(original_model)

        return {
            "model_id": model_id,
            "prediction": {
                "signal": prediction.signal,
                "confidence": prediction.confidence,
                "uncertainty": prediction.uncertainty,
                "regime": prediction.regime,
                "should_trade": prediction.should_trade,
                "position_size": prediction.position_size,
                "stop_loss": prediction.stop_loss,
                "take_profit": prediction.take_profit,
            },
            "success": True,
            "message": "Prediction completed successfully",
        }
    except Exception as e:
        logger.error(f"Failed to make prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/models/{model_id}/config")
async def get_model_config(model_id: str, manager: ModelManager = Depends(get_model_manager)):
    """Get configuration for a specific model"""
    try:
        config = manager.get_model_config(model_id)
        if not config:
            raise HTTPException(status_code=404, detail=f"Model {model_id} not found")

        return {
            "model_id": model_id,
            "config": asdict(config),
            "success": True,
            "message": "Model configuration retrieved successfully",
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get model config: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/models/{model_id}/activate")
async def activate_model(model_id: str, manager: ModelManager = Depends(get_model_manager)):
    """Activate a model (if it was previously deactivated)"""
    try:
        config = manager.get_model_config(model_id)
        if not config:
            raise HTTPException(status_code=404, detail=f"Model {model_id} not found")

        if config.is_active:
            return {"success": True, "message": f"Model {model_id} is already active"}

        # In a real implementation, you might want to add logic to activate models
        # For now, we'll just return a message
        return {"success": True, "message": f"Model {model_id} activation requested"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to activate model: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/models/{model_id}/deactivate")
async def deactivate_model(model_id: str, manager: ModelManager = Depends(get_model_manager)):
    """Deactivate a model"""
    try:
        config = manager.get_model_config(model_id)
        if not config:
            raise HTTPException(status_code=404, detail=f"Model {model_id} not found")

        if not config.is_active:
            return {"success": True, "message": f"Model {model_id} is already deactivated"}

        # Prevent deactivating the current model
        current_model = manager.get_current_model()
        if model_id == current_model:
            raise HTTPException(
                status_code=400, detail=f"Cannot deactivate current model {model_id}"
            )

        # In a real implementation, you might want to add logic to deactivate models
        # For now, we'll just return a message
        return {"success": True, "message": f"Model {model_id} deactivation requested"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to deactivate model: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Background task for periodic model evaluation
async def evaluate_all_models():
    """Background task to evaluate all models periodically"""
    if model_api is None:
        return

    try:
        models = model_manager.get_available_models()
        for model_id in models:
            if models[model_id].is_active:
                await model_api.evaluate_model(model_id, days=30)
        logger.info("Completed periodic evaluation of all models")
    except Exception as e:
        logger.error(f"Failed to evaluate all models: {e}")


@app.post("/models/evaluate-all")
async def evaluate_all_models_endpoint(background_tasks: BackgroundTasks):
    """Trigger evaluation of all models"""
    try:
        background_tasks.add_task(evaluate_all_models)
        return {"success": True, "message": "Model evaluation started in background"}
    except Exception as e:
        logger.error(f"Failed to start model evaluation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    # Run the API server
    uvicorn.run(
        "model_selector_api:app",
        host="0.0.0.0",
        port=8001,  # Different port from main API
        reload=True,
        log_level="info",
    )
