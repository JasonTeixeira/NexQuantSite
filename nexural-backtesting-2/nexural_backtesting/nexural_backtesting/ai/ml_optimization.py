"""
Machine Learning Optimization and AutoML

This module provides advanced ML optimization capabilities including
hyperparameter tuning, feature selection, model ensembling, and AutoML pipelines.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any, Tuple, Union, Callable
from dataclasses import dataclass, field
from enum import Enum
import logging
from datetime import datetime, timedelta
import joblib
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# ML Libraries
try:
    from sklearn.model_selection import GridSearchCV, RandomizedSearchCV, cross_val_score
    from sklearn.feature_selection import SelectKBest, f_classif, f_regression, RFE, SelectFromModel
    from sklearn.ensemble import VotingClassifier, VotingRegressor, StackingClassifier, StackingRegressor
    from sklearn.metrics import make_scorer, accuracy_score, f1_score, r2_score, mean_squared_error
    import optuna
    from optuna.samplers import TPESampler
    from optuna.pruners import MedianPruner
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    logging.warning("⚠️ ML optimization libraries not available. Install with: pip install scikit-learn optuna")

from .ml_models import MLModelManager, ModelConfig, ModelType, ModelName, PredictionResult

logger = logging.getLogger(__name__)


class OptimizationMethod(Enum):
    """Optimization methods"""
    GRID_SEARCH = "grid_search"
    RANDOM_SEARCH = "random_search"
    BAYESIAN = "bayesian"
    GENETIC = "genetic"
    HYPERBAND = "hyperband"


@dataclass
class OptimizationConfig:
    """Optimization configuration"""
    method: OptimizationMethod
    n_trials: int = 100
    cv_folds: int = 5
    scoring: str = "f1"  # or "accuracy", "r2", "neg_mean_squared_error"
    timeout: int = 3600  # seconds
    n_jobs: int = -1
    random_state: int = 42
    early_stopping: bool = True
    patience: int = 10


@dataclass
class OptimizationResult:
    """Optimization result"""
    best_params: Dict[str, Any]
    best_score: float
    best_model: Any
    optimization_history: List[Dict[str, Any]] = field(default_factory=list)
    feature_importance: Optional[Dict[str, float]] = None
    optimization_time: float = 0.0
    n_trials_completed: int = 0
    success: bool = True
    error_message: Optional[str] = None


class HyperparameterOptimizer:
    """Hyperparameter optimization using various methods"""
    
    def __init__(self, config: OptimizationConfig):
        """Initialize hyperparameter optimizer"""
        if not ML_AVAILABLE:
            raise ImportError("ML optimization libraries not available")
        
        self.config = config
        self.best_result = None
        
    def optimize(self, model_manager: MLModelManager, 
                X: pd.DataFrame, y: pd.Series) -> OptimizationResult:
        """Optimize hyperparameters"""
        import time
        start_time = time.time()
        
        try:
            if self.config.method == OptimizationMethod.GRID_SEARCH:
                result = self._grid_search_optimization(model_manager, X, y)
            elif self.config.method == OptimizationMethod.RANDOM_SEARCH:
                result = self._random_search_optimization(model_manager, X, y)
            elif self.config.method == OptimizationMethod.BAYESIAN:
                result = self._bayesian_optimization(model_manager, X, y)
            else:
                raise ValueError(f"Unsupported optimization method: {self.config.method}")
            
            result.optimization_time = time.time() - start_time
            self.best_result = result
            
            return result
            
        except Exception as e:
            logger.error(f"Optimization failed: {e}")
            return OptimizationResult(
                best_params={},
                best_score=0.0,
                best_model=None,
                success=False,
                error_message=str(e)
            )
    
    def _grid_search_optimization(self, model_manager: MLModelManager, 
                                X: pd.DataFrame, y: pd.Series) -> OptimizationResult:
        """Grid search optimization"""
        # Define parameter grid based on model type
        param_grid = self._get_parameter_grid(model_manager.config.model_name)
        
        # Create base model
        base_model = model_manager.create_model()
        
        # Perform grid search
        grid_search = GridSearchCV(
            estimator=base_model,
            param_grid=param_grid,
            cv=self.config.cv_folds,
            scoring=self.config.scoring,
            n_jobs=self.config.n_jobs,
            verbose=1
        )
        
        grid_search.fit(X, y)
        
        return OptimizationResult(
            best_params=grid_search.best_params_,
            best_score=grid_search.best_score_,
            best_model=grid_search.best_estimator_,
            optimization_history=[{
                'params': params,
                'score': score
            } for params, score in zip(grid_search.cv_results_['params'], 
                                     grid_search.cv_results_['mean_test_score'])]
        )
    
    def _random_search_optimization(self, model_manager: MLModelManager, 
                                  X: pd.DataFrame, y: pd.Series) -> OptimizationResult:
        """Random search optimization"""
        # Define parameter distributions
        param_distributions = self._get_parameter_distributions(model_manager.config.model_name)
        
        # Create base model
        base_model = model_manager.create_model()
        
        # Perform random search
        random_search = RandomizedSearchCV(
            estimator=base_model,
            param_distributions=param_distributions,
            n_iter=self.config.n_trials,
            cv=self.config.cv_folds,
            scoring=self.config.scoring,
            n_jobs=self.config.n_jobs,
            random_state=self.config.random_state,
            verbose=1
        )
        
        random_search.fit(X, y)
        
        return OptimizationResult(
            best_params=random_search.best_params_,
            best_score=random_search.best_score_,
            best_model=random_search.best_estimator_,
            optimization_history=[{
                'params': params,
                'score': score
            } for params, score in zip(random_search.cv_results_['params'], 
                                     random_search.cv_results_['mean_test_score'])]
        )
    
    def _bayesian_optimization(self, model_manager: MLModelManager, 
                             X: pd.DataFrame, y: pd.Series) -> OptimizationResult:
        """Bayesian optimization using Optuna"""
        
        def objective(trial):
            # Suggest hyperparameters
            params = self._suggest_parameters(trial, model_manager.config.model_name)
            
            # Create model with suggested parameters
            model_config = model_manager.config
            model_config.parameters = params
            model = model_manager.create_model()
            
            # Cross-validation
            scores = cross_val_score(
                model, X, y, 
                cv=self.config.cv_folds, 
                scoring=self.config.scoring,
                n_jobs=1
            )
            
            return scores.mean()
        
        # Create study
        study = optuna.create_study(
            direction='maximize',
            sampler=TPESampler(seed=self.config.random_state),
            pruner=MedianPruner() if self.config.early_stopping else None
        )
        
        # Optimize
        study.optimize(
            objective, 
            n_trials=self.config.n_trials,
            timeout=self.config.timeout
        )
        
        # Get best result
        best_params = study.best_params
        best_score = study.best_value
        
        # Create best model
        model_config = model_manager.config
        model_config.parameters = best_params
        best_model = model_manager.create_model()
        best_model.fit(X, y)
        
        return OptimizationResult(
            best_params=best_params,
            best_score=best_score,
            best_model=best_model,
            optimization_history=[{
                'params': trial.params,
                'score': trial.value
            } for trial in study.trials if trial.value is not None],
            n_trials_completed=len(study.trials)
        )
    
    def _get_parameter_grid(self, model_name: ModelName) -> Dict[str, List]:
        """Get parameter grid for grid search"""
        if model_name == ModelName.RANDOM_FOREST_CLASSIFIER:
            return {
                'n_estimators': [50, 100, 200],
                'max_depth': [None, 10, 20, 30],
                'min_samples_split': [2, 5, 10],
                'min_samples_leaf': [1, 2, 4]
            }
        elif model_name == ModelName.XGBOOST_CLASSIFIER:
            return {
                'n_estimators': [50, 100, 200],
                'max_depth': [3, 6, 9],
                'learning_rate': [0.01, 0.1, 0.3],
                'subsample': [0.8, 0.9, 1.0]
            }
        elif model_name == ModelName.LIGHTGBM_CLASSIFIER:
            return {
                'n_estimators': [50, 100, 200],
                'max_depth': [3, 6, 9],
                'learning_rate': [0.01, 0.1, 0.3],
                'num_leaves': [31, 62, 127]
            }
        else:
            return {}
    
    def _get_parameter_distributions(self, model_name: ModelName) -> Dict[str, Any]:
        """Get parameter distributions for random search"""
        if model_name == ModelName.RANDOM_FOREST_CLASSIFIER:
            return {
                'n_estimators': [50, 100, 200, 300],
                'max_depth': [None, 10, 20, 30, 40],
                'min_samples_split': [2, 5, 10, 15],
                'min_samples_leaf': [1, 2, 4, 8]
            }
        elif model_name == ModelName.XGBOOST_CLASSIFIER:
            return {
                'n_estimators': [50, 100, 200, 300],
                'max_depth': [3, 6, 9, 12],
                'learning_rate': [0.01, 0.05, 0.1, 0.3],
                'subsample': [0.7, 0.8, 0.9, 1.0],
                'colsample_bytree': [0.7, 0.8, 0.9, 1.0]
            }
        else:
            return {}
    
    def _suggest_parameters(self, trial, model_name: ModelName) -> Dict[str, Any]:
        """Suggest parameters for Optuna trial"""
        if model_name == ModelName.RANDOM_FOREST_CLASSIFIER:
            return {
                'n_estimators': trial.suggest_int('n_estimators', 50, 300),
                'max_depth': trial.suggest_int('max_depth', 3, 30),
                'min_samples_split': trial.suggest_int('min_samples_split', 2, 20),
                'min_samples_leaf': trial.suggest_int('min_samples_leaf', 1, 10)
            }
        elif model_name == ModelName.XGBOOST_CLASSIFIER:
            return {
                'n_estimators': trial.suggest_int('n_estimators', 50, 300),
                'max_depth': trial.suggest_int('max_depth', 3, 12),
                'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3),
                'subsample': trial.suggest_float('subsample', 0.7, 1.0),
                'colsample_bytree': trial.suggest_float('colsample_bytree', 0.7, 1.0)
            }
        else:
            return {}


class FeatureSelector:
    """Feature selection methods"""
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize feature selector"""
        self.config = config or {}
        
    def select_features(self, X: pd.DataFrame, y: pd.Series, 
                       method: str = "kbest", **kwargs) -> Tuple[pd.DataFrame, List[str]]:
        """Select features using specified method"""
        if method == "kbest":
            return self._kbest_selection(X, y, **kwargs)
        elif method == "rfe":
            return self._rfe_selection(X, y, **kwargs)
        elif method == "from_model":
            return self._from_model_selection(X, y, **kwargs)
        else:
            raise ValueError(f"Unsupported feature selection method: {method}")
    
    def _kbest_selection(self, X: pd.DataFrame, y: pd.Series, 
                        k: int = 10, score_func: str = "f_classif") -> Tuple[pd.DataFrame, List[str]]:
        """K-best feature selection"""
        if score_func == "f_classif":
            selector = SelectKBest(score_func=f_classif, k=k)
        elif score_func == "f_regression":
            selector = SelectKBest(score_func=f_regression, k=k)
        else:
            raise ValueError(f"Unsupported score function: {score_func}")
        
        X_selected = selector.fit_transform(X, y)
        selected_features = X.columns[selector.get_support()].tolist()
        
        return pd.DataFrame(X_selected, columns=selected_features, index=X.index), selected_features
    
    def _rfe_selection(self, X: pd.DataFrame, y: pd.Series, 
                      n_features: int = 10, estimator=None) -> Tuple[pd.DataFrame, List[str]]:
        """Recursive feature elimination"""
        if estimator is None:
            from sklearn.ensemble import RandomForestClassifier
            estimator = RandomForestClassifier(n_estimators=100, random_state=42)
        
        selector = RFE(estimator=estimator, n_features_to_select=n_features)
        X_selected = selector.fit_transform(X, y)
        selected_features = X.columns[selector.get_support()].tolist()
        
        return pd.DataFrame(X_selected, columns=selected_features, index=X.index), selected_features
    
    def _from_model_selection(self, X: pd.DataFrame, y: pd.Series, 
                            estimator=None, threshold: str = "median") -> Tuple[pd.DataFrame, List[str]]:
        """Feature selection from model"""
        if estimator is None:
            from sklearn.ensemble import RandomForestClassifier
            estimator = RandomForestClassifier(n_estimators=100, random_state=42)
        
        selector = SelectFromModel(estimator=estimator, threshold=threshold)
        X_selected = selector.fit_transform(X, y)
        selected_features = X.columns[selector.get_support()].tolist()
        
        return pd.DataFrame(X_selected, columns=selected_features, index=X.index), selected_features


