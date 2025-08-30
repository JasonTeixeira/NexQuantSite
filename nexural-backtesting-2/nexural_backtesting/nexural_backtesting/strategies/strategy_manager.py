"""
Strategy Management System for Enterprise Quantitative Backtesting Engine

This module provides a comprehensive strategy management system that allows users to:
- Save and organize trading strategies
- Store backtest results and performance metrics
- Version control strategies
- Share and collaborate on strategies
- Track strategy evolution over time
"""

import pandas as pd
import numpy as np
import json
import pickle
import sqlite3
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta
from enum import Enum
import logging
import hashlib
import shutil
from copy import deepcopy

from .base_strategy import BaseStrategy
from .backtesting_engine import BacktestResult

logger = logging.getLogger(__name__)


class StrategyStatus(Enum):
    """Strategy status enumeration"""
    DRAFT = "draft"
    TESTING = "testing"
    VALIDATED = "validated"
    PRODUCTION = "production"
    DEPRECATED = "deprecated"
    ARCHIVED = "archived"


class StrategyCategory(Enum):
    """Strategy category enumeration"""
    MOMENTUM = "momentum"
    MEAN_REVERSION = "mean_reversion"
    ARBITRAGE = "arbitrage"
    PAIRS_TRADING = "pairs_trading"
    STATISTICAL_ARBITRAGE = "statistical_arbitrage"
    MARKET_NEUTRAL = "market_neutral"
    TREND_FOLLOWING = "trend_following"
    CONTRARIAN = "contrarian"
    MULTI_FACTOR = "multi_factor"
    MACHINE_LEARNING = "machine_learning"
    CUSTOM = "custom"


@dataclass
class StrategyMetadata:
    """Metadata for a trading strategy"""
    name: str
    description: str
    author: str
    category: StrategyCategory
    status: StrategyStatus
    version: str = "1.0.0"
    created_date: datetime = field(default_factory=datetime.now)
    modified_date: datetime = field(default_factory=datetime.now)
    tags: List[str] = field(default_factory=list)
    instruments: List[str] = field(default_factory=list)
    timeframes: List[str] = field(default_factory=list)
    parameters: Dict[str, Any] = field(default_factory=dict)
    risk_metrics: Dict[str, float] = field(default_factory=dict)
    performance_summary: Dict[str, Any] = field(default_factory=dict)
    notes: str = ""
    is_public: bool = False
    strategy_id: str = ""


@dataclass
class BacktestRecord:
    """Record of a backtest run"""
    backtest_id: str
    strategy_id: str
    run_date: datetime
    start_date: datetime
    end_date: datetime
    instruments: List[str]
    parameters: Dict[str, Any]
    results: BacktestResult
    metadata: Dict[str, Any] = field(default_factory=dict)
    notes: str = ""


@dataclass
class StrategyVersion:
    """Version information for a strategy"""
    version: str
    strategy_id: str
    created_date: datetime
    author: str
    changes: str
    parameters: Dict[str, Any]
    performance_improvement: Optional[float] = None
    is_current: bool = False


