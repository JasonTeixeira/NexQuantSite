/**
 * 🧪 DATA PROCESSING TESTS
 * Tests for ML data validation, transformation and feature engineering
 */

import { 
  validateMarketData, 
  normalizeTimeSeriesData,
  extractFeatures,
  calculateTechnicalIndicators,
  detectAnomalies
} from '@/lib/ml/data-processing';

describe('Data Validation', () => {
  it('should validate complete and valid market data', () => {
    const validData = {
      symbol: 'AAPL',
      timeframe: '1h',
      timestamp: '2025-08-30T12:00:00Z',
      ohlcv: [
        {
          open: 150.25,
          high: 152.50,
          low: 149.80,
          close: 151.75,
          volume: 1200000,
          timestamp: '2025-08-30T11:00:00Z'
        },
        {
          open: 151.75,
          high: 153.25,
          low: 151.30,
          close: 152.80,
          volume: 980000,
          timestamp: '2025-08-30T12:00:00Z'
        }
      ]
    };
    
    const result = validateMarketData(validData);
    
    expect(result.valid).toBe(true);
    expect(result.errors).toBeUndefined();
  });
  
  it('should reject data with missing required fields', () => {
    const invalidData = {
      // Missing symbol
      timeframe: '1h',
      timestamp: '2025-08-30T12:00:00Z',
      ohlcv: [
        {
          open: 150.25,
          high: 152.50,
          low: 149.80,
          close: 151.75,
          volume: 1200000,
          timestamp: '2025-08-30T11:00:00Z'
        }
      ]
    };
    
    const result = validateMarketData(invalidData as any);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors?.symbol).toBeDefined();
  });
  
  it('should reject data with invalid OHLCV values', () => {
    const invalidData = {
      symbol: 'AAPL',
      timeframe: '1h',
      timestamp: '2025-08-30T12:00:00Z',
      ohlcv: [
        {
          open: 150.25,
          high: 148.50, // High < Open (invalid)
          low: 149.80,  // Low > Open (invalid)
          close: 151.75,
          volume: -1200, // Negative volume (invalid)
          timestamp: '2025-08-30T11:00:00Z'
        }
      ]
    };
    
    const result = validateMarketData(invalidData);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors?.ohlcv).toBeDefined();
    expect(result.errors?.ohlcv[0].high).toBeDefined();
    expect(result.errors?.ohlcv[0].low).toBeDefined();
    expect(result.errors?.ohlcv[0].volume).toBeDefined();
  });
  
  it('should reject data with timestamp inconsistencies', () => {
    const invalidData = {
      symbol: 'AAPL',
      timeframe: '1h',
      timestamp: '2025-08-30T12:00:00Z',
      ohlcv: [
        {
          open: 150.25,
          high: 152.50,
          low: 149.80,
          close: 151.75,
          volume: 1200000,
          timestamp: '2025-08-30T11:00:00Z'
        },
        {
          open: 151.75,
          high: 153.25,
          low: 151.30,
          close: 152.80,
          volume: 980000,
          timestamp: '2025-08-30T14:00:00Z' // Gap in time series (skipped 13:00)
        }
      ]
    };
    
    const result = validateMarketData(invalidData);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors?.timestamp).toBeDefined();
  });
  
  it('should reject data with future timestamps', () => {
    // Create a timestamp in the future
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 1); // 1 hour in the future
    
    const invalidData = {
      symbol: 'AAPL',
      timeframe: '1h',
      timestamp: futureDate.toISOString(),
      ohlcv: [
        {
          open: 150.25,
          high: 152.50,
          low: 149.80,
          close: 151.75,
          volume: 1200000,
          timestamp: futureDate.toISOString()
        }
      ]
    };
    
    const result = validateMarketData(invalidData);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors?.timestamp).toBeDefined();
  });
  
  it('should detect and report all validation errors at once', () => {
    const invalidData = {
      // Missing symbol
      timeframe: 'invalid', // Invalid timeframe
      timestamp: 'not-a-date', // Invalid timestamp format
      ohlcv: [
        {
          // Missing open
          high: 152.50,
          low: 149.80,
          // Missing close
          volume: -100, // Invalid volume
          timestamp: '2025-08-30T11:00:00Z'
        }
      ]
    };
    
    const result = validateMarketData(invalidData as any);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(Object.keys(result.errors || {})).toHaveLength(4); // symbol, timeframe, timestamp, ohlcv
    expect(Object.keys(result.errors?.ohlcv[0] || {})).toHaveLength(3); // open, close, volume
  });
});