class ModelEnsemble:
    """Model ensemble methods"""
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize model ensemble"""
        self.config = config or {}
        
    def create_ensemble(self, models: List[Tuple[str, Any]], 
                       method: str = "voting", **kwargs) -> Any:
        """Create ensemble model"""
        if method == "voting":
            return self._create_voting_ensemble(models, **kwargs)
        elif method == "stacking":
            return self._create_stacking_ensemble(models, **kwargs)
        else:
            raise ValueError(f"Unsupported ensemble method: {method}")
    
    def _create_voting_ensemble(self, models: List[Tuple[str, Any]], 
                              voting: str = "soft") -> Any:
        """Create voting ensemble"""
        if voting == "soft":
            return VotingClassifier(
                estimators=models,
                voting='soft'
            )
        else:
            return VotingClassifier(
                estimators=models,
                voting='hard'
            )
    
    def _create_stacking_ensemble(self, models: List[Tuple[str, Any]], 
                                final_estimator=None) -> Any:
        """Create stacking ensemble"""
        if final_estimator is None:
            from sklearn.linear_model import LogisticRegression
            final_estimator = LogisticRegression()
        
        return StackingClassifier(
            estimators=models,
            final_estimator=final_estimator,
            cv=5
        )


class AutoMLPipeline:
    """Automated Machine Learning Pipeline"""
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize AutoML pipeline"""
        self.config = config or {}
        self.feature_selector = FeatureSelector()
        self.optimizer = None
        self.ensemble = ModelEnsemble()
        self.best_pipeline = None
        
    def run_automl(self, X: pd.DataFrame, y: pd.Series, 
                   task_type: str = "classification") -> Dict[str, Any]:
        """Run complete AutoML pipeline"""
        logger.info("Starting AutoML pipeline...")
        
        results = {
            'feature_selection': {},
            'model_optimization': {},
            'ensemble': {},
            'final_pipeline': None
        }
        
        try:
            # Step 1: Feature Selection
            logger.info("Step 1: Feature Selection")
            X_selected, selected_features = self.feature_selector.select_features(
                X, y, method="kbest", k=min(20, X.shape[1])
            )
            results['feature_selection'] = {
                'selected_features': selected_features,
                'n_features': len(selected_features)
            }
            
            # Step 2: Model Optimization
            logger.info("Step 2: Model Optimization")
            optimization_config = OptimizationConfig(
                method=OptimizationMethod.BAYESIAN,
                n_trials=50,
                scoring="f1" if task_type == "classification" else "r2"
            )
            
            self.optimizer = HyperparameterOptimizer(optimization_config)
            
            # Test multiple models
            models_to_test = [
                ModelName.RANDOM_FOREST_CLASSIFIER,
                ModelName.XGBOOST_CLASSIFIER,
                ModelName.LIGHTGBM_CLASSIFIER
            ] if task_type == "classification" else [
                ModelName.RANDOM_FOREST_REGRESSOR,
                ModelName.XGBOOST_REGRESSOR,
                ModelName.LIGHTGBM_REGRESSOR
            ]
            
            best_model_result = None
            best_score = -np.inf
            
            for model_name in models_to_test:
                logger.info(f"Optimizing {model_name.value}")
                
                model_config = ModelConfig(
                    model_type=ModelType.CLASSIFICATION if task_type == "classification" else ModelType.REGRESSION,
                    model_name=model_name
                )
                
                model_manager = MLModelManager(model_config)
                result = self.optimizer.optimize(model_manager, X_selected, y)
                
                if result.success and result.best_score > best_score:
                    best_score = result.best_score
                    best_model_result = result
            
            results['model_optimization'] = {
                'best_model': best_model_result.best_model.__class__.__name__,
                'best_score': best_model_result.best_score,
                'best_params': best_model_result.best_params
            }
            
            # Step 3: Ensemble Creation
            logger.info("Step 3: Creating Ensemble")
            ensemble_models = [
                (f"optimized_{best_model_result.best_model.__class__.__name__}", 
                 best_model_result.best_model)
            ]
            
            # Add other models with default parameters
            for model_name in models_to_test:
                if model_name != best_model_result.best_model.__class__.__name__:
                    model_config = ModelConfig(
                        model_type=ModelType.CLASSIFICATION if task_type == "classification" else ModelType.REGRESSION,
                        model_name=model_name
                    )
                    model_manager = MLModelManager(model_config)
                    ensemble_models.append((model_name.value, model_manager.create_model()))
            
            final_ensemble = self.ensemble.create_ensemble(ensemble_models, method="voting")
            final_ensemble.fit(X_selected, y)
            
            results['ensemble'] = {
                'ensemble_type': 'voting',
                'n_models': len(ensemble_models)
            }
            
            # Store final pipeline
            self.best_pipeline = {
                'feature_selector': self.feature_selector,
                'selected_features': selected_features,
                'ensemble': final_ensemble
            }
            
            results['final_pipeline'] = self.best_pipeline
            
            logger.info("AutoML pipeline completed successfully")
            return results
            
        except Exception as e:
            logger.error(f"AutoML pipeline failed: {e}")
            return {
                'error': str(e),
                'success': False
            }
    
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """Make predictions using the best pipeline"""
        if self.best_pipeline is None:
            raise ValueError("No trained pipeline available. Run run_automl() first.")
        
        # Apply feature selection
        X_selected = X[self.best_pipeline['selected_features']]
        
        # Make ensemble prediction
        return self.best_pipeline['ensemble'].predict(X_selected)
    
    def save_pipeline(self, filepath: str):
        """Save the trained pipeline"""
        if self.best_pipeline is None:
            raise ValueError("No pipeline to save")
        
        joblib.dump(self.best_pipeline, filepath)
        logger.info(f"Pipeline saved to {filepath}")
    
    def load_pipeline(self, filepath: str):
        """Load a trained pipeline"""
        self.best_pipeline = joblib.load(filepath)
        logger.info(f"Pipeline loaded from {filepath}")


