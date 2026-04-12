#!/usr/bin/env python3
"""
MODEL REGISTRY SYSTEM
Central repository for managing ML models with versioning and metadata
"""

import json
import os
import shutil
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Union, Any

import numpy as np
import pandas as pd


class ModelVersion:
    """Represents a specific version of a model"""
    
    def __init__(
        self,
        version_id: str,
        model_path: str,
        created_at: Optional[datetime] = None,
        metrics: Optional[Dict[str, float]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        is_active: bool = False,
        training_data_hash: Optional[str] = None,
    ):
        self.version_id = version_id
        self.model_path = model_path
        self.created_at = created_at or datetime.now()
        self.metrics = metrics or {}
        self.metadata = metadata or {}
        self.is_active = is_active
        self.training_data_hash = training_data_hash
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert version to dictionary format for serialization"""
        return {
            "version_id": self.version_id,
            "model_path": self.model_path,
            "created_at": self.created_at.isoformat(),
            "metrics": self.metrics,
            "metadata": self.metadata,
            "is_active": self.is_active,
            "training_data_hash": self.training_data_hash
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ModelVersion":
        """Create version from dictionary data"""
        return cls(
            version_id=data["version_id"],
            model_path=data["model_path"],
            created_at=datetime.fromisoformat(data["created_at"]),
            metrics=data.get("metrics", {}),
            metadata=data.get("metadata", {}),
            is_active=data.get("is_active", False),
            training_data_hash=data.get("training_data_hash")
        )


class ModelDefinition:
    """Represents a model definition with multiple versions"""
    
    def __init__(
        self,
        model_id: str,
        name: str,
        description: Optional[str] = None,
        tags: Optional[List[str]] = None,
        model_type: Optional[str] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
        versions: Optional[Dict[str, ModelVersion]] = None,
        default_version_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        self.model_id = model_id
        self.name = name
        self.description = description or ""
        self.tags = tags or []
        self.model_type = model_type or "unknown"
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()
        self.versions = versions or {}
        self.default_version_id = default_version_id
        self.metadata = metadata or {}
    
    def add_version(self, version: ModelVersion) -> None:
        """Add a new version to this model"""
        self.versions[version.version_id] = version
        self.updated_at = datetime.now()
        
        # If this is the first version or it's marked as active, set it as default
        if not self.default_version_id or version.is_active:
            self.set_default_version(version.version_id)
    
    def set_default_version(self, version_id: str) -> None:
        """Set the default version for this model"""
        if version_id not in self.versions:
            raise ValueError(f"Version {version_id} does not exist")
        
        self.default_version_id = version_id
        self.updated_at = datetime.now()
    
    def get_default_version(self) -> Optional[ModelVersion]:
        """Get the default version for this model"""
        if not self.default_version_id:
            return None
        return self.versions.get(self.default_version_id)
    
    def get_best_version(self, metric_name: str, higher_is_better: bool = True) -> Optional[ModelVersion]:
        """Get the best version based on a specific metric"""
        if not self.versions:
            return None
        
        versions_with_metric = [v for v in self.versions.values() if metric_name in v.metrics]
        if not versions_with_metric:
            return None
        
        if higher_is_better:
            return max(versions_with_metric, key=lambda v: v.metrics.get(metric_name, 0))
        else:
            return min(versions_with_metric, key=lambda v: v.metrics.get(metric_name, float('inf')))
    
    def delete_version(self, version_id: str) -> bool:
        """Delete a version from this model"""
        if version_id not in self.versions:
            return False
        
        # If we're deleting the default version, set a new one if available
        if version_id == self.default_version_id:
            remaining_versions = [v for v in self.versions.keys() if v != version_id]
            if remaining_versions:
                self.default_version_id = remaining_versions[0]
            else:
                self.default_version_id = None
        
        del self.versions[version_id]
        self.updated_at = datetime.now()
        return True
    
    def to_dict(self, include_versions: bool = True) -> Dict[str, Any]:
        """Convert model definition to dictionary format for serialization"""
        result = {
            "model_id": self.model_id,
            "name": self.name,
            "description": self.description,
            "tags": self.tags,
            "model_type": self.model_type,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "default_version_id": self.default_version_id,
            "metadata": self.metadata
        }
        
        if include_versions:
            result["versions"] = {
                v_id: version.to_dict() for v_id, version in self.versions.items()
            }
        
        return result
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ModelDefinition":
        """Create model definition from dictionary data"""
        versions = {}
        if "versions" in data:
            versions = {
                v_id: ModelVersion.from_dict(v_data) 
                for v_id, v_data in data["versions"].items()
            }
        
        return cls(
            model_id=data["model_id"],
            name=data["name"],
            description=data.get("description", ""),
            tags=data.get("tags", []),
            model_type=data.get("model_type", "unknown"),
            created_at=datetime.fromisoformat(data["created_at"]),
            updated_at=datetime.fromisoformat(data["updated_at"]),
            versions=versions,
            default_version_id=data.get("default_version_id"),
            metadata=data.get("metadata", {})
        )


class ModelRegistry:
    """Central registry for managing ML models"""
    
    def __init__(self, registry_dir: str):
        self.registry_dir = Path(registry_dir)
        self.models_dir = self.registry_dir / "models"
        self.registry_file = self.registry_dir / "registry.json"
        self.models: Dict[str, ModelDefinition] = {}
        
        # Initialize registry
        self._init_registry()
    
    def _init_registry(self) -> None:
        """Initialize the registry directory and load existing data"""
        # Create directories if they don't exist
        self.registry_dir.mkdir(exist_ok=True)
        self.models_dir.mkdir(exist_ok=True)
        
        # Load existing registry if available
        if self.registry_file.exists():
            self._load_registry()
        else:
            self._save_registry()
    
    def _load_registry(self) -> None:
        """Load registry data from file"""
        try:
            with open(self.registry_file, 'r') as f:
                data = json.load(f)
            
            self.models = {
                model_id: ModelDefinition.from_dict(model_data)
                for model_id, model_data in data.items()
            }
        except Exception as e:
            print(f"Error loading registry: {e}")
            # Create backup of corrupted file
            if self.registry_file.exists():
                backup_path = self.registry_file.with_suffix(f".json.bak.{int(time.time())}")
                shutil.copy(self.registry_file, backup_path)
            # Initialize empty registry
            self.models = {}
            self._save_registry()
    
    def _save_registry(self) -> None:
        """Save registry data to file"""
        data = {
            model_id: model.to_dict()
            for model_id, model in self.models.items()
        }
        
        with open(self.registry_file, 'w') as f:
            json.dump(data, f, indent=2)
    
    def register_model(
        self,
        name: str,
        description: Optional[str] = None,
        tags: Optional[List[str]] = None,
        model_type: Optional[str] = None,
        model_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> ModelDefinition:
        """Register a new model definition"""
        # Generate model_id if not provided
        if model_id is None:
            timestamp = int(time.time() * 1000)
            model_id = f"{name.lower().replace(' ', '-')}-{timestamp}"
        
        # Check if model_id already exists
        if model_id in self.models:
            raise ValueError(f"Model with ID '{model_id}' already exists")
        
        # Create model definition
        model = ModelDefinition(
            model_id=model_id,
            name=name,
            description=description,
            tags=tags,
            model_type=model_type,
            metadata=metadata
        )
        
        # Add to registry
        self.models[model_id] = model
        self._save_registry()
        
        return model
    
    def get_model(self, model_id: str) -> Optional[ModelDefinition]:
        """Get a model definition by ID"""
        return self.models.get(model_id)
    
    def list_models(
        self,
        tags: Optional[List[str]] = None,
        model_type: Optional[str] = None,
        name_contains: Optional[str] = None
    ) -> List[ModelDefinition]:
        """List models with optional filtering"""
        result = list(self.models.values())
        
        # Apply filters
        if tags:
            result = [m for m in result if any(tag in m.tags for tag in tags)]
        
        if model_type:
            result = [m for m in result if m.model_type == model_type]
        
        if name_contains:
            result = [m for m in result if name_contains.lower() in m.name.lower()]
        
        return result
    
    def add_model_version(
        self,
        model_id: str,
        model_path: str,
        metrics: Optional[Dict[str, float]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        version_id: Optional[str] = None,
        is_active: bool = False,
        training_data_hash: Optional[str] = None
    ) -> ModelVersion:
        """Add a new version to an existing model"""
        model = self.get_model(model_id)
        if model is None:
            raise ValueError(f"Model with ID '{model_id}' does not exist")
        
        # Generate version_id if not provided
        if version_id is None:
            timestamp = int(time.time() * 1000)
            version_id = f"v-{timestamp}"
        
        # Create model version
        version = ModelVersion(
            version_id=version_id,
            model_path=model_path,
            metrics=metrics,
            metadata=metadata,
            is_active=is_active,
            training_data_hash=training_data_hash
        )
        
        # Add to model
        model.add_version(version)
        self._save_registry()
        
        return version
    
    def set_default_version(self, model_id: str, version_id: str) -> None:
        """Set the default version for a model"""
        model = self.get_model(model_id)
        if model is None:
            raise ValueError(f"Model with ID '{model_id}' does not exist")
        
        model.set_default_version(version_id)
        self._save_registry()
    
    def get_model_version(self, model_id: str, version_id: str) -> Optional[ModelVersion]:
        """Get a specific version of a model"""
        model = self.get_model(model_id)
        if model is None:
            return None
        
        return model.versions.get(version_id)
    
    def get_default_model_version(self, model_id: str) -> Optional[ModelVersion]:
        """Get the default version of a model"""
        model = self.get_model(model_id)
        if model is None:
            return None
        
        return model.get_default_version()
    
    def delete_model(self, model_id: str) -> bool:
        """Delete a model and all its versions"""
        if model_id not in self.models:
            return False
        
        del self.models[model_id]
        self._save_registry()
        return True
    
    def delete_model_version(self, model_id: str, version_id: str) -> bool:
        """Delete a specific version of a model"""
        model = self.get_model(model_id)
        if model is None:
            return False
        
        result = model.delete_version(version_id)
        if result:
            self._save_registry()
        
        return result
    
    def compare_models(
        self,
        model_ids: List[str],
        metric_names: List[str],
        version_id: Optional[str] = None
    ) -> Dict[str, Dict[str, Any]]:
        """Compare multiple models based on specified metrics"""
        result = {}
        
        for model_id in model_ids:
            model = self.get_model(model_id)
            if model is None:
                continue
            
            # Get specific version or default
            if version_id and version_id in model.versions:
                version = model.versions[version_id]
            else:
                version = model.get_default_version()
            
            if version is None:
                continue
            
            # Extract metrics
            metrics_data = {}
            for metric in metric_names:
                if metric in version.metrics:
                    metrics_data[metric] = version.metrics[metric]
            
            result[model_id] = {
                "name": model.name,
                "version_id": version.version_id,
                "metrics": metrics_data,
                "created_at": version.created_at.isoformat()
            }
        
        return result
    
    def get_best_model(
        self,
        metric_name: str,
        higher_is_better: bool = True,
        tags: Optional[List[str]] = None,
        model_type: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Get the best model based on a specific metric"""
        # Filter models
        models = self.list_models(tags=tags, model_type=model_type)
        
        if not models:
            return None
        
        # Find best model
        best_model = None
        best_version = None
        best_value = float('-inf') if higher_is_better else float('inf')
        
        for model in models:
            version = model.get_best_version(metric_name, higher_is_better)
            if version is None:
                continue
            
            metric_value = version.metrics.get(metric_name)
            if metric_value is None:
                continue
            
            if (higher_is_better and metric_value > best_value) or \
               (not higher_is_better and metric_value < best_value):
                best_model = model
                best_version = version
                best_value = metric_value
        
        if best_model is None or best_version is None:
            return None
        
        return {
            "model_id": best_model.model_id,
            "name": best_model.name,
            "version_id": best_version.version_id,
            "metric_name": metric_name,
            "metric_value": best_value,
            "model_path": best_version.model_path
        }

# API endpoints for model registry are defined in ml-server/api/model_registry_api.py