describe('Data Normalization', () => {
  it('should normalize time series data correctly', () => {
    const rawData = {
      symbol: 'AAPL',
      timeframe: '1h',
      timestamp: '2025-08-30T12:00:00Z',
      ohlcv: [
        {
          open: 150.25,
          high: 152.50,
          low: 149.80,
          close: 151.75,
          volume: 1200000,
          timestamp: '2025-08-30T10:00:00Z'
        },
        {
          open: 151.75,
          high: 153.25,
          low: 151.30,
          close: 152.80,
          volume: 980000,
          timestamp: '2025-08-30T11:00:00Z'
        },
        {
          open: 152.80,
          high: 154.00,
          low: 152.25,
          close: 153.50,
          volume: 1100000,
          timestamp: '2025-08-30T12:00:00Z'
        }
      ]
    };
    
    const normalizedData = normalizeTimeSeriesData(rawData);
    
    // Check basic structure
    expect(normalizedData.symbol).toBe('AAPL');
    expect(normalizedData.timeframe).toBe('1h');
    expect(normalizedData.features).toBeDefined();
    
    // Check feature arrays
    expect(normalizedData.features.length).toBe(5); // open, high, low, close, volume
    
    // Find specific features
    const closeFeature = normalizedData.features.find(f => f.name === 'close');
    const volumeFeature = normalizedData.features.find(f => f.name === 'volume');
    
    // Verify normalization
    expect(closeFeature).toBeDefined();
    expect(volumeFeature).toBeDefined();
    
    // Check that values are normalized between 0 and 1
    expect(Math.max(...closeFeature!.values)).toBeLessThanOrEqual(1);
    expect(Math.min(...closeFeature!.values)).toBeGreaterThanOrEqual(0);
    
    expect(Math.max(...volumeFeature!.values)).toBeLessThanOrEqual(1);
    expect(Math.min(...volumeFeature!.values)).toBeGreaterThanOrEqual(0);
    
    // Check that timestamps are preserved
    expect(normalizedData.timestamps).toEqual([
      '2025-08-30T10:00:00Z',
      '2025-08-30T11:00:00Z',
      '2025-08-30T12:00:00Z'
    ]);
  });
  
  it('should handle empty data gracefully', () => {
    const emptyData = {
      symbol: 'AAPL',
      timeframe: '1h',
      timestamp: '2025-08-30T12:00:00Z',
      ohlcv: []
    };
    
    const result = normalizeTimeSeriesData(emptyData);
    
    expect(result.symbol).toBe('AAPL');
    expect(result.timeframe).toBe('1h');
    expect(result.features).toEqual([]);
    expect(result.timestamps).toEqual([]);
  });
  
  it('should normalize different ranges appropriately', () => {
    // Data with very different ranges (prices vs volume)
    const rawData = {
      symbol: 'AAPL',
      timeframe: '1h',
      timestamp: '2025-08-30T12:00:00Z',
      ohlcv: [
        {
          open: 150.25,
          high: 152.50,
          low: 149.80,
          close: 151.75,
          volume: 10000000, // Very large number compared to prices
          timestamp: '2025-08-30T11:00:00Z'
        },
        {
          open: 151.75,
          high: 153.25,
          low: 151.30,
          close: 152.80,
          volume: 9800000,
          timestamp: '2025-08-30T12:00:00Z'
        }
      ]
    };
    
    const normalizedData = normalizeTimeSeriesData(rawData);
    
    // Find specific features
    const closeFeature = normalizedData.features.find(f => f.name === 'close');
    const volumeFeature = normalizedData.features.find(f => f.name === 'volume');
    
    // Both should be normalized to their own ranges
    expect(Math.max(...closeFeature!.values)).toBeCloseTo(1);
    expect(Math.min(...closeFeature!.values)).toBeCloseTo(0);
    
    expect(Math.max(...volumeFeature!.values)).toBeCloseTo(1);
    expect(Math.min(...volumeFeature!.values)).toBeCloseTo(0);
  });
  
  it('should preserve feature relationships', () => {
    const rawData = {
      symbol: 'AAPL',
      timeframe: '1h',
      timestamp: '2025-08-30T12:00:00Z',
      ohlcv: [
        {
          open: 150,
          high: 160,
          low: 140,
          close: 155,
          volume: 1000000,
          timestamp: '2025-08-30T11:00:00Z'
        },
        {
          open: 155,
          high: 165,
          low: 145,
          close: 160,
          volume: 1200000,
          timestamp: '2025-08-30T12:00:00Z'
        }
      ]
    };
    
    const normalizedData = normalizeTimeSeriesData(rawData);
    
    // Find features
    const openFeature = normalizedData.features.find(f => f.name === 'open');
    const highFeature = normalizedData.features.find(f => f.name === 'high');
    const lowFeature = normalizedData.features.find(f => f.name === 'low');
    
    // Check relationships are preserved (high > open > low)
    for (let i = 0; i < openFeature!.values.length; i++) {
      expect(highFeature!.values[i]).toBeGreaterThan(openFeature!.values[i]);
      expect(openFeature!.values[i]).toBeGreaterThan(lowFeature!.values[i]);
    }
  });
});