class MLOptimizer:
    """Main ML optimization orchestrator"""
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize ML optimizer"""
        self.config = config or {}
        self.hyperparameter_optimizer = None
        self.feature_selector = FeatureSelector()
        self.model_ensemble = ModelEnsemble()
        self.automl_pipeline = AutoMLPipeline()
        
    def optimize_model(self, model_manager: MLModelManager, 
                      X: pd.DataFrame, y: pd.Series,
                      optimization_config: OptimizationConfig) -> OptimizationResult:
        """Optimize a single model"""
        self.hyperparameter_optimizer = HyperparameterOptimizer(optimization_config)
        return self.hyperparameter_optimizer.optimize(model_manager, X, y)
    
    def select_features(self, X: pd.DataFrame, y: pd.Series, 
                       method: str = "kbest", **kwargs) -> Tuple[pd.DataFrame, List[str]]:
        """Select features"""
        return self.feature_selector.select_features(X, y, method, **kwargs)
    
    def create_ensemble(self, models: List[Tuple[str, Any]], 
                       method: str = "voting", **kwargs) -> Any:
        """Create ensemble"""
        return self.model_ensemble.create_ensemble(models, method, **kwargs)
    
    def run_automl(self, X: pd.DataFrame, y: pd.Series, 
                   task_type: str = "classification") -> Dict[str, Any]:
        """Run AutoML pipeline"""
        return self.automl_pipeline.run_automl(X, y, task_type)
