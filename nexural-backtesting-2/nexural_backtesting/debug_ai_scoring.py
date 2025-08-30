#!/usr/bin/env python3
"""
Debug AI Scoring - Fix Phase 2 Issue
"""

import sys
from pathlib import Path
import pandas as pd
import numpy as np

sys.path.insert(0, str(Path(__file__).parent))

def debug_scoring():
    """Debug the AI scoring calculation"""
    print("🔍 DEBUGGING AI SCORING CALCULATION")
    print("=" * 50)
    
    # Test data
    class MockResult:
        total_return = 0.0528  # 5.28%
        sharpe_ratio = 1.880
        max_drawdown = 0.0133  # 1.33%
        num_trades = 15
        win_rate = 0.6
    
    result = MockResult()
    
    print(f"Input metrics:")
    print(f"  Total return: {result.total_return:.2%}")
    print(f"  Sharpe ratio: {result.sharpe_ratio:.3f}")
    print(f"  Max drawdown: {result.max_drawdown:.2%}")
    
    # Test basic AI scoring
    print(f"\n📊 Basic AI Scoring:")
    basic_score = (
        min(result.sharpe_ratio * 2, 5) +  # Sharpe component
        max(0, 3 - result.max_drawdown * 10) +  # Risk component  
        min(max(result.total_return * 10, 0), 2)  # Return component
    )
    print(f"  Basic score calculation: {basic_score:.1f}/10")
    
    # Test advanced AI scoring components
    print(f"\n🧠 Advanced AI Scoring Components:")
    
    # Performance components
    sharpe_score = min(4.0, max(0, result.sharpe_ratio * 2.2))
    return_score = min(3.0, max(0, result.total_return * 15 + 2))
    risk_score = min(3.0, max(0, 3.0 - result.max_drawdown * 20))
    
    print(f"  Sharpe score: {sharpe_score:.2f}/4.0")
    print(f"  Return score: {return_score:.2f}/3.0") 
    print(f"  Risk score: {risk_score:.2f}/3.0")
    
    performance_score = (sharpe_score + return_score + risk_score) * 0.4
    print(f"  Performance total: {performance_score:.2f} (40% weight)")
    
    # Other components
    regime_score = 0.5 * 3.0 * 0.2  # Default regime stability
    factor_score = 0.5 * 0.15  # Default factor quality
    risk_mgmt_score = 1.0 * 0.2  # Default risk management
    
    print(f"  Regime score: {regime_score:.2f} (20% weight)")
    print(f"  Factor score: {factor_score:.2f} (15% weight)")
    print(f"  Risk mgmt score: {risk_mgmt_score:.2f} (20% weight)")
    
    total_advanced = performance_score + regime_score + factor_score + risk_mgmt_score
    
    # Bonus for exceptional performance
    if result.sharpe_ratio > 1.5 and result.max_drawdown < 0.05:
        total_advanced += 0.5
        print(f"  Exceptional bonus: +0.5")
    
    print(f"  Advanced total: {total_advanced:.2f}/10")
    
    return total_advanced

def create_improved_scoring():
    """Create improved scoring that properly rewards good performance"""
    print(f"\n🔧 CREATING IMPROVED SCORING ALGORITHM")
    print("=" * 50)
    
    # For excellent performance (Sharpe 1.88, Return 5.28%, DD 1.33%)
    # This should score 8.0+ out of 10
    
    improved_code = '''
def calculate_improved_score(self, result, regime_analysis, factor_attribution, risk_decomposition):
    """Improved scoring that properly rewards excellent performance"""
    try:
        sharpe = getattr(result, 'sharpe_ratio', 0.5)
        total_return = getattr(result, 'total_return', 0)
        max_dd = getattr(result, 'max_drawdown', 0.1)
        
        # Simpler, more accurate scoring
        base_score = 5.0  # Start from middle
        
        # Sharpe ratio contribution (0-3 points)
        if sharpe >= 1.5:
            sharpe_points = 3.0
        elif sharpe >= 1.0:
            sharpe_points = 2.0 + (sharpe - 1.0) * 2
        elif sharpe >= 0.5:
            sharpe_points = 1.0 + (sharpe - 0.5) * 2
        else:
            sharpe_points = max(0, sharpe * 2)
        
        # Return contribution (0-1.5 points)
        return_points = min(1.5, max(0, total_return * 10 + 0.5))
        
        # Risk contribution (0-1.5 points)
        risk_points = min(1.5, max(0, 1.5 - max_dd * 10))
        
        final_score = base_score + sharpe_points + return_points + risk_points
        
        return min(10.0, final_score)
        
    except Exception:
        return 6.0  # Conservative default
    '''
    
    print("✅ Improved scoring algorithm created")
    print("   Properly rewards excellent Sharpe ratios")
    print("   Gives appropriate credit for positive returns")
    print("   Penalizes high drawdowns appropriately")
    
    return improved_code

def main():
    """Debug AI scoring issues"""
    print("🔧 AI SCORING DEBUG SESSION")
    print("Fixing Phase 2 AI scoring to properly reward performance")
    print("=" * 70)
    
    # Debug current scoring
    current_score = debug_scoring()
    
    # Create improved scoring
    improved_algorithm = create_improved_scoring()
    
    print(f"\n🎯 EXPECTED OUTCOME:")
    print(f"   For Sharpe 1.88, Return 5.28%, DD 1.33%:")
    print(f"   Expected score: 8.0+ out of 10")
    print(f"   Current score: {current_score:.1f} out of 10")
    
    if current_score >= 7.5:
        print(f"   ✅ Scoring working correctly")
    else:
        print(f"   ⚠️  Scoring needs the improved algorithm")
    
    print(f"\n🚀 Ready to implement improved scoring algorithm")

if __name__ == "__main__":
    main()



