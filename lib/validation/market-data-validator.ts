/**
 * 🧪 Market Data Validator
 * Ensures market data integrity and consistency
 */

import { MarketDataBar, QuoteData, MarketDataTimeframe } from '../market-data-service';
import { reportError } from '../monitoring';

/**
 * Interface for validation result
 */
export interface ValidationResult<T> {
  isValid: boolean;
  data: T | null;
  errors: string[];
}

/**
 * Validation options for market data
 */
export interface ValidationOptions {
  /**
   * Whether to allow missing values (e.g. volume in quote data)
   */
  allowMissingValues?: boolean;
  
  /**
   * Whether to allow future timestamps
   */
  allowFutureTimestamps?: boolean;
  
  /**
   * Max tolerance for future timestamps in milliseconds
   */
  futureTolerance?: number;
  
  /**
   * Whether to validate OHLC relationships (e.g. high >= low)
   */
  validateOhlcRelations?: boolean;
  
  /**
   * Whether to ensure price data is positive
   */
  ensurePositivePrices?: boolean;
  
  /**
   * Whether to ensure volume is non-negative
   */
  ensureNonNegativeVolume?: boolean;
  
  /**
   * Max age of data in milliseconds
   */
  maxAgeMs?: number;
}

/**
 * Default validation options
 */
