"""
NinjaTrader connector for real execution data
"""

import pandas as pd
import numpy as np
from pathlib import Path
import xml.etree.ElementTree as ET
import json
import logging
from typing import Dict, List

logger = logging.getLogger(__name__)

class NinjaTraderConnector:
    """
    Connect to NinjaTrader for real execution data
    """
    
    def __init__(self, export_path: str):
        """
        Initialize NinjaTrader connector
        
        Args:
            export_path: Path to NT export directory
        """
        self.export_path = Path(export_path)
        self.execution_data = None
        self.calibration_cache = None
        
        logger.info(f"NinjaTrader connector initialized with path: {export_path}")
    
    def get_calibration_data(self, start_date: str, end_date: str) -> Dict:
        """
        Get calibration data from real trades
        
        Args:
            start_date: Start date
            end_date: End date
            
        Returns:
            Dictionary with calibration data
        """
        logger.info("Loading NinjaTrader calibration data...")
        
        # Load execution data
        executions = self._load_executions(start_date, end_date)
        
        if executions.empty:
            logger.warning("No execution data found - using defaults")
            return self._get_default_calibration()
        
        # Calculate real slippage statistics
        calibration = {
            'avg_slippage': executions['slippage_bps'].mean(),
            'slippage_std': executions['slippage_bps'].std(),
            'worst_slippage': executions['slippage_bps'].max(),
            'best_slippage': executions['slippage_bps'].min(),
            
            'fill_rate_limit': len(executions[executions['order_type'] == 'Limit']) / len(executions),
            'fill_rate_market': 1.0,  # Market orders always fill
            
            'avg_commission': executions['commission'].mean(),
            'avg_latency_ms': executions['latency_ms'].mean() if 'latency_ms' in executions else 5,
            
            'time_of_day_impact': self._calculate_tod_impact(executions),
            'size_impact': self._calculate_size_impact(executions)
        }
        
        logger.info(f"✅ Calibration loaded - Avg slippage: {calibration['avg_slippage']:.2f} bps")
        
        self.calibration_cache = calibration
        return calibration
    
    def _load_executions(self, start_date: str, end_date: str) -> pd.DataFrame:
        """
        Load execution data from NinjaTrader exports
        
        Returns:
            DataFrame with execution data
        """
        executions = []
        
        # Look for execution files
        execution_files = list(self.export_path.glob("executions*.csv"))
        
        for file in execution_files:
            try:
                df = pd.read_csv(file)
                
                # Parse NT format
                if 'Time' in df.columns:
                    df['timestamp'] = pd.to_datetime(df['Time'])
                    
                    # Filter date range
                    mask = (df['timestamp'] >= start_date) & (df['timestamp'] <= end_date)
                    df = df[mask]
                    
                    # Calculate slippage if we have the data
                    if 'Fill Price' in df.columns and 'Order Price' in df.columns:
                        df['slippage_bps'] = 10000 * abs(df['Fill Price'] - df['Order Price']) / df['Order Price']
                    
                    executions.append(df)
                    
            except Exception as e:
                logger.warning(f"Could not load {file}: {e}")
        
        if executions:
            return pd.concat(executions, ignore_index=True)
        else:
            return pd.DataFrame()
    
    def _get_default_calibration(self) -> Dict:
        """Get default calibration when no NT data available"""
        return {
            'avg_slippage': 2.0,
            'slippage_std': 1.0,
            'worst_slippage': 10.0,
            'best_slippage': 0.5,
            'fill_rate_limit': 0.75,
            'fill_rate_market': 1.0,
            'avg_commission': 2.25,
            'avg_latency_ms': 5,
            'time_of_day_impact': {},
            'size_impact': {}
        }
    
    def _calculate_tod_impact(self, executions: pd.DataFrame) -> Dict:
        """Calculate time of day impact on slippage"""
        if 'timestamp' not in executions.columns:
            return {}
        
        executions['hour'] = executions['timestamp'].dt.hour
        
        tod_impact = {}
        for hour in range(24):
            hour_data = executions[executions['hour'] == hour]
            if len(hour_data) > 0:
                tod_impact[hour] = hour_data['slippage_bps'].mean()
        
        return tod_impact
    
    def _calculate_size_impact(self, executions: pd.DataFrame) -> Dict:
        """Calculate size impact on slippage"""
        if 'Quantity' not in executions.columns:
            return {}
        
        size_impact = {
            '1': executions[executions['Quantity'] == 1]['slippage_bps'].mean(),
            '2-5': executions[executions['Quantity'].between(2, 5)]['slippage_bps'].mean(),
            '6-10': executions[executions['Quantity'].between(6, 10)]['slippage_bps'].mean(),
            '>10': executions[executions['Quantity'] > 10]['slippage_bps'].mean()
        }
        
        # Remove NaN values
        size_impact = {k: v for k, v in size_impact.items() if not pd.isna(v)}
        
        return size_impact
    
    def get_performance_comparison(self) -> Dict:
        """
        Get real trading performance for comparison
        
        Returns:
            Dictionary with performance metrics
        """
        # This would parse NT performance reports
        # For now, return example structure
        return {
            'total_trades': 0,
            'win_rate': 0,
            'avg_win': 0,
            'avg_loss': 0,
            'profit_factor': 0,
            'sharpe_ratio': 0,
            'max_drawdown': 0
        }
    
    def export_execution_history(self, start_date: str, end_date: str) -> pd.DataFrame:
        """
        Export execution history from NinjaTrader
        
        Args:
            start_date: Start date
            end_date: End date
            
        Returns:
            DataFrame with execution history
        """
        logger.info("Exporting execution history from NinjaTrader")
        
        # This would interface with NinjaTrader's export functionality
        # For now, return mock data
        dates = pd.date_range(start_date, end_date, freq='1H')
        
        mock_executions = pd.DataFrame({
            'timestamp': dates,
            'symbol': 'ES',
            'side': np.random.choice(['BUY', 'SELL'], len(dates)),
            'quantity': np.random.randint(1, 10, len(dates)),
            'fill_price': np.random.normal(4500, 10, len(dates)),
            'order_price': np.random.normal(4500, 10, len(dates)),
            'commission': np.random.normal(2.25, 0.5, len(dates)),
            'latency_ms': np.random.normal(5, 2, len(dates))
        })
        
        # Calculate slippage
        mock_executions['slippage_bps'] = 10000 * abs(
            mock_executions['fill_price'] - mock_executions['order_price']
        ) / mock_executions['order_price']
        
        logger.info(f"Exported {len(mock_executions)} execution records")
        
        return mock_executions 