describe('Feature Engineering', () => {
  it('should extract basic features from market data', () => {
    const rawData = {
      symbol: 'AAPL',
      timeframe: '1h',
      timestamp: '2025-08-30T12:00:00Z',
      ohlcv: [
        {
          open: 150,
          high: 160,
          low: 140,
          close: 155,
          volume: 1000000,
          timestamp: '2025-08-30T08:00:00Z'
        },
        {
          open: 155,
          high: 165,
          low: 145,
          close: 160,
          volume: 1200000,
          timestamp: '2025-08-30T09:00:00Z'
        },
        {
          open: 160,
          high: 170,
          low: 155,
          close: 165,
          volume: 1100000,
          timestamp: '2025-08-30T10:00:00Z'
        },
        {
          open: 165,
          high: 175,
          low: 160,
          close: 170,
          volume: 1300000,
          timestamp: '2025-08-30T11:00:00Z'
        },
        {
          open: 170,
          high: 180,
          low: 165,
          close: 175,
          volume: 1500000,
          timestamp: '2025-08-30T12:00:00Z'
        }
      ]
    };
    
    const features = extractFeatures(rawData);
    
    // Check basic structure
    expect(features).toBeDefined();
    expect(features.basicFeatures).toBeDefined();
    expect(features.derivedFeatures).toBeDefined();
    
    // Check basic features
    expect(features.basicFeatures.open).toEqual([150, 155, 160, 165, 170]);
    expect(features.basicFeatures.close).toEqual([155, 160, 165, 170, 175]);
    expect(features.basicFeatures.volume).toEqual([1000000, 1200000, 1100000, 1300000, 1500000]);
    
    // Check derived features
    expect(features.derivedFeatures.returns).toBeDefined();
    expect(features.derivedFeatures.returns.length).toBe(4); // n-1 returns for n prices
    
    // Check calculated returns
    // return = (close[i] - close[i-1]) / close[i-1]
    const expectedReturns = [
      (160 - 155) / 155,
      (165 - 160) / 160,
      (170 - 165) / 165,
      (175 - 170) / 170
    ];
    
    for (let i = 0; i < expectedReturns.length; i++) {
      expect(features.derivedFeatures.returns[i]).toBeCloseTo(expectedReturns[i]);
    }
  });
  
  it('should calculate moving averages correctly', () => {
    const rawData = {
      symbol: 'AAPL',
      timeframe: '1h',
      timestamp: '2025-08-30T12:00:00Z',
      ohlcv: [
        { open: 100, high: 110, low: 95, close: 105, volume: 1000, timestamp: '2025-08-30T08:00:00Z' },
        { open: 105, high: 115, low: 100, close: 110, volume: 1100, timestamp: '2025-08-30T09:00:00Z' },
        { open: 110, high: 120, low: 105, close: 115, volume: 1200, timestamp: '2025-08-30T10:00:00Z' },
        { open: 115, high: 125, low: 110, close: 120, volume: 1300, timestamp: '2025-08-30T11:00:00Z' },
        { open: 120, high: 130, low: 115, close: 125, volume: 1400, timestamp: '2025-08-30T12:00:00Z' }
      ]
    };
    
    const features = extractFeatures(rawData, { calculateMA: true, maPeriods: [3] });
    
    // Check moving averages
    expect(features.derivedFeatures.ma3).toBeDefined();
    
    // MA(3) should start from the 3rd element
    // MA3[2] = (105 + 110 + 115) / 3 = 110
    // MA3[3] = (110 + 115 + 120) / 3 = 115
    // MA3[4] = (115 + 120 + 125) / 3 = 120
    expect(features.derivedFeatures.ma3.length).toBe(3);
    expect(features.derivedFeatures.ma3[0]).toBeCloseTo(110);
    expect(features.derivedFeatures.ma3[1]).toBeCloseTo(115);
    expect(features.derivedFeatures.ma3[2]).toBeCloseTo(120);
  });
});