const DEFAULT_VALIDATION_OPTIONS: ValidationOptions = {
  allowMissingValues: false,
  allowFutureTimestamps: false,
  futureTolerance: 5000, // 5 seconds tolerance
  validateOhlcRelations: true,
  ensurePositivePrices: true,
  ensureNonNegativeVolume: true,
  maxAgeMs: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Class for validating market data
 */
export class MarketDataValidator {
  private options: ValidationOptions;
  
  constructor(options: ValidationOptions = {}) {
    this.options = { ...DEFAULT_VALIDATION_OPTIONS, ...options };
  }
  
  /**
   * Validate market data bar
   * @param bar The market data bar to validate
   * @returns Validation result
   */
  public validateBar(bar: MarketDataBar): ValidationResult<MarketDataBar> {
    const errors: string[] = [];
    
    // Check required fields
    if (!bar.instrumentId) {
      errors.push('Missing instrumentId');
    }
    
    if (!bar.timeframe) {
      errors.push('Missing timeframe');
    } else if (!Object.values(MarketDataTimeframe).includes(bar.timeframe as MarketDataTimeframe)) {
      errors.push(`Invalid timeframe: ${bar.timeframe}`);
    }
    
    // Validate timestamp
    if (bar.timestamp === undefined || bar.timestamp === null) {
      errors.push('Missing timestamp');
    } else {
      if (!this.isValidTimestamp(bar.timestamp)) {
        errors.push(`Invalid timestamp: ${bar.timestamp}`);
      }
    }
    
    // Validate OHLC values
    if (bar.open === undefined || bar.open === null) {
      if (!this.options.allowMissingValues) {
        errors.push('Missing open price');
      }
    } else if (this.options.ensurePositivePrices && bar.open <= 0) {
      errors.push(`Open price must be positive: ${bar.open}`);
    }
    
    if (bar.high === undefined || bar.high === null) {
      if (!this.options.allowMissingValues) {
        errors.push('Missing high price');
      }
    } else if (this.options.ensurePositivePrices && bar.high <= 0) {
      errors.push(`High price must be positive: ${bar.high}`);
    }
    
    if (bar.low === undefined || bar.low === null) {
      if (!this.options.allowMissingValues) {
        errors.push('Missing low price');
      }
    } else if (this.options.ensurePositivePrices && bar.low <= 0) {
      errors.push(`Low price must be positive: ${bar.low}`);
    }
    
    if (bar.close === undefined || bar.close === null) {
      if (!this.options.allowMissingValues) {
        errors.push('Missing close price');
      }
    } else if (this.options.ensurePositivePrices && bar.close <= 0) {
      errors.push(`Close price must be positive: ${bar.close}`);
    }
    
    // Validate volume
    if (bar.volume === undefined || bar.volume === null) {
      if (!this.options.allowMissingValues) {
        errors.push('Missing volume');
      }
    } else if (this.options.ensureNonNegativeVolume && bar.volume < 0) {
      errors.push(`Volume must be non-negative: ${bar.volume}`);
    }
    
    // Validate OHLC relations
    if (this.options.validateOhlcRelations && 
        bar.open !== undefined && bar.high !== undefined && 
        bar.low !== undefined && bar.close !== undefined) {
      
      // High should be the highest value
      if (bar.high < bar.open || bar.high < bar.close || bar.high < bar.low) {
        errors.push(`High price (${bar.high}) must be >= open (${bar.open}), close (${bar.close}), and low (${bar.low})`);
      }
      
      // Low should be the lowest value
      if (bar.low > bar.open || bar.low > bar.close || bar.low > bar.high) {
        errors.push(`Low price (${bar.low}) must be <= open (${bar.open}), close (${bar.close}), and high (${bar.high})`);
      }
    }
    
    const isValid = errors.length === 0;
    
    // Report validation errors if any
    if (!isValid) {
      reportError({
        component: 'MarketDataValidator',
        action: 'validateBar',
        error: new Error('Market data bar validation failed'),
        context: {
          bar,
          errors,
        },
        severity: 'medium',
      });
    }
    
    return {
      isValid,
      data: isValid ? bar : null,
      errors,
    };
  }
  
  /**
   * Validate quote data
   * @param quote The quote data to validate
   * @returns Validation result
   */
  public validateQuote(quote: QuoteData): ValidationResult<QuoteData> {
    const errors: string[] = [];
    
    // Check required fields
    if (!quote.instrumentId) {
      errors.push('Missing instrumentId');
    }
    
    // Validate timestamp
    if (quote.timestamp === undefined || quote.timestamp === null) {
      errors.push('Missing timestamp');
    } else {
      if (!this.isValidTimestamp(quote.timestamp)) {
        errors.push(`Invalid timestamp: ${quote.timestamp}`);
      }
    }
    
    // Validate bid and ask
    if (quote.bid === undefined || quote.bid === null) {
      if (!this.options.allowMissingValues) {
        errors.push('Missing bid price');
      }
    } else if (this.options.ensurePositivePrices && quote.bid < 0) {
      errors.push(`Bid price must be non-negative: ${quote.bid}`);
    }
    
    if (quote.ask === undefined || quote.ask === null) {
      if (!this.options.allowMissingValues) {
        errors.push('Missing ask price');
      }
    } else if (this.options.ensurePositivePrices && quote.ask < 0) {
      errors.push(`Ask price must be non-negative: ${quote.ask}`);
    }
    
    // Validate bid/ask relationship (bid should be <= ask)
    if (quote.bid !== undefined && quote.ask !== undefined && quote.bid > quote.ask) {
      errors.push(`Bid price (${quote.bid}) should be <= ask price (${quote.ask})`);
    }
    
    // Check sizes if present
    if (quote.bidSize !== undefined && quote.bidSize < 0) {
      errors.push(`Bid size must be non-negative: ${quote.bidSize}`);
    }
    
    if (quote.askSize !== undefined && quote.askSize < 0) {
      errors.push(`Ask size must be non-negative: ${quote.askSize}`);
    }
    
    const isValid = errors.length === 0;
    
    // Report validation errors if any
    if (!isValid) {
      reportError({
        component: 'MarketDataValidator',
        action: 'validateQuote',
        error: new Error('Quote data validation failed'),
        context: {
          quote,
          errors,
        },
        severity: 'medium',
      });
    }
    
    return {
      isValid,
      data: isValid ? quote : null,
      errors,
    };
  }
  
  /**
   * Validate multiple market data bars
   * @param bars Array of market data bars to validate
   * @returns Array of validated bars (invalid bars are filtered out)
   */
  public validateBars(bars: MarketDataBar[]): MarketDataBar[] {
    const validBars: MarketDataBar[] = [];
    
    for (const bar of bars) {
      const result = this.validateBar(bar);
      
      if (result.isValid && result.data) {
        validBars.push(result.data);
      }
    }
    
    // Report if we filtered out bars
    if (validBars.length < bars.length) {
      reportError({
        component: 'MarketDataValidator',
        action: 'validateBars',
        error: new Error(`Filtered out ${bars.length - validBars.length} invalid bars`),
        context: {
          totalBars: bars.length,
          validBars: validBars.length,
          invalidBars: bars.length - validBars.length,
        },
        severity: 'low',
      });
    }
    
    return validBars;
  }
  
  /**
   * Check if a timestamp is valid according to validation options
   * @param timestamp The timestamp to check
   * @returns Whether the timestamp is valid
   */
  private isValidTimestamp(timestamp: number): boolean {
    const now = Date.now();
    
    // Check if timestamp is too far in the future
    if (!this.options.allowFutureTimestamps && timestamp > now) {
      // Apply tolerance
      if (timestamp > now + (this.options.futureTolerance || 0)) {
        return false;
      }
    }
    
    // Check if timestamp is too old
    if (this.options.maxAgeMs !== undefined && now - timestamp > this.options.maxAgeMs) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Repair market data bar if possible
   * This attempts to fix common issues with market data
   * @param bar The market data bar to repair
   * @returns Repaired bar or null if unrepairable
   */
  public repairBar(bar: MarketDataBar): MarketDataBar | null {
    try {
      const repairedBar = { ...bar };
      
      // Fix timestamp issues
      if (repairedBar.timestamp === undefined || repairedBar.timestamp === null) {
        return null; // Cannot repair missing timestamp
      }
      
      // Fix future timestamp
      const now = Date.now();
      if (repairedBar.timestamp > now) {
        repairedBar.timestamp = now;
      }
      
      // Fix OHLC issues
      if (repairedBar.high !== undefined && repairedBar.low !== undefined) {
        // Fix inverted high/low
        if (repairedBar.high < repairedBar.low) {
          const temp = repairedBar.high;
          repairedBar.high = repairedBar.low;
          repairedBar.low = temp;
        }
        
        // Fix open/close outside high/low range
        if (repairedBar.open !== undefined) {
          if (repairedBar.open > repairedBar.high) {
            repairedBar.high = repairedBar.open;
          } else if (repairedBar.open < repairedBar.low) {
            repairedBar.low = repairedBar.open;
          }
        }
        
        if (repairedBar.close !== undefined) {
          if (repairedBar.close > repairedBar.high) {
            repairedBar.high = repairedBar.close;
          } else if (repairedBar.close < repairedBar.low) {
            repairedBar.low = repairedBar.close;
          }
        }
      }
      
      // Fix negative prices
      if (this.options.ensurePositivePrices) {
        if (repairedBar.open !== undefined && repairedBar.open <= 0) {
          repairedBar.open = 0.01; // Use small positive value
        }
        
        if (repairedBar.high !== undefined && repairedBar.high <= 0) {
          repairedBar.high = 0.01;
        }
        
        if (repairedBar.low !== undefined && repairedBar.low <= 0) {
          repairedBar.low = 0.01;
        }
        
        if (repairedBar.close !== undefined && repairedBar.close <= 0) {
          repairedBar.close = 0.01;
        }
      }
      
      // Fix negative volume
      if (this.options.ensureNonNegativeVolume && repairedBar.volume !== undefined && repairedBar.volume < 0) {
        repairedBar.volume = 0;
      }
      
      // Validate the repaired bar
      const validationResult = this.validateBar(repairedBar);
      
      if (validationResult.isValid) {
        return repairedBar;
      } else {
        return null; // Still invalid after repair attempts
      }
    } catch (error) {
      reportError({
        component: 'MarketDataValidator',
        action: 'repairBar',
        error,
        context: { bar },
        severity: 'low',
      });
      
      return null;
    }
  }
  
  /**
   * Repair quote data if possible
   * @param quote The quote data to repair
   * @returns Repaired quote or null if unrepairable
   */
  public repairQuote(quote: QuoteData): QuoteData | null {
    try {
      const repairedQuote = { ...quote };
      
      // Fix timestamp issues
      if (repairedQuote.timestamp === undefined || repairedQuote.timestamp === null) {
        return null; // Cannot repair missing timestamp
      }
      
      // Fix future timestamp
      const now = Date.now();
      if (repairedQuote.timestamp > now) {
        repairedQuote.timestamp = now;
      }
      
      // Fix bid/ask issues
      if (repairedQuote.bid !== undefined && repairedQuote.ask !== undefined) {
        // Fix inverted bid/ask
        if (repairedQuote.bid > repairedQuote.ask) {
          const midPrice = (repairedQuote.bid + repairedQuote.ask) / 2;
          const spread = Math.abs(repairedQuote.bid - repairedQuote.ask);
          
          repairedQuote.bid = midPrice - spread / 2;
          repairedQuote.ask = midPrice + spread / 2;
        }
      }
      
      // Fix negative prices
      if (this.options.ensurePositivePrices) {
        if (repairedQuote.bid !== undefined && repairedQuote.bid < 0) {
          repairedQuote.bid = 0;
        }
        
        if (repairedQuote.ask !== undefined && repairedQuote.ask < 0) {
          repairedQuote.ask = 0;
        }
      }
      
      // Fix negative sizes
      if (repairedQuote.bidSize !== undefined && repairedQuote.bidSize < 0) {
        repairedQuote.bidSize = 0;
      }
      
      if (repairedQuote.askSize !== undefined && repairedQuote.askSize < 0) {
        repairedQuote.askSize = 0;
      }
      
      // Validate the repaired quote
      const validationResult = this.validateQuote(repairedQuote);
      
      if (validationResult.isValid) {
        return repairedQuote;
      } else {
        return null; // Still invalid after repair attempts
      }
    } catch (error) {
      reportError({
        component: 'MarketDataValidator',
        action: 'repairQuote',
        error,
        context: { quote },
        severity: 'low',
      });
      
      return null;
    }
  }
}

// Export a default instance with default options
const marketDataValidator = new MarketDataValidator();
export default marketDataValidator;
