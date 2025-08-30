"""
Free APIs connector for market context data
"""

import pandas as pd
import numpy as np
import yfinance as yf
import requests
from datetime import datetime, timedelta
import logging
from typing import Dict, List

logger = logging.getLogger(__name__)

class FreeAPIsConnector:
    """
    Connect to free APIs for market context
    """
    
    def __init__(self):
        """Initialize free APIs connector"""
        self.vix_data = None
        self.rates_data = None
        self.events = None
        
        logger.info("Free APIs connector initialized")
    
    def get_market_context(self, start_date: str, end_date: str) -> Dict:
        """
        Get market context from free APIs
        
        Args:
            start_date: Start date
            end_date: End date
            
        Returns:
            Dictionary with market context
        """
        logger.info("Loading market context from free APIs...")
        
        context = {}
        
        # Load VIX data
        try:
            vix = yf.download('^VIX', start=start_date, end=end_date, progress=False)
            context['vix'] = vix['Close'].mean()
            context['vix_regime'] = 'high' if context['vix'] > 20 else 'normal'
            logger.info(f"  VIX loaded: {context['vix']:.1f}")
        except Exception as e:
            logger.warning(f"Could not load VIX: {e}")
            context['vix'] = 16
            context['vix_regime'] = 'normal'
        
        # Load interest rates
        try:
            rates = yf.download('^TNX', start=start_date, end=end_date, progress=False)
            context['rates'] = rates['Close'].mean() / 100
            logger.info(f"  Rates loaded: {context['rates']:.2%}")
        except Exception as e:
            logger.warning(f"Could not load rates: {e}")
            context['rates'] = 0.04
        
        # Create event calendar
        context['fomc_dates'] = self._get_fomc_dates(start_date, end_date)
        context['opex_dates'] = self._get_opex_dates(start_date, end_date)
        context['nfp_dates'] = self._get_nfp_dates(start_date, end_date)
        
        logger.info("✅ Market context loaded")
        
        return context
    
    def _get_fomc_dates(self, start_date: str, end_date: str) -> List[datetime]:
        """Get FOMC meeting dates"""
        # Hardcoded for 2022-2024
        fomc_dates = [
            '2022-01-26', '2022-03-16', '2022-05-04', '2022-06-15',
            '2022-07-27', '2022-09-21', '2022-11-02', '2022-12-14',
            '2023-02-01', '2023-03-22', '2023-05-03', '2023-06-14',
            '2023-07-26', '2023-09-20', '2023-11-01', '2023-12-13',
            '2024-01-31', '2024-03-20', '2024-05-01', '2024-06-12',
            '2024-07-31', '2024-09-18', '2024-11-07', '2024-12-18'
        ]
        
        fomc_dates = pd.to_datetime(fomc_dates)
        mask = (fomc_dates >= start_date) & (fomc_dates <= end_date)
        
        return fomc_dates[mask].tolist()
    
    def _get_opex_dates(self, start_date: str, end_date: str) -> List[datetime]:
        """Get options expiration dates (third Friday of each month)"""
        opex_dates = []
        
        current = pd.to_datetime(start_date)
        end = pd.to_datetime(end_date)
        
        while current <= end:
            # Find third Friday
            first_day = current.replace(day=1)
            first_friday = first_day + timedelta(days=(4 - first_day.weekday()) % 7)
            third_friday = first_friday + timedelta(weeks=2)
            
            if third_friday >= pd.to_datetime(start_date) and third_friday <= end:
                opex_dates.append(third_friday)
            
            # Move to next month
            if current.month == 12:
                current = current.replace(year=current.year + 1, month=1)
            else:
                current = current.replace(month=current.month + 1)
        
        return opex_dates
    
    def _get_nfp_dates(self, start_date: str, end_date: str) -> List[datetime]:
        """Get NFP dates (first Friday of each month)"""
        nfp_dates = []
        
        current = pd.to_datetime(start_date)
        end = pd.to_datetime(end_date)
        
        while current <= end:
            # Find first Friday
            first_day = current.replace(day=1)
            days_until_friday = (4 - first_day.weekday()) % 7
            if days_until_friday == 0:
                days_until_friday = 7
            first_friday = first_day + timedelta(days=days_until_friday)
            
            if first_friday >= pd.to_datetime(start_date) and first_friday <= end:
                nfp_dates.append(first_friday)
            
            # Move to next month
            if current.month == 12:
                current = current.replace(year=current.year + 1, month=1)
            else:
                current = current.replace(month=current.month + 1)
        
        return nfp_dates
    
    def get_spy_options_data(self) -> pd.DataFrame:
        """
        Get SPY options data for GEX approximation
        
        Returns:
            DataFrame with options data
        """
        try:
            spy = yf.Ticker("SPY")
            
            # Get next few expirations
            expirations = spy.options[:3] if len(spy.options) >= 3 else spy.options
            
            all_options = []
            
            for expiry in expirations:
                chain = spy.option_chain(expiry)
                
                # Process calls
                calls = chain.calls.copy()
                calls['type'] = 'call'
                calls['expiry'] = expiry
                
                # Process puts
                puts = chain.puts.copy()
                puts['type'] = 'put'
                puts['expiry'] = expiry
                
                all_options.extend([calls, puts])
            
            if all_options:
                return pd.concat(all_options, ignore_index=True)
            else:
                return pd.DataFrame()
                
        except Exception as e:
            logger.warning(f"Could not load SPY options: {e}")
            return pd.DataFrame()
    
    def get_economic_calendar(self, start_date: str, end_date: str) -> pd.DataFrame:
        """
        Get economic calendar events
        
        Args:
            start_date: Start date
            end_date: End date
            
        Returns:
            DataFrame with economic events
        """
        logger.info("Loading economic calendar...")
        
        # This would connect to a real economic calendar API
        # For now, return mock data
        dates = pd.date_range(start_date, end_date, freq='D')
        
        events = []
        for date in dates:
            # Add some random events
            if np.random.random() < 0.1:  # 10% chance of event
                event_types = ['CPI', 'NFP', 'GDP', 'FOMC', 'Retail Sales']
                event_type = np.random.choice(event_types)
                
                events.append({
                    'date': date,
                    'event': event_type,
                    'importance': np.random.choice(['High', 'Medium', 'Low']),
                    'forecast': np.random.normal(2.5, 0.5),
                    'previous': np.random.normal(2.5, 0.5)
                })
        
        return pd.DataFrame(events)
    
    def get_sector_performance(self) -> Dict:
        """
        Get sector performance data
        
        Returns:
            Dictionary with sector performance
        """
        sectors = {
            'XLK': 'Technology',
            'XLF': 'Financials',
            'XLE': 'Energy',
            'XLV': 'Healthcare',
            'XLI': 'Industrials',
            'XLP': 'Consumer Staples',
            'XLU': 'Utilities',
            'XLB': 'Materials',
            'XLRE': 'Real Estate'
        }
        
        performance = {}
        
        for ticker, name in sectors.items():
            try:
                data = yf.download(ticker, period='1mo', progress=False)
                if not data.empty:
                    performance[name] = {
                        'return': (data['Close'][-1] / data['Close'][0] - 1) * 100,
                        'volatility': data['Close'].pct_change().std() * np.sqrt(252) * 100
                    }
            except Exception as e:
                logger.warning(f"Could not load {ticker}: {e}")
        
        return performance
    
    def get_market_breadth(self) -> Dict:
        """
        Get market breadth indicators
        
        Returns:
            Dictionary with breadth indicators
        """
        try:
            # Get SPY data
            spy = yf.download('SPY', period='1mo', progress=False)
            
            # Calculate breadth indicators
            adv_dec = np.random.normal(0, 1, len(spy))  # Mock advance/decline
            new_highs = np.random.randint(50, 200, len(spy))  # Mock new highs
            new_lows = np.random.randint(10, 100, len(spy))  # Mock new lows
            
            breadth = {
                'advance_decline_ratio': adv_dec.mean(),
                'new_highs': new_highs.mean(),
                'new_lows': new_lows.mean(),
                'high_low_ratio': new_highs.mean() / new_lows.mean() if new_lows.mean() > 0 else 0
            }
            
            return breadth
            
        except Exception as e:
            logger.warning(f"Could not calculate market breadth: {e}")
            return {} 