describe('Technical Indicators', () => {
  it('should calculate RSI correctly', () => {
    // Create price data with some clear up and down movements
    const priceData = [
      100, 102, 104, 103, 105, 107, 109, // Uptrend
      108, 106, 104, 102, 100, 98, 96,   // Downtrend
      97, 99, 101, 103, 105, 107         // Uptrend again
    ];
    
    const rawData = {
      symbol: 'AAPL',
      timeframe: '1h',
      timestamp: '2025-08-30T12:00:00Z',
      ohlcv: priceData.map((price, i) => ({
        open: price - 1,
        high: price + 2,
        low: price - 2,
        close: price,
        volume: 1000000,
        timestamp: new Date(2025, 7, 30, 8 + i).toISOString()
      }))
    };
    
    const indicators = calculateTechnicalIndicators(rawData, { rsi: true, rsiPeriod: 14 });
    
    // Check RSI
    expect(indicators.rsi).toBeDefined();
    expect(indicators.rsi.length).toBe(priceData.length - 14);
    
    // RSI should be between 0 and 100
    indicators.rsi.forEach(value => {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    });
    
    // In our data, we should see RSI go from high (uptrend) to low (downtrend) back to middle
    const firstRsi = indicators.rsi[0];
    const middleRsi = indicators.rsi[Math.floor(indicators.rsi.length / 2)];
    const lastRsi = indicators.rsi[indicators.rsi.length - 1];
    
    // First RSI should be high due to initial uptrend
    expect(firstRsi).toBeGreaterThan(50);
    
    // Middle RSI should be low due to downtrend
    expect(middleRsi).toBeLessThan(50);
    
    // Last RSI should be moving up again
    expect(lastRsi).toBeGreaterThan(middleRsi);
  });
});

describe('Anomaly Detection', () => {
  it('should detect price spikes using Z-score method', () => {
    // Create data with a few spikes
    const priceData = Array(50).fill(0).map((_, i) => 100 + Math.sin(i / 5) * 5);
    
    // Add spikes
    priceData[10] = 150; // Strong spike
    priceData[25] = 130; // Medium spike
    priceData[40] = 70;  // Negative spike
    
    const rawData = {
      symbol: 'AAPL',
      timeframe: '1h',
      timestamp: '2025-08-30T12:00:00Z',
      ohlcv: priceData.map((price, i) => ({
        open: price - 1,
        high: price + 1,
        low: price - 1,
        close: price,
        volume: 1000000,
        timestamp: new Date(2025, 7, 30, 8 + i).toISOString()
      }))
    };
    
    const anomalies = detectAnomalies(rawData, { method: 'zscore', threshold: 3 });
    
    // Check basic structure
    expect(anomalies).toBeDefined();
    expect(anomalies.priceAnomalies).toBeDefined();
    expect(anomalies.volumeAnomalies).toBeDefined();
    
    // Should detect the major price spikes
    expect(anomalies.priceAnomalies.length).toBeGreaterThan(0);
    
    // Should identify the specific anomalies we inserted
    const anomalyIndices = anomalies.priceAnomalies.map(a => a.index);
    expect(anomalyIndices).toContain(10); // Strong spike
    expect(anomalyIndices).toContain(40); // Negative spike
  });
});
