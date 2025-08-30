"""
Institutional-Grade Risk Management Engine Manager

This module provides a comprehensive risk management system that allows users to:
- Build and save custom risk management engines
- Create different risk management strategies
- Track and manage risk limits
- Generate risk reports and alerts
- Integrate with portfolio management
"""

import pandas as pd
import numpy as np
import json
import pickle
import sqlite3
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple, Union, Callable
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta
from enum import Enum
import logging
from abc import ABC, abstractmethod
import warnings
warnings.filterwarnings('ignore')

from .portfolio_risk_manager import PortfolioRiskManager, RiskMetrics
from .var_engine import VaREngine, VaRResult
from .stress_testing import StressTestingEngine, StressScenario

logger = logging.getLogger(__name__)


class RiskEngineType(Enum):
    """Risk engine types"""
    PORTFOLIO_RISK = "portfolio_risk"
    VAR_ENGINE = "var_engine"
    STRESS_TESTING = "stress_testing"
    POSITION_LIMITS = "position_limits"
    CORRELATION_ENGINE = "correlation_engine"
    LIQUIDITY_ENGINE = "liquidity_engine"
    CUSTOM = "custom"


class RiskLevel(Enum):
    """Risk levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class RiskEngineConfig:
    """Configuration for a risk engine"""
    name: str
    description: str
    engine_type: RiskEngineType
    risk_level: RiskLevel
    parameters: Dict[str, Any] = field(default_factory=dict)
    limits: Dict[str, float] = field(default_factory=dict)
    alerts: Dict[str, Any] = field(default_factory=dict)
    enabled: bool = True
    version: str = "1.0.0"
    created_date: datetime = field(default_factory=datetime.now)
    modified_date: datetime = field(default_factory=datetime.now)
    engine_id: str = ""


@dataclass
class RiskAlert:
    """Risk alert information"""
    alert_id: str
    engine_id: str
    alert_type: str
    severity: RiskLevel
    message: str
    timestamp: datetime
    metric_value: float
    threshold: float
    portfolio_value: float
    action_taken: str = ""
    resolved: bool = False


@dataclass
class RiskReport:
    """Comprehensive risk report"""
    report_id: str
    timestamp: datetime
    portfolio_value: float
    risk_metrics: Dict[str, float]
    limit_utilization: Dict[str, float]
    active_alerts: List[RiskAlert]
    stress_test_results: Dict[str, Any]
    recommendations: List[str]
    summary: str


class BaseRiskEngine(ABC):
    """Abstract base class for risk engines"""
    
    def __init__(self, config: RiskEngineConfig):
        self.config = config
        self.enabled = config.enabled
        self.alerts: List[RiskAlert] = []
    
    @abstractmethod
    def calculate_risk(self, portfolio_data: Dict[str, Any]) -> Dict[str, float]:
        """Calculate risk metrics"""
        pass
    
    @abstractmethod
    def check_limits(self, portfolio_data: Dict[str, Any]) -> List[RiskAlert]:
        """Check risk limits and generate alerts"""
        pass
    
    @abstractmethod
    def get_risk_summary(self) -> Dict[str, Any]:
        """Get risk summary"""
        pass


class PortfolioRiskEngine(BaseRiskEngine):
    """Portfolio risk management engine"""
    
    def __init__(self, config: RiskEngineConfig):
        super().__init__(config)
        self.risk_manager = PortfolioRiskManager()
        self.var_engine = VaREngine()
        self.stress_engine = StressTestingEngine({})
    
    def calculate_risk(self, portfolio_data: Dict[str, Any]) -> Dict[str, float]:
        """Calculate comprehensive portfolio risk metrics"""
        try:
            # Update portfolio data
            self.risk_manager.update_portfolio_data(
                portfolio_data.get('positions', {}),
                portfolio_data.get('prices', {}),
                portfolio_data.get('returns', {})
            )
            
            # Calculate risk metrics
            risk_metrics = self.risk_manager.calculate_risk_metrics()
            
            # Calculate VaR
            var_result = self.var_engine.calculate_portfolio_var(
                portfolio_data.get('returns', {}),
                confidence_level=0.95
            )
            
            # Add VaR to metrics
            risk_metrics['var_95'] = var_result.var_value
            risk_metrics['expected_shortfall_95'] = var_result.expected_shortfall
            
            return risk_metrics
            
        except Exception as e:
            logger.error(f"Error calculating portfolio risk: {e}")
            return {}
    
    def check_limits(self, portfolio_data: Dict[str, Any]) -> List[RiskAlert]:
        """Check portfolio risk limits"""
        alerts = []
        
        try:
            risk_metrics = self.calculate_risk(portfolio_data)
            limits = self.config.limits
            
            # Check volatility limit
            if 'max_volatility' in limits:
                vol = risk_metrics.get('volatility', 0)
                if vol > limits['max_volatility']:
                    alerts.append(RiskAlert(
                        alert_id=f"VOL_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                        engine_id=self.config.engine_id,
                        alert_type="volatility_limit",
                        severity=RiskLevel.HIGH if vol > limits['max_volatility'] * 1.5 else RiskLevel.MEDIUM,
                        message=f"Portfolio volatility {vol:.2%} exceeds limit {limits['max_volatility']:.2%}",
                        timestamp=datetime.now(),
                        metric_value=vol,
                        threshold=limits['max_volatility'],
                        portfolio_value=portfolio_data.get('total_value', 0)
                    ))
            
            # Check VaR limit
            if 'max_var' in limits:
                var = risk_metrics.get('var_95', 0)
                if var > limits['max_var']:
                    alerts.append(RiskAlert(
                        alert_id=f"VAR_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                        engine_id=self.config.engine_id,
                        alert_type="var_limit",
                        severity=RiskLevel.CRITICAL,
                        message=f"Portfolio VaR {var:.2%} exceeds limit {limits['max_var']:.2%}",
                        timestamp=datetime.now(),
                        metric_value=var,
                        threshold=limits['max_var'],
                        portfolio_value=portfolio_data.get('total_value', 0)
                    ))
            
            # Check drawdown limit
            if 'max_drawdown' in limits:
                drawdown = risk_metrics.get('max_drawdown', 0)
                if drawdown > limits['max_drawdown']:
                    alerts.append(RiskAlert(
                        alert_id=f"DD_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                        engine_id=self.config.engine_id,
                        alert_type="drawdown_limit",
                        severity=RiskLevel.HIGH,
                        message=f"Portfolio drawdown {drawdown:.2%} exceeds limit {limits['max_drawdown']:.2%}",
                        timestamp=datetime.now(),
                        metric_value=drawdown,
                        threshold=limits['max_drawdown'],
                        portfolio_value=portfolio_data.get('total_value', 0)
                    ))
            
            # Check leverage limit
            if 'max_leverage' in limits:
                leverage = risk_metrics.get('leverage', 0)
                if leverage > limits['max_leverage']:
                    alerts.append(RiskAlert(
                        alert_id=f"LEV_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                        engine_id=self.config.engine_id,
                        alert_type="leverage_limit",
                        severity=RiskLevel.HIGH,
                        message=f"Portfolio leverage {leverage:.2f}x exceeds limit {limits['max_leverage']:.2f}x",
                        timestamp=datetime.now(),
                        metric_value=leverage,
                        threshold=limits['max_leverage'],
                        portfolio_value=portfolio_data.get('total_value', 0)
                    ))
            
        except Exception as e:
            logger.error(f"Error checking risk limits: {e}")
        
        return alerts
    
    def get_risk_summary(self) -> Dict[str, Any]:
        """Get portfolio risk summary"""
        return {
            'engine_type': self.config.engine_type.value,
            'risk_level': self.config.risk_level.value,
            'limits': self.config.limits,
            'active_alerts': len([a for a in self.alerts if not a.resolved]),
            'total_alerts': len(self.alerts)
        }


class PositionLimitEngine(BaseRiskEngine):
    """Position limit management engine"""
    
    def __init__(self, config: RiskEngineConfig):
        super().__init__(config)
        self.position_limits = config.parameters.get('position_limits', {})
        self.sector_limits = config.parameters.get('sector_limits', {})
        self.country_limits = config.parameters.get('country_limits', {})
    
    def calculate_risk(self, portfolio_data: Dict[str, Any]) -> Dict[str, float]:
        """Calculate position concentration metrics"""
        positions = portfolio_data.get('positions', {})
        total_value = portfolio_data.get('total_value', 1)
        
        metrics = {}
        
        # Calculate position concentrations
        for symbol, position in positions.items():
            concentration = abs(position['value']) / total_value
            metrics[f'concentration_{symbol}'] = concentration
        
        # Calculate sector concentrations
        sector_exposures = {}
        for symbol, position in positions.items():
            sector = position.get('sector', 'unknown')
            if sector not in sector_exposures:
                sector_exposures[sector] = 0
            sector_exposures[sector] += abs(position['value'])
        
        for sector, exposure in sector_exposures.items():
            metrics[f'sector_exposure_{sector}'] = exposure / total_value
        
        # Calculate country concentrations
        country_exposures = {}
        for symbol, position in positions.items():
            country = position.get('country', 'unknown')
            if country not in country_exposures:
                country_exposures[country] = 0
            country_exposures[country] += abs(position['value'])
        
        for country, exposure in country_exposures.items():
            metrics[f'country_exposure_{country}'] = exposure / total_value
        
        return metrics
    
    def check_limits(self, portfolio_data: Dict[str, Any]) -> List[RiskAlert]:
        """Check position limits"""
        alerts = []
        metrics = self.calculate_risk(portfolio_data)
        positions = portfolio_data.get('positions', {})
        total_value = portfolio_data.get('total_value', 1)
        
        # Check individual position limits
        for symbol, position in positions.items():
            concentration = abs(position['value']) / total_value
            max_concentration = self.position_limits.get(symbol, self.position_limits.get('default', 0.05))
            
            if concentration > max_concentration:
                alerts.append(RiskAlert(
                    alert_id=f"POS_{symbol}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    engine_id=self.config.engine_id,
                    alert_type="position_limit",
                    severity=RiskLevel.HIGH,
                    message=f"Position {symbol} concentration {concentration:.2%} exceeds limit {max_concentration:.2%}",
                    timestamp=datetime.now(),
                    metric_value=concentration,
                    threshold=max_concentration,
                    portfolio_value=total_value
                ))
        
        # Check sector limits
        for sector, limit in self.sector_limits.items():
            exposure = metrics.get(f'sector_exposure_{sector}', 0)
            if exposure > limit:
                alerts.append(RiskAlert(
                    alert_id=f"SECT_{sector}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    engine_id=self.config.engine_id,
                    alert_type="sector_limit",
                    severity=RiskLevel.MEDIUM,
                    message=f"Sector {sector} exposure {exposure:.2%} exceeds limit {limit:.2%}",
                    timestamp=datetime.now(),
                    metric_value=exposure,
                    threshold=limit,
                    portfolio_value=total_value
                ))
        
        # Check country limits
        for country, limit in self.country_limits.items():
            exposure = metrics.get(f'country_exposure_{country}', 0)
            if exposure > limit:
                alerts.append(RiskAlert(
                    alert_id=f"CTRY_{country}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    engine_id=self.config.engine_id,
                    alert_type="country_limit",
                    severity=RiskLevel.MEDIUM,
                    message=f"Country {country} exposure {exposure:.2%} exceeds limit {limit:.2%}",
                    timestamp=datetime.now(),
                    metric_value=exposure,
                    threshold=limit,
                    portfolio_value=total_value
                ))
        
        return alerts
    
    def get_risk_summary(self) -> Dict[str, Any]:
        """Get position limit summary"""
        return {
            'engine_type': self.config.engine_type.value,
            'position_limits': self.position_limits,
            'sector_limits': self.sector_limits,
            'country_limits': self.country_limits,
            'active_alerts': len([a for a in self.alerts if not a.resolved])
        }


class CorrelationEngine(BaseRiskEngine):
    """Correlation risk management engine"""
    
    def __init__(self, config: RiskEngineConfig):
        super().__init__(config)
        self.correlation_threshold = config.parameters.get('correlation_threshold', 0.7)
        self.lookback_period = config.parameters.get('lookback_period', 252)
    
    def calculate_risk(self, portfolio_data: Dict[str, Any]) -> Dict[str, float]:
        """Calculate correlation metrics"""
        returns = portfolio_data.get('returns', {})
        
        if not returns or len(returns) < 2:
            return {}
        
        # Convert to DataFrame
        returns_df = pd.DataFrame(returns)
        
        # Calculate correlation matrix
        corr_matrix = returns_df.corr()
        
        # Calculate average correlation
        n = len(corr_matrix)
        total_corr = 0
        count = 0
        
        for i in range(n):
            for j in range(i+1, n):
                if not pd.isna(corr_matrix.iloc[i, j]):
                    total_corr += corr_matrix.iloc[i, j]
                    count += 1
        
        avg_correlation = total_corr / count if count > 0 else 0
        
        # Find highly correlated pairs
        high_corr_pairs = []
        for i in range(n):
            for j in range(i+1, n):
                corr = corr_matrix.iloc[i, j]
                if not pd.isna(corr) and abs(corr) > self.correlation_threshold:
                    high_corr_pairs.append({
                        'asset1': corr_matrix.index[i],
                        'asset2': corr_matrix.columns[j],
                        'correlation': corr
                    })
        
        return {
            'average_correlation': avg_correlation,
            'high_correlation_pairs': high_corr_pairs,
            'correlation_risk_score': avg_correlation * 100  # Scale to 0-100
        }
    
    def check_limits(self, portfolio_data: Dict[str, Any]) -> List[RiskAlert]:
        """Check correlation limits"""
        alerts = []
        metrics = self.calculate_risk(portfolio_data)
        
        avg_correlation = metrics.get('average_correlation', 0)
        high_corr_pairs = metrics.get('high_correlation_pairs', [])
        
        # Check average correlation
        if avg_correlation > self.correlation_threshold:
            alerts.append(RiskAlert(
                alert_id=f"CORR_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                engine_id=self.config.engine_id,
                alert_type="correlation_limit",
                severity=RiskLevel.MEDIUM,
                message=f"Average correlation {avg_correlation:.3f} exceeds threshold {self.correlation_threshold:.3f}",
                timestamp=datetime.now(),
                metric_value=avg_correlation,
                threshold=self.correlation_threshold,
                portfolio_value=portfolio_data.get('total_value', 0)
            ))
        
        # Check for too many highly correlated pairs
        max_high_corr_pairs = self.config.parameters.get('max_high_correlation_pairs', 5)
        if len(high_corr_pairs) > max_high_corr_pairs:
            alerts.append(RiskAlert(
                alert_id=f"CORR_PAIRS_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                engine_id=self.config.engine_id,
                alert_type="correlation_pairs_limit",
                severity=RiskLevel.HIGH,
                message=f"Too many highly correlated pairs: {len(high_corr_pairs)} > {max_high_corr_pairs}",
                timestamp=datetime.now(),
                metric_value=len(high_corr_pairs),
                threshold=max_high_corr_pairs,
                portfolio_value=portfolio_data.get('total_value', 0)
            ))
        
        return alerts
    
    def get_risk_summary(self) -> Dict[str, Any]:
        """Get correlation risk summary"""
        return {
            'engine_type': self.config.engine_type.value,
            'correlation_threshold': self.correlation_threshold,
            'lookback_period': self.lookback_period,
            'active_alerts': len([a for a in self.alerts if not a.resolved])
        }


class RiskEngineManager:
    """
    Comprehensive risk engine management system
    """
    
    def __init__(self, base_path: str = "risk_engines"):
        """
        Initialize risk engine manager
        
        Args:
            base_path: Base directory for risk engine storage
        """
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
        
        # Create directory structure
        self.engines_path = self.base_path / "engines"
        self.configs_path = self.base_path / "configs"
        self.reports_path = self.base_path / "reports"
        self.alerts_path = self.base_path / "alerts"
        
        for path in [self.engines_path, self.configs_path, self.reports_path, self.alerts_path]:
            path.mkdir(exist_ok=True)
        
        # Initialize database
        self.db_path = self.base_path / "risk_engine_database.db"
        self._init_database()
        
        # Engine registry
        self.engine_registry: Dict[str, RiskEngineConfig] = {}
        self.active_engines: Dict[str, BaseRiskEngine] = {}
        self._load_engine_registry()
        
        logger.info(f"Risk engine manager initialized at {self.base_path}")
    
    def _init_database(self):
        """Initialize SQLite database for risk engine management"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Risk engines table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS risk_engines (
                engine_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                engine_type TEXT,
                risk_level TEXT,
                parameters TEXT,
                limits TEXT,
                alerts TEXT,
                enabled BOOLEAN,
                version TEXT,
                created_date TEXT,
                modified_date TEXT,
                file_path TEXT
            )
        ''')
        
        # Risk alerts table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS risk_alerts (
                alert_id TEXT PRIMARY KEY,
                engine_id TEXT,
                alert_type TEXT,
                severity TEXT,
                message TEXT,
                timestamp TEXT,
                metric_value REAL,
                threshold REAL,
                portfolio_value REAL,
                action_taken TEXT,
                resolved BOOLEAN,
                FOREIGN KEY (engine_id) REFERENCES risk_engines (engine_id)
            )
        ''')
        
        # Risk reports table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS risk_reports (
                report_id TEXT PRIMARY KEY,
                timestamp TEXT,
                portfolio_value REAL,
                risk_metrics TEXT,
                limit_utilization TEXT,
                active_alerts TEXT,
                stress_test_results TEXT,
                recommendations TEXT,
                summary TEXT,
                report_file TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def _load_engine_registry(self):
        """Load engine registry from database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM risk_engines')
        rows = cursor.fetchall()
        
        for row in rows:
            engine_id = row[0]
            config = RiskEngineConfig(
                name=row[1],
                description=row[2] or "",
                engine_type=RiskEngineType(row[3]) if row[3] else RiskEngineType.CUSTOM,
                risk_level=RiskLevel(row[4]) if row[4] else RiskLevel.MEDIUM,
                parameters=json.loads(row[5]) if row[5] else {},
                limits=json.loads(row[6]) if row[6] else {},
                alerts=json.loads(row[7]) if row[7] else {},
                enabled=bool(row[8]),
                version=row[9] or "1.0.0",
                created_date=datetime.fromisoformat(row[10]) if row[10] else datetime.now(),
                modified_date=datetime.fromisoformat(row[11]) if row[11] else datetime.now(),
                engine_id=engine_id
            )
            self.engine_registry[engine_id] = config
            
            # Load active engines
            if config.enabled:
                self._load_engine(config)
        
        conn.close()
    
    def create_risk_engine(
        self,
        name: str,
        description: str,
        engine_type: RiskEngineType,
        risk_level: RiskLevel,
        parameters: Dict[str, Any],
        limits: Dict[str, float],
        alerts: Dict[str, Any]
    ) -> str:
        """
        Create a new risk engine
        
        Args:
            name: Engine name
            description: Engine description
            engine_type: Type of risk engine
            risk_level: Risk level
            parameters: Engine parameters
            limits: Risk limits
            alerts: Alert configuration
            
        Returns:
            Engine ID
        """
        engine_id = self._generate_engine_id(name)
        
        config = RiskEngineConfig(
            name=name,
            description=description,
            engine_type=engine_type,
            risk_level=risk_level,
            parameters=parameters,
            limits=limits,
            alerts=alerts,
            engine_id=engine_id
        )
        
        # Create engine instance
        engine = self._create_engine_instance(config)
        
        # Save engine
        self.save_risk_engine(engine, config)
        
        return engine_id
    
    def _create_engine_instance(self, config: RiskEngineConfig) -> BaseRiskEngine:
        """Create engine instance based on type"""
        if config.engine_type == RiskEngineType.PORTFOLIO_RISK:
            return PortfolioRiskEngine(config)
        elif config.engine_type == RiskEngineType.POSITION_LIMITS:
            return PositionLimitEngine(config)
        elif config.engine_type == RiskEngineType.CORRELATION_ENGINE:
            return CorrelationEngine(config)
        else:
            # Create custom engine
            return self._create_custom_engine(config)
    
    def _create_custom_engine(self, config: RiskEngineConfig) -> BaseRiskEngine:
        """Create custom risk engine"""
        class CustomRiskEngine(BaseRiskEngine):
            def calculate_risk(self, portfolio_data: Dict[str, Any]) -> Dict[str, float]:
                # Custom risk calculation logic
                return {}
            
            def check_limits(self, portfolio_data: Dict[str, Any]) -> List[RiskAlert]:
                # Custom limit checking logic
                return []
            
            def get_risk_summary(self) -> Dict[str, Any]:
                return {'engine_type': 'custom'}
        
        return CustomRiskEngine(config)
    
    def save_risk_engine(self, engine: BaseRiskEngine, config: RiskEngineConfig) -> str:
        """
        Save a risk engine
        
        Args:
            engine: Risk engine instance
            config: Engine configuration
            
        Returns:
            Engine ID
        """
        # Save engine file
        engine_file = self.engines_path / f"{config.engine_id}.pkl"
        with open(engine_file, 'wb') as f:
            pickle.dump(engine, f)
        
        # Save config
        config_file = self.configs_path / f"{config.engine_id}.json"
        with open(config_file, 'w') as f:
            json.dump(asdict(config), f, indent=2, default=str)
        
        # Save to database
        self._save_config_to_db(config, str(engine_file))
        
        # Update registry
        self.engine_registry[config.engine_id] = config
        self.active_engines[config.engine_id] = engine
        
        logger.info(f"Risk engine saved: {config.engine_id} ({config.name})")
        return config.engine_id
    
    def load_risk_engine(self, engine_id: str) -> Tuple[BaseRiskEngine, RiskEngineConfig]:
        """
        Load a risk engine
        
        Args:
            engine_id: Engine ID to load
            
        Returns:
            Tuple of (engine, config)
        """
        if engine_id not in self.engine_registry:
            raise ValueError(f"Risk engine {engine_id} not found")
        
        config = self.engine_registry[engine_id]
        
        # Load engine file
        engine_file = self.engines_path / f"{engine_id}.pkl"
        with open(engine_file, 'rb') as f:
            engine = pickle.load(f)
        
        return engine, config
    
    def run_risk_analysis(self, portfolio_data: Dict[str, Any]) -> RiskReport:
        """
        Run comprehensive risk analysis using all active engines
        
        Args:
            portfolio_data: Portfolio data
            
        Returns:
            Risk report
        """
        all_alerts = []
        all_metrics = {}
        limit_utilization = {}
        
        # Run all active engines
        for engine_id, engine in self.active_engines.items():
            if not engine.enabled:
                continue
            
            try:
                # Calculate risk metrics
                metrics = engine.calculate_risk(portfolio_data)
                all_metrics.update(metrics)
                
                # Check limits
                alerts = engine.check_limits(portfolio_data)
                all_alerts.extend(alerts)
                
                # Calculate limit utilization
                limits = engine.config.limits
                for metric, value in metrics.items():
                    if metric in limits:
                        utilization = value / limits[metric]
                        limit_utilization[f"{engine_id}_{metric}"] = utilization
                
            except Exception as e:
                logger.error(f"Error running engine {engine_id}: {e}")
        
        # Generate recommendations
        recommendations = self._generate_recommendations(all_metrics, all_alerts)
        
        # Create risk report
        report = RiskReport(
            report_id=f"RPT_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            timestamp=datetime.now(),
            portfolio_value=portfolio_data.get('total_value', 0),
            risk_metrics=all_metrics,
            limit_utilization=limit_utilization,
            active_alerts=[a for a in all_alerts if not a.resolved],
            stress_test_results={},  # Would run stress tests here
            recommendations=recommendations,
            summary=self._generate_risk_summary(all_metrics, all_alerts)
        )
        
        # Save report
        self._save_risk_report(report)
        
        return report
    
    def _generate_recommendations(self, metrics: Dict[str, float], alerts: List[RiskAlert]) -> List[str]:
        """Generate risk management recommendations"""
        recommendations = []
        
        # High volatility recommendation
        if metrics.get('volatility', 0) > 0.25:
            recommendations.append("Consider reducing portfolio volatility through diversification or hedging")
        
        # High VaR recommendation
        if metrics.get('var_95', 0) > 0.05:
            recommendations.append("Portfolio VaR is high - consider reducing position sizes or adding hedges")
        
        # High correlation recommendation
        if metrics.get('average_correlation', 0) > 0.7:
            recommendations.append("High portfolio correlation detected - consider diversifying across uncorrelated assets")
        
        # High drawdown recommendation
        if metrics.get('max_drawdown', 0) > 0.15:
            recommendations.append("High drawdown detected - implement tighter stop-losses or position sizing")
        
        # Alert-based recommendations
        critical_alerts = [a for a in alerts if a.severity == RiskLevel.CRITICAL]
        if critical_alerts:
            recommendations.append(f"Immediate action required: {len(critical_alerts)} critical alerts active")
        
        return recommendations
    
    def _generate_risk_summary(self, metrics: Dict[str, float], alerts: List[RiskAlert]) -> str:
        """Generate risk summary"""
        active_alerts = [a for a in alerts if not a.resolved]
        critical_alerts = [a for a in active_alerts if a.severity == RiskLevel.CRITICAL]
        
        summary = f"Risk Analysis Summary:\n"
        summary += f"- Active Alerts: {len(active_alerts)} ({len(critical_alerts)} critical)\n"
        summary += f"- Portfolio Volatility: {metrics.get('volatility', 0):.2%}\n"
        summary += f"- VaR (95%): {metrics.get('var_95', 0):.2%}\n"
        summary += f"- Max Drawdown: {metrics.get('max_drawdown', 0):.2%}\n"
        
        if critical_alerts:
            summary += f"- CRITICAL: {len(critical_alerts)} critical alerts require immediate attention"
        
        return summary
    
    def _save_risk_report(self, report: RiskReport):
        """Save risk report"""
        # Save report file
        report_file = self.reports_path / f"{report.report_id}.pkl"
        with open(report_file, 'wb') as f:
            pickle.dump(report, f)
        
        # Save to database
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO risk_reports 
            (report_id, timestamp, portfolio_value, risk_metrics, limit_utilization,
             active_alerts, stress_test_results, recommendations, summary, report_file)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            report.report_id,
            report.timestamp.isoformat(),
            report.portfolio_value,
            json.dumps(report.risk_metrics),
            json.dumps(report.limit_utilization),
            json.dumps([asdict(a) for a in report.active_alerts]),
            json.dumps(report.stress_test_results),
            json.dumps(report.recommendations),
            report.summary,
            str(report_file)
        ))
        
        conn.commit()
        conn.close()
    
    def _generate_engine_id(self, name: str) -> str:
        """Generate unique engine ID"""
        base = name.replace(" ", "_").lower()
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        return f"{base}_{timestamp}"
    
    def _save_config_to_db(self, config: RiskEngineConfig, file_path: str):
        """Save config to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO risk_engines 
            (engine_id, name, description, engine_type, risk_level, parameters,
             limits, alerts, enabled, version, created_date, modified_date, file_path)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            config.engine_id,
            config.name,
            config.description,
            config.engine_type.value,
            config.risk_level.value,
            json.dumps(config.parameters),
            json.dumps(config.limits),
            json.dumps(config.alerts),
            config.enabled,
            config.version,
            config.created_date.isoformat(),
            config.modified_date.isoformat(),
            file_path
        ))
        
        conn.commit()
        conn.close()
    
    def _load_engine(self, config: RiskEngineConfig):
        """Load engine instance"""
        try:
            engine_file = self.engines_path / f"{config.engine_id}.pkl"
            with open(engine_file, 'rb') as f:
                engine = pickle.load(f)
            self.active_engines[config.engine_id] = engine
        except Exception as e:
            logger.error(f"Failed to load engine {config.engine_id}: {e}")
    
    def list_engines(self) -> List[RiskEngineConfig]:
        """List all risk engines"""
        return list(self.engine_registry.values())
    
    def enable_engine(self, engine_id: str) -> bool:
        """Enable a risk engine"""
        if engine_id not in self.engine_registry:
            return False
        
        config = self.engine_registry[engine_id]
        config.enabled = True
        config.modified_date = datetime.now()
        
        # Load engine if not already loaded
        if engine_id not in self.active_engines:
            self._load_engine(config)
        
        # Update database
        self._save_config_to_db(config, "")
        
        logger.info(f"Risk engine enabled: {engine_id}")
        return True
    
    def disable_engine(self, engine_id: str) -> bool:
        """Disable a risk engine"""
        if engine_id not in self.engine_registry:
            return False
        
        config = self.engine_registry[engine_id]
        config.enabled = False
        config.modified_date = datetime.now()
        
        # Remove from active engines
        if engine_id in self.active_engines:
            del self.active_engines[engine_id]
        
        # Update database
        self._save_config_to_db(config, "")
        
        logger.info(f"Risk engine disabled: {engine_id}")
        return True
