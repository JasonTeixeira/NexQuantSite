#!/usr/bin/env python3
"""
MODEL REGISTRY API
RESTful API endpoints for the model registry system
"""

import os
from datetime import datetime
from typing import Dict, List, Optional, Any, Union

from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form, Body, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# Import the model registry
import sys
import os.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from model_registry import ModelRegistry, ModelVersion, ModelDefinition

# Initialize the model registry
# In production, this would be configured via environment variables
REGISTRY_DIR = os.environ.get("MODEL_REGISTRY_DIR", "./registry")
registry = ModelRegistry(REGISTRY_DIR)

# Initialize FastAPI app
app = FastAPI(
    title="ML Model Registry API",
    description="API for managing ML models with versioning and metadata",
    version="1.0.0",
)

# ----- Pydantic models for request/response validation -----

class ModelVersionBase(BaseModel):
    """Base model for version data"""
    version_id: str
    model_path: str
    created_at: datetime
    metrics: Dict[str, float] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    is_active: bool = False
    training_data_hash: Optional[str] = None
    
    class Config:
        orm_mode = True


class ModelDefinitionBase(BaseModel):
    """Base model for model definition data"""
    model_id: str
    name: str
    description: str = ""
    tags: List[str] = Field(default_factory=list)
    model_type: str = "unknown"
    created_at: datetime
    updated_at: datetime
    default_version_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        orm_mode = True


class ModelDefinitionDetail(ModelDefinitionBase):
    """Detailed model definition including versions"""
    versions: Dict[str, ModelVersionBase] = Field(default_factory=dict)


class ModelDefinitionCreate(BaseModel):
    """Data needed to create a new model definition"""
    name: str
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    model_type: Optional[str] = None
    model_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class ModelVersionCreate(BaseModel):
    """Data needed to create a new model version"""
    model_path: str
    metrics: Optional[Dict[str, float]] = None
    metadata: Optional[Dict[str, Any]] = None
    version_id: Optional[str] = None
    is_active: bool = False
    training_data_hash: Optional[str] = None


class ModelComparisonRequest(BaseModel):
    """Request data for comparing models"""
    model_ids: List[str]
    metric_names: List[str]
    version_id: Optional[str] = None


class ErrorResponse(BaseModel):
    """Standard error response"""
    detail: str
    status_code: int
    timestamp: datetime = Field(default_factory=datetime.now)


# ----- Helper functions -----

def model_definition_to_pydantic(model: ModelDefinition, include_versions: bool = True) -> Union[ModelDefinitionBase, ModelDefinitionDetail]:
    """Convert ModelDefinition to Pydantic model"""
    data = model.to_dict(include_versions=include_versions)
    
    if include_versions:
        return ModelDefinitionDetail(**data)
    else:
        return ModelDefinitionBase(**data)


def model_version_to_pydantic(version: ModelVersion) -> ModelVersionBase:
    """Convert ModelVersion to Pydantic model"""
    return ModelVersionBase(**version.to_dict())


# ----- API Routes -----

@app.get("/", tags=["General"])
async def root():
    """Root endpoint - provides API information"""
    return {
        "name": "ML Model Registry API",
        "version": "1.0.0",
        "description": "API for managing ML models with versioning and metadata",
        "docs_url": "/docs"
    }


@app.get("/health", tags=["General"])
async def health_check():
    """Health check endpoint"""
    try:
        # Check if registry is initialized
        model_count = len(registry.list_models())
        return {
            "status": "operational",
            "timestamp": datetime.now().isoformat(),
            "registry_dir": REGISTRY_DIR,
            "model_count": model_count
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e)}
        )


# ----- Model Routes -----

@app.post("/models", response_model=ModelDefinitionBase, tags=["Models"])
async def create_model(model_data: ModelDefinitionCreate):
    """Create a new model definition"""
    try:
        model = registry.register_model(
            name=model_data.name,
            description=model_data.description,
            tags=model_data.tags,
            model_type=model_data.model_type,
            model_id=model_data.model_id,
            metadata=model_data.metadata
        )
        return model_definition_to_pydantic(model, include_versions=False)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create model: {str(e)}")


@app.get("/models", response_model=List[ModelDefinitionBase], tags=["Models"])
async def list_models(
    tags: Optional[List[str]] = Query(None),
    model_type: Optional[str] = None,
    name_contains: Optional[str] = None
):
    """List all models with optional filtering"""
    try:
        models = registry.list_models(
            tags=tags,
            model_type=model_type,
            name_contains=name_contains
        )
        return [model_definition_to_pydantic(model, include_versions=False) for model in models]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list models: {str(e)}")


@app.get("/models/{model_id}", response_model=ModelDefinitionDetail, tags=["Models"])
async def get_model(model_id: str):
    """Get a specific model by ID"""
    model = registry.get_model(model_id)
    if model is None:
        raise HTTPException(status_code=404, detail=f"Model with ID {model_id} not found")
    
    return model_definition_to_pydantic(model, include_versions=True)


