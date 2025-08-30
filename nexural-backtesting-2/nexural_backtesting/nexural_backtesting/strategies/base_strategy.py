"""
Base strategy interface
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Any

class BaseStrategy(ABC):
    """
    Abstract base class for all strategies
    """
    
    def __init__(self):
        """Initialize strategy"""
        self.parameters = self.get_default_parameters()
        
    @abstractmethod
    def get_default_parameters(self) -> Dict:
        """Get default parameters for the strategy"""
        pass
    
    @abstractmethod
    def generate_signal(self, features: Dict) -> float:
        """
        Generate trading signal
        
        Args:
            features: Dictionary with market features
            
        Returns:
            Signal strength (-1 to 1)
        """
        pass
    
    def update_parameters(self, params: Dict):
        """Update strategy parameters"""
        self.parameters.update(params)
    
    def get_parameter_grid(self) -> List[Dict]:
        """Get parameter grid for optimization"""
        return [self.get_default_parameters()]
    
    def get_strategy_info(self) -> Dict:
        """Get strategy information"""
        return {
            'name': self.__class__.__name__,
            'description': self.__doc__ or 'No description available',
            'parameters': self.parameters,
            'type': 'unknown'
        }
    
    def validate_parameters(self, params: Dict) -> bool:
        """Validate strategy parameters"""
        default_params = self.get_default_parameters()
        
        for key in params:
            if key not in default_params:
                return False
        
        return True
    
    def get_risk_metrics(self) -> Dict:
        """Get strategy-specific risk metrics"""
        return {
            'max_position_size': 1.0,
            'max_drawdown': 0.10,
            'stop_loss': 0.02,
            'take_profit': 0.05
        } 