class StrategyManager:
    """
    Comprehensive strategy management system
    """
    
    def __init__(self, base_path: str = "strategies"):
        """
        Initialize strategy manager
        
        Args:
            base_path: Base directory for strategy storage
        """
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
        
        # Create directory structure
        self.strategies_path = self.base_path / "strategies"
        self.results_path = self.base_path / "results"
        self.templates_path = self.base_path / "templates"
        self.archives_path = self.base_path / "archives"
        
        for path in [self.strategies_path, self.results_path, self.templates_path, self.archives_path]:
            path.mkdir(exist_ok=True)
        
        # Initialize database
        self.db_path = self.base_path / "strategy_database.db"
        self._init_database()
        
        # Strategy registry
        self.strategy_registry: Dict[str, StrategyMetadata] = {}
        self._load_strategy_registry()
        
        logger.info(f"Strategy manager initialized at {self.base_path}")
    
    def _init_database(self):
        """Initialize SQLite database for strategy management"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Strategies table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS strategies (
                strategy_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                author TEXT,
                category TEXT,
                status TEXT,
                version TEXT,
                created_date TEXT,
                modified_date TEXT,
                tags TEXT,
                instruments TEXT,
                timeframes TEXT,
                parameters TEXT,
                risk_metrics TEXT,
                performance_summary TEXT,
                notes TEXT,
                is_public BOOLEAN,
                file_path TEXT
            )
        ''')
        
        # Backtest results table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS backtest_results (
                backtest_id TEXT PRIMARY KEY,
                strategy_id TEXT,
                run_date TEXT,
                start_date TEXT,
                end_date TEXT,
                instruments TEXT,
                parameters TEXT,
                results_file TEXT,
                metadata TEXT,
                notes TEXT,
                FOREIGN KEY (strategy_id) REFERENCES strategies (strategy_id)
            )
        ''')
        
        # Strategy versions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS strategy_versions (
                version_id TEXT PRIMARY KEY,
                strategy_id TEXT,
                version TEXT,
                created_date TEXT,
                author TEXT,
                changes TEXT,
                parameters TEXT,
                performance_improvement REAL,
                is_current BOOLEAN,
                FOREIGN KEY (strategy_id) REFERENCES strategies (strategy_id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def _load_strategy_registry(self):
        """Load strategy registry from database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM strategies')
        rows = cursor.fetchall()
        
        for row in rows:
            strategy_id = row[0]
            metadata = StrategyMetadata(
                name=row[1],
                description=row[2] or "",
                author=row[3] or "",
                category=StrategyCategory(row[4]) if row[4] else StrategyCategory.CUSTOM,
                status=StrategyStatus(row[5]) if row[5] else StrategyStatus.DRAFT,
                version=row[6] or "1.0.0",
                created_date=datetime.fromisoformat(row[7]) if row[7] else datetime.now(),
                modified_date=datetime.fromisoformat(row[8]) if row[8] else datetime.now(),
                tags=json.loads(row[9]) if row[9] else [],
                instruments=json.loads(row[10]) if row[10] else [],
                timeframes=json.loads(row[11]) if row[11] else [],
                parameters=json.loads(row[12]) if row[12] else {},
                risk_metrics=json.loads(row[13]) if row[13] else {},
                performance_summary=json.loads(row[14]) if row[14] else {},
                notes=row[15] or "",
                is_public=bool(row[16]),
                strategy_id=strategy_id
            )
            self.strategy_registry[strategy_id] = metadata
        
        conn.close()
    
    def save_strategy(
        self,
        strategy: BaseStrategy,
        metadata: StrategyMetadata,
        overwrite: bool = False
    ) -> str:
        """
        Save a strategy to the management system
        
        Args:
            strategy: Strategy object to save
            metadata: Strategy metadata
            overwrite: Whether to overwrite existing strategy
            
        Returns:
            Strategy ID
        """
        # Generate strategy ID
        if not metadata.strategy_id:
            strategy_id = self._generate_strategy_id(metadata.name, metadata.author)
            metadata.strategy_id = strategy_id
        else:
            strategy_id = metadata.strategy_id
        
        # Check if strategy exists
        if strategy_id in self.strategy_registry and not overwrite:
            raise ValueError(f"Strategy {strategy_id} already exists. Use overwrite=True to replace.")
        
        # Update metadata
        metadata.modified_date = datetime.now()
        
        # Save strategy file
        strategy_file = self.strategies_path / f"{strategy_id}.pkl"
        with open(strategy_file, 'wb') as f:
            pickle.dump(strategy, f)
        
        # Save metadata to database
        self._save_metadata_to_db(metadata, str(strategy_file))
        
        # Update registry
        self.strategy_registry[strategy_id] = metadata
        
        logger.info(f"Strategy saved: {strategy_id} ({metadata.name})")
        return strategy_id
    
    def load_strategy(self, strategy_id: str) -> Tuple[BaseStrategy, StrategyMetadata]:
        """
        Load a strategy from the management system
        
        Args:
            strategy_id: Strategy ID to load
            
        Returns:
            Tuple of (strategy, metadata)
        """
        if strategy_id not in self.strategy_registry:
            raise ValueError(f"Strategy {strategy_id} not found")
        
        metadata = self.strategy_registry[strategy_id]
        
        # Load strategy file
        strategy_file = Path(metadata.parameters.get('file_path', ''))
        if not strategy_file.exists():
            strategy_file = self.strategies_path / f"{strategy_id}.pkl"
        
        with open(strategy_file, 'rb') as f:
            strategy = pickle.load(f)
        
        return strategy, metadata
    
    def list_strategies(
        self,
        category: Optional[StrategyCategory] = None,
        status: Optional[StrategyStatus] = None,
        author: Optional[str] = None,
        tags: Optional[List[str]] = None
    ) -> List[StrategyMetadata]:
        """
        List strategies with optional filtering
        
        Args:
            category: Filter by category
            status: Filter by status
            author: Filter by author
            tags: Filter by tags
            
        Returns:
            List of matching strategies
        """
        strategies = list(self.strategy_registry.values())
        
        if category:
            strategies = [s for s in strategies if s.category == category]
        
        if status:
            strategies = [s for s in strategies if s.status == status]
        
        if author:
            strategies = [s for s in strategies if s.author.lower() == author.lower()]
        
        if tags:
            strategies = [s for s in strategies if any(tag in s.tags for tag in tags)]
        
        return strategies
    
    def save_backtest_result(
        self,
        strategy_id: str,
        backtest_result: BacktestResult,
        parameters: Dict[str, Any],
        instruments: List[str],
        start_date: datetime,
        end_date: datetime,
        notes: str = ""
    ) -> str:
        """
        Save backtest result
        
        Args:
            strategy_id: Strategy ID
            backtest_result: Backtest result object
            parameters: Parameters used for backtest
            instruments: Instruments tested
            start_date: Backtest start date
            end_date: Backtest end date
            notes: Additional notes
            
        Returns:
            Backtest ID
        """
        backtest_id = f"BT_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{strategy_id}"
        
        # Save results file
        results_file = self.results_path / f"{backtest_id}.pkl"
        with open(results_file, 'wb') as f:
            pickle.dump(backtest_result, f)
        
        # Save to database
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO backtest_results 
            (backtest_id, strategy_id, run_date, start_date, end_date, instruments, 
             parameters, results_file, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            backtest_id,
            strategy_id,
            datetime.now().isoformat(),
            start_date.isoformat(),
            end_date.isoformat(),
            json.dumps(instruments),
            json.dumps(parameters),
            str(results_file),
            notes
        ))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Backtest result saved: {backtest_id}")
        return backtest_id
    
    def load_backtest_result(self, backtest_id: str) -> BacktestRecord:
        """
        Load backtest result
        
        Args:
            backtest_id: Backtest ID to load
            
        Returns:
            Backtest record
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM backtest_results WHERE backtest_id = ?', (backtest_id,))
        row = cursor.fetchone()
        
        if not row:
            raise ValueError(f"Backtest {backtest_id} not found")
        
        # Load results file
        results_file = Path(row[7])  # results_file column
        with open(results_file, 'rb') as f:
            results = pickle.load(f)
        
        record = BacktestRecord(
            backtest_id=row[0],
            strategy_id=row[1],
            run_date=datetime.fromisoformat(row[2]),
            start_date=datetime.fromisoformat(row[3]),
            end_date=datetime.fromisoformat(row[4]),
            instruments=json.loads(row[5]),
            parameters=json.loads(row[6]),
            results=results,
            metadata=json.loads(row[8]) if row[8] else {},
            notes=row[9] or ""
        )
        
        conn.close()
        return record
    
    def get_strategy_performance_history(self, strategy_id: str) -> List[BacktestRecord]:
        """
        Get performance history for a strategy
        
        Args:
            strategy_id: Strategy ID
            
        Returns:
            List of backtest records
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT backtest_id FROM backtest_results 
            WHERE strategy_id = ? 
            ORDER BY run_date DESC
        ''', (strategy_id,))
        
        backtest_ids = [row[0] for row in cursor.fetchall()]
        conn.close()
        
        return [self.load_backtest_result(bt_id) for bt_id in backtest_ids]
    
    def create_strategy_version(
        self,
        strategy_id: str,
        version: str,
        author: str,
        changes: str,
        parameters: Dict[str, Any],
        performance_improvement: Optional[float] = None
    ) -> str:
        """
        Create a new version of a strategy
        
        Args:
            strategy_id: Strategy ID
            version: New version string
            author: Author of the version
            changes: Description of changes
            parameters: New parameters
            performance_improvement: Expected performance improvement
            
        Returns:
            Version ID
        """
        version_id = f"V_{strategy_id}_{version}"
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Set previous version as not current
        cursor.execute('''
            UPDATE strategy_versions 
            SET is_current = FALSE 
            WHERE strategy_id = ?
        ''', (strategy_id,))
        
        # Insert new version
        cursor.execute('''
            INSERT INTO strategy_versions 
            (version_id, strategy_id, version, created_date, author, changes, 
             parameters, performance_improvement, is_current)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            version_id,
            strategy_id,
            version,
            datetime.now().isoformat(),
            author,
            changes,
            json.dumps(parameters),
            performance_improvement,
            True
        ))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Strategy version created: {version_id}")
        return version_id
    
    def export_strategy(self, strategy_id: str, export_path: str) -> str:
        """
        Export strategy to a file
        
        Args:
            strategy_id: Strategy ID to export
            export_path: Export file path
            
        Returns:
            Export file path
        """
        strategy, metadata = self.load_strategy(strategy_id)
        
        export_data = {
            'strategy': strategy,
            'metadata': asdict(metadata),
            'export_date': datetime.now().isoformat(),
            'version': '1.0'
        }
        
        with open(export_path, 'wb') as f:
            pickle.dump(export_data, f)
        
        logger.info(f"Strategy exported to: {export_path}")
        return export_path
    
    def import_strategy(self, import_path: str, overwrite: bool = False) -> str:
        """
        Import strategy from a file
        
        Args:
            import_path: Import file path
            overwrite: Whether to overwrite existing strategy
            
        Returns:
            Strategy ID
        """
        with open(import_path, 'rb') as f:
            import_data = pickle.load(f)
        
        strategy = import_data['strategy']
        metadata_dict = import_data['metadata']
        
        # Convert metadata dict back to StrategyMetadata
        metadata = StrategyMetadata(**metadata_dict)
        
        return self.save_strategy(strategy, metadata, overwrite)
    
    def delete_strategy(self, strategy_id: str, archive: bool = True) -> bool:
        """
        Delete a strategy
        
        Args:
            strategy_id: Strategy ID to delete
            archive: Whether to archive instead of delete
            
        Returns:
            Success status
        """
        if strategy_id not in self.strategy_registry:
            raise ValueError(f"Strategy {strategy_id} not found")
        
        if archive:
            # Move to archives
            strategy_file = self.strategies_path / f"{strategy_id}.pkl"
            archive_file = self.archives_path / f"{strategy_id}_{datetime.now().strftime('%Y%m%d')}.pkl"
            
            if strategy_file.exists():
                shutil.move(strategy_file, archive_file)
            
            # Update status in database
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE strategies 
                SET status = ?, modified_date = ? 
                WHERE strategy_id = ?
            ''', (StrategyStatus.ARCHIVED.value, datetime.now().isoformat(), strategy_id))
            conn.commit()
            conn.close()
            
            # Update registry
            self.strategy_registry[strategy_id].status = StrategyStatus.ARCHIVED
        else:
            # Permanently delete
            strategy_file = self.strategies_path / f"{strategy_id}.pkl"
            if strategy_file.exists():
                strategy_file.unlink()
            
            # Remove from database
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('DELETE FROM strategies WHERE strategy_id = ?', (strategy_id,))
            conn.commit()
            conn.close()
            
            # Remove from registry
            del self.strategy_registry[strategy_id]
        
        logger.info(f"Strategy {'archived' if archive else 'deleted'}: {strategy_id}")
        return True
    
    def _generate_strategy_id(self, name: str, author: str) -> str:
        """Generate unique strategy ID"""
        base = f"{name}_{author}".replace(" ", "_").lower()
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        return f"{base}_{timestamp}"
    
    def _save_metadata_to_db(self, metadata: StrategyMetadata, file_path: str):
        """Save metadata to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO strategies 
            (strategy_id, name, description, author, category, status, version,
             created_date, modified_date, tags, instruments, timeframes, parameters,
             risk_metrics, performance_summary, notes, is_public, file_path)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            metadata.strategy_id,
            metadata.name,
            metadata.description,
            metadata.author,
            metadata.category.value,
            metadata.status.value,
            metadata.version,
            metadata.created_date.isoformat(),
            metadata.modified_date.isoformat(),
            json.dumps(metadata.tags),
            json.dumps(metadata.instruments),
            json.dumps(metadata.timeframes),
            json.dumps(metadata.parameters),
            json.dumps(metadata.risk_metrics),
            json.dumps(metadata.performance_summary),
            metadata.notes,
            metadata.is_public,
            file_path
        ))
        
        conn.commit()
        conn.close()
    
    def generate_strategy_report(self, strategy_id: str) -> Dict[str, Any]:
        """
        Generate comprehensive strategy report
        
        Args:
            strategy_id: Strategy ID
            
        Returns:
            Strategy report dictionary
        """
        strategy, metadata = self.load_strategy(strategy_id)
        performance_history = self.get_strategy_performance_history(strategy_id)
        
        # Calculate performance statistics
        returns = [record.results.total_return for record in performance_history]
        sharpe_ratios = [record.results.sharpe_ratio for record in performance_history]
        max_drawdowns = [record.results.max_drawdown for record in performance_history]
        
        report = {
            'strategy_info': asdict(metadata),
            'performance_summary': {
                'total_backtests': len(performance_history),
                'average_return': np.mean(returns) if returns else 0,
                'return_std': np.std(returns) if returns else 0,
                'average_sharpe': np.mean(sharpe_ratios) if sharpe_ratios else 0,
                'average_max_drawdown': np.mean(max_drawdowns) if max_drawdowns else 0,
                'best_performance': max(returns) if returns else 0,
                'worst_performance': min(returns) if returns else 0,
                'consistency_score': self._calculate_consistency_score(returns)
            },
            'recent_performance': [
                {
                    'date': record.run_date.isoformat(),
                    'return': record.results.total_return,
                    'sharpe': record.results.sharpe_ratio,
                    'max_drawdown': record.results.max_drawdown,
                    'parameters': record.parameters
                }
                for record in performance_history[:10]  # Last 10 backtests
            ],
            'parameter_evolution': self._analyze_parameter_evolution(performance_history),
            'recommendations': self._generate_recommendations(metadata, performance_history)
        }
        
        return report
    
    def _calculate_consistency_score(self, returns: List[float]) -> float:
        """Calculate consistency score based on return stability"""
        if not returns:
            return 0.0
        
        # Calculate coefficient of variation (lower is better)
        mean_return = np.mean(returns)
        std_return = np.std(returns)
        
        if mean_return == 0:
            return 0.0
        
        cv = std_return / abs(mean_return)
        # Convert to 0-100 scale (lower CV = higher consistency)
        consistency = max(0, 100 - (cv * 100))
        
        return consistency
    
    def _analyze_parameter_evolution(self, performance_history: List[BacktestRecord]) -> Dict[str, Any]:
        """Analyze how parameters have evolved over time"""
        if not performance_history:
            return {}
        
        # Group by parameter changes
        parameter_changes = {}
        
        for i, record in enumerate(performance_history):
            for param, value in record.parameters.items():
                if param not in parameter_changes:
                    parameter_changes[param] = []
                
                parameter_changes[param].append({
                    'date': record.run_date,
                    'value': value,
                    'performance': record.results.total_return
                })
        
        # Analyze trends
        trends = {}
        for param, changes in parameter_changes.items():
            if len(changes) > 1:
                # Calculate correlation between parameter value and performance
                values = [c['value'] for c in changes]
                performances = [c['performance'] for c in changes]
                
                if len(set(values)) > 1:  # Only if parameter actually varies
                    correlation = np.corrcoef(values, performances)[0, 1]
                    trends[param] = {
                        'correlation_with_performance': correlation,
                        'optimal_range': self._find_optimal_range(values, performances),
                        'trend': 'increasing' if correlation > 0.1 else 'decreasing' if correlation < -0.1 else 'stable'
                    }
        
        return trends
    
    def _find_optimal_range(self, values: List[float], performances: List[float]) -> Tuple[float, float]:
        """Find optimal range for a parameter"""
        if not values or not performances:
            return (0, 0)
        
        # Find best performing parameter values
        best_idx = np.argmax(performances)
        best_value = values[best_idx]
        
        # Find range around best value
        sorted_values = sorted(values)
        best_idx_sorted = sorted_values.index(best_value)
        
        # Return range around best value
        range_size = max(1, len(sorted_values) // 4)
        start_idx = max(0, best_idx_sorted - range_size)
        end_idx = min(len(sorted_values), best_idx_sorted + range_size)
        
        return (sorted_values[start_idx], sorted_values[end_idx])
    
    def _generate_recommendations(
        self,
        metadata: StrategyMetadata,
        performance_history: List[BacktestRecord]
    ) -> List[str]:
        """Generate recommendations for strategy improvement"""
        recommendations = []
        
        if not performance_history:
            recommendations.append("No backtest history available. Run initial backtests to establish baseline.")
            return recommendations
        
        # Analyze recent performance
        recent_performance = [record.results.total_return for record in performance_history[:5]]
        avg_recent = np.mean(recent_performance)
        avg_all = np.mean([record.results.total_return for record in performance_history])
        
        if avg_recent < avg_all * 0.8:
            recommendations.append("Recent performance is declining. Consider parameter optimization or market regime analysis.")
        
        # Check for overfitting
        if len(performance_history) > 10:
            early_performance = [record.results.total_return for record in performance_history[-10:]]
            late_performance = [record.results.total_return for record in performance_history[:10]]
            
            if np.mean(early_performance) > np.mean(late_performance) * 1.5:
                recommendations.append("Performance degradation detected. Strategy may be overfitted to historical data.")
        
        # Check risk metrics
        recent_drawdowns = [record.results.max_drawdown for record in performance_history[:5]]
        avg_drawdown = np.mean(recent_drawdowns)
        
        if avg_drawdown > 0.15:
            recommendations.append("High drawdown detected. Consider implementing tighter risk controls.")
        
        # Check parameter stability
        if len(performance_history) > 5:
            param_stability = self._check_parameter_stability(performance_history)
            if not param_stability:
                recommendations.append("Parameter instability detected. Consider fixing key parameters.")
        
        return recommendations
    
    def _check_parameter_stability(self, performance_history: List[BacktestRecord]) -> bool:
        """Check if parameters are stable across backtests"""
        if len(performance_history) < 3:
            return True
        
        # Check if key parameters are changing frequently
        key_params = ['lookback_period', 'threshold', 'position_size']
        
        for param in key_params:
            values = []
            for record in performance_history:
                if param in record.parameters:
                    values.append(record.parameters[param])
            
            if len(set(values)) > len(values) * 0.5:  # More than 50% different values
                return False
        
        return True