@app.delete("/models/{model_id}", tags=["Models"])
async def delete_model(model_id: str):
    """Delete a model and all its versions"""
    success = registry.delete_model(model_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Model with ID {model_id} not found")
    
    return {"message": f"Model {model_id} deleted successfully"}


# ----- Version Routes -----

@app.post("/models/{model_id}/versions", response_model=ModelVersionBase, tags=["Versions"])
async def create_version(model_id: str, version_data: ModelVersionCreate):
    """Add a new version to a model"""
    try:
        version = registry.add_model_version(
            model_id=model_id,
            model_path=version_data.model_path,
            metrics=version_data.metrics,
            metadata=version_data.metadata,
            version_id=version_data.version_id,
            is_active=version_data.is_active,
            training_data_hash=version_data.training_data_hash
        )
        return model_version_to_pydantic(version)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create version: {str(e)}")


@app.get("/models/{model_id}/versions/{version_id}", response_model=ModelVersionBase, tags=["Versions"])
async def get_version(model_id: str, version_id: str):
    """Get a specific version of a model"""
    version = registry.get_model_version(model_id, version_id)
    if version is None:
        raise HTTPException(status_code=404, detail=f"Version {version_id} of model {model_id} not found")
    
    return model_version_to_pydantic(version)


@app.delete("/models/{model_id}/versions/{version_id}", tags=["Versions"])
async def delete_version(model_id: str, version_id: str):
    """Delete a specific version of a model"""
    success = registry.delete_model_version(model_id, version_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Version {version_id} of model {model_id} not found")
    
    return {"message": f"Version {version_id} of model {model_id} deleted successfully"}


@app.post("/models/{model_id}/versions/{version_id}/set-default", tags=["Versions"])
async def set_default_version(model_id: str, version_id: str):
    """Set a version as the default for a model"""
    try:
        registry.set_default_version(model_id, version_id)
        return {"message": f"Version {version_id} set as default for model {model_id}"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/models/{model_id}/default-version", response_model=ModelVersionBase, tags=["Versions"])
async def get_default_version(model_id: str):
    """Get the default version of a model"""
    model = registry.get_model(model_id)
    if model is None:
        raise HTTPException(status_code=404, detail=f"Model with ID {model_id} not found")
    
    version = model.get_default_version()
    if version is None:
        raise HTTPException(status_code=404, detail=f"No default version set for model {model_id}")
    
    return model_version_to_pydantic(version)


# ----- Analysis Routes -----

@app.post("/models/compare", tags=["Analysis"])
async def compare_models(comparison: ModelComparisonRequest):
    """Compare multiple models based on specified metrics"""
    result = registry.compare_models(
        model_ids=comparison.model_ids,
        metric_names=comparison.metric_names,
        version_id=comparison.version_id
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="No matching models found for comparison")
    
    return result


@app.get("/models/best", tags=["Analysis"])
async def get_best_model(
    metric_name: str,
    higher_is_better: bool = True,
    tags: Optional[List[str]] = Query(None),
    model_type: Optional[str] = None
):
    """Get the best model based on a specific metric"""
    result = registry.get_best_model(
        metric_name=metric_name,
        higher_is_better=higher_is_better,
        tags=tags,
        model_type=model_type
    )
    
    if result is None:
        raise HTTPException(
            status_code=404, 
            detail=f"No models found with metric '{metric_name}'"
        )
    
    return result


# ----- File Upload Routes -----

@app.post("/models/{model_id}/upload", tags=["File Operations"])
async def upload_model_file(
    model_id: str,
    file: UploadFile = File(...),
    version_id: Optional[str] = Form(None),
    is_active: bool = Form(False),
    metrics: Optional[str] = Form(None),  # JSON string of metrics
    metadata: Optional[str] = Form(None)  # JSON string of metadata
):
    """Upload a model file and create a new version"""
    import json
    import tempfile
    import shutil
    
    model = registry.get_model(model_id)
    if model is None:
        raise HTTPException(status_code=404, detail=f"Model with ID {model_id} not found")
    
    try:
        # Parse metrics and metadata
        metrics_dict = json.loads(metrics) if metrics else {}
        metadata_dict = json.loads(metadata) if metadata else {}
        
        # Save file to models directory
        timestamp = int(datetime.now().timestamp() * 1000)
        filename = f"{model_id}_{timestamp}_{file.filename}"
        file_path = os.path.join(registry.models_dir, filename)
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            shutil.copyfileobj(file.file, temp_file)
        
        # Move to final location
        shutil.move(temp_file.name, file_path)
        
        # Create version
        version = registry.add_model_version(
            model_id=model_id,
            model_path=file_path,
            metrics=metrics_dict,
            metadata=metadata_dict,
            version_id=version_id,
            is_active=is_active
        )
        
        return model_version_to_pydantic(version)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload model file: {str(e)}")


# Run the FastAPI application directly when script is executed
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
