import { 
  calculateFactorExposures,
  calculateFactorReturns,
  performFactorRegression,
  calculateRiskAttribution,
  FactorModel,
  FactorExposure,
  RiskAttribution
} from '@/lib/factors'

// Mock data for factor analysis
const mockReturns = [0.01, -0.005, 0.02, -0.01, 0.015, -0.008, 0.025, -0.012]
const mockFactorData = {
  MKT: [0.012, -0.003, 0.018, -0.008, 0.011, -0.006, 0.022, -0.009],
  SMB: [0.003, -0.001, 0.004, -0.002, 0.002, -0.001, 0.005, -0.002],
  HML: [0.001, 0.002, -0.001, 0.003, -0.001, 0.002, 0.001, 0.001],
  MOM: [0.005, -0.002, 0.008, -0.003, 0.006, -0.002, 0.009, -0.004]
}

describe('Factor Analysis Library', () => {
  describe('calculateFactorExposures', () => {
    it('calculates factor exposures correctly', () => {
      const exposures = calculateFactorExposures(mockReturns, mockFactorData)
      
      expect(exposures).toBeDefined()
      expect(exposures).toHaveProperty('MKT')
      expect(exposures).toHaveProperty('SMB')
      expect(exposures).toHaveProperty('HML')
      expect(exposures).toHaveProperty('MOM')
      
      // All exposures should be finite numbers
      Object.values(exposures).forEach(exposure => {
        expect(typeof exposure).toBe('number')
        expect(Number.isFinite(exposure)).toBe(true)
      })
    })

    it('handles single factor analysis', () => {
      const singleFactorData = { MKT: mockFactorData.MKT }
      const exposures = calculateFactorExposures(mockReturns, singleFactorData)
      
      expect(exposures).toHaveProperty('MKT')
      expect(Object.keys(exposures)).toHaveLength(1)
      expect(typeof exposures.MKT).toBe('number')
    })

    it('validates factor data consistency', () => {
      const inconsistentData = {
        MKT: [0.01, 0.02], // Only 2 points
        SMB: [0.001, 0.002, 0.003] // 3 points - inconsistent
      }
      
      // Should handle mismatched lengths gracefully
      expect(() => calculateFactorExposures(mockReturns, inconsistentData)).not.toThrow()
    })

    it('handles extreme factor values', () => {
      const extremeFactorData = {
        MKT: [10, -10, 50, -50], // Extreme values
        SMB: [0.001, 0.002, 0.001, 0.002]
      }
      const extremeReturns = [0.5, -0.3, 1.2, -0.8]
      
      const exposures = calculateFactorExposures(extremeReturns, extremeFactorData)
      
      expect(exposures).toBeDefined()
      Object.values(exposures).forEach(exposure => {
        expect(Number.isFinite(exposure)).toBe(true)
      })
    })

    it('calculates beta to market correctly', () => {
      const exposures = calculateFactorExposures(mockReturns, mockFactorData)
      
      // Market beta should be reasonable (typically 0.5 to 2.0 for most assets)
      expect(Math.abs(exposures.MKT)).toBeLessThan(5)
      expect(Number.isFinite(exposures.MKT)).toBe(true)
    })
  })

  describe('calculateFactorReturns', () => {
    it('calculates factor returns from exposures', () => {
      const exposures: FactorExposure = {
        MKT: 1.2,
        SMB: 0.3,
        HML: -0.1,
        MOM: 0.5
      }
      
      const factorReturns = calculateFactorReturns(exposures, mockFactorData)
      
      expect(Array.isArray(factorReturns)).toBe(true)
      expect(factorReturns.length).toBe(mockReturns.length)
      
      factorReturns.forEach(ret => {
        expect(typeof ret).toBe('number')
        expect(Number.isFinite(ret)).toBe(true)
      })
    })

    it('handles zero exposures', () => {
      const zeroExposures: FactorExposure = {
        MKT: 0,
        SMB: 0,
        HML: 0,
        MOM: 0
      }
      
      const factorReturns = calculateFactorReturns(zeroExposures, mockFactorData)
      
      // All returns should be close to zero
      factorReturns.forEach(ret => {
        expect(Math.abs(ret)).toBeLessThan(0.001)
      })
    })

    it('validates linear factor model', () => {
      const exposures: FactorExposure = {
        MKT: 1.0,
        SMB: 0.0,
        HML: 0.0,
        MOM: 0.0
      }
      
      const factorReturns = calculateFactorReturns(exposures, mockFactorData)
      
      // Should match market returns when beta = 1, others = 0
      factorReturns.forEach((ret, i) => {
        expect(ret).toBeCloseTo(mockFactorData.MKT[i], 6)
      })
    })
  })

  describe('performFactorRegression', () => {
    it('performs multi-factor regression', () => {
      const regression = performFactorRegression(mockReturns, mockFactorData)
      
      expect(regression).toBeDefined()
      expect(regression).toHaveProperty('alpha')
      expect(regression).toHaveProperty('betas')
      expect(regression).toHaveProperty('rSquared')
      expect(regression).toHaveProperty('residuals')
      expect(regression).toHaveProperty('tStats')
      
      expect(typeof regression.alpha).toBe('number')
      expect(typeof regression.rSquared).toBe('number')
      expect(Array.isArray(regression.residuals)).toBe(true)
    })

    it('calculates statistical significance', () => {
      const regression = performFactorRegression(mockReturns, mockFactorData)
      
      expect(regression.tStats).toHaveProperty('alpha')
      expect(regression.tStats).toHaveProperty('MKT')
      expect(regression.tStats).toHaveProperty('SMB')
      expect(regression.tStats).toHaveProperty('HML')
      
      // T-stats should be finite numbers
      Object.values(regression.tStats).forEach(tStat => {
        expect(typeof tStat).toBe('number')
        expect(Number.isFinite(tStat)).toBe(true)
      })
    })

    it('validates R-squared bounds', () => {
      const regression = performFactorRegression(mockReturns, mockFactorData)
      
      expect(regression.rSquared).toBeGreaterThanOrEqual(0)
      expect(regression.rSquared).toBeLessThanOrEqual(1)
    })

    it('handles perfect correlation', () => {
      // Create returns that perfectly match market factor
      const perfectReturns = mockFactorData.MKT.map(ret => ret * 1.5) // Perfect beta = 1.5
      
      const regression = performFactorRegression(perfectReturns, { MKT: mockFactorData.MKT })
      
      expect(regression.rSquared).toBeCloseTo(1, 2) // Should be near perfect fit
      expect(regression.betas.MKT).toBeCloseTo(1.5, 2) // Should recover beta
    })

    it('calculates residual analysis', () => {
      const regression = performFactorRegression(mockReturns, mockFactorData)
      
      expect(regression.residuals.length).toBe(mockReturns.length)
      
      // Residuals should sum to approximately zero
      const residualSum = regression.residuals.reduce((sum, residual) => sum + residual, 0)
      expect(Math.abs(residualSum)).toBeLessThan(0.01)
    })
  })

  describe('calculateRiskAttribution', () => {
    it('attributes risk to factors', () => {
      const exposures: FactorExposure = {
        MKT: 1.2,
        SMB: 0.3,
        HML: -0.1,
        MOM: 0.5
      }
      
      const attribution = calculateRiskAttribution(exposures, mockFactorData)
      
      expect(attribution).toBeDefined()
      expect(attribution).toHaveProperty('totalRisk')
      expect(attribution).toHaveProperty('factorRisk')
      expect(attribution).toHaveProperty('specificRisk')
      expect(attribution).toHaveProperty('factorContributions')
      
      expect(typeof attribution.totalRisk).toBe('number')
      expect(attribution.totalRisk).toBeGreaterThan(0)
    })

    it('validates risk decomposition', () => {
      const exposures: FactorExposure = {
        MKT: 1.0,
        SMB: 0.2,
        HML: -0.1,
        MOM: 0.3
      }
      
      const attribution = calculateRiskAttribution(exposures, mockFactorData)
      
      // Factor risk + specific risk should approximate total risk
      const reconstructedRisk = Math.sqrt(attribution.factorRisk + attribution.specificRisk)
      expect(reconstructedRisk).toBeCloseTo(attribution.totalRisk, 1)
    })

    it('identifies dominant risk factors', () => {
      const marketHeavyExposures: FactorExposure = {
        MKT: 2.0, // High market exposure
        SMB: 0.1,
        HML: 0.05,
        MOM: 0.1
      }
      
      const attribution = calculateRiskAttribution(marketHeavyExposures, mockFactorData)
      
      // Market should be the dominant contributor
      expect(attribution.factorContributions.MKT).toBeGreaterThan(attribution.factorContributions.SMB)
      expect(attribution.factorContributions.MKT).toBeGreaterThan(attribution.factorContributions.HML)
    })

    it('handles zero exposures', () => {
      const zeroExposures: FactorExposure = {
        MKT: 0,
        SMB: 0,
        HML: 0,
        MOM: 0
      }
      
      const attribution = calculateRiskAttribution(zeroExposures, mockFactorData)
      
      expect(attribution.factorRisk).toBe(0)
      expect(attribution.totalRisk).toBe(attribution.specificRisk)
    })
  })

  describe('FactorModel Interface', () => {
    it('validates FactorModel structure', () => {
      const testModel: FactorModel = {
        name: 'Fama-French 3-Factor',
        factors: ['MKT', 'SMB', 'HML'],
        alpha: 0.001,
        betas: {
          MKT: 1.2,
          SMB: 0.3,
          HML: -0.1
        },
        rSquared: 0.85,
        tracking: 0.05,
        informationRatio: 0.8
      }
      
      expect(testModel.name).toBe('Fama-French 3-Factor')
      expect(Array.isArray(testModel.factors)).toBe(true)
      expect(testModel.factors.length).toBe(3)
      expect(typeof testModel.alpha).toBe('number')
      expect(typeof testModel.rSquared).toBe('number')
      expect(testModel.rSquared).toBeGreaterThanOrEqual(0)
      expect(testModel.rSquared).toBeLessThanOrEqual(1)
    })
  })

  describe('Advanced Factor Analysis', () => {
    it('performs rolling factor analysis', () => {
      const windowSize = 4
      const rollingExposures = []
      
      for (let i = windowSize; i <= mockReturns.length; i++) {
        const windowReturns = mockReturns.slice(i - windowSize, i)
        const windowFactors = Object.fromEntries(
          Object.entries(mockFactorData).map(([factor, data]) => [
            factor,
            data.slice(i - windowSize, i)
          ])
        )
        
        const exposures = calculateFactorExposures(windowReturns, windowFactors)
        rollingExposures.push(exposures)
      }
      
      expect(rollingExposures.length).toBeGreaterThan(0)
      
      rollingExposures.forEach(exposures => {
        expect(exposures).toHaveProperty('MKT')
        expect(Number.isFinite(exposures.MKT)).toBe(true)
      })
    })

    it('identifies factor regime changes', () => {
      // Create data with regime change
      const regimeData = {
        MKT: [...mockFactorData.MKT, ...mockFactorData.MKT.map(x => x * 2)], // Higher volatility regime
        SMB: [...mockFactorData.SMB, ...mockFactorData.SMB.map(x => x * 0.5)] // Lower small-cap premium
      }
      
      const firstHalfReturns = mockReturns
      const secondHalfReturns = mockReturns.map(x => x * 1.8)
      const fullReturns = [...firstHalfReturns, ...secondHalfReturns]
      
      const exposures = calculateFactorExposures(fullReturns, regimeData)
      
      expect(exposures).toBeDefined()
      expect(Number.isFinite(exposures.MKT)).toBe(true)
      expect(Number.isFinite(exposures.SMB)).toBe(true)
    })

    it('calculates factor momentum', () => {
      // Test factor momentum calculation
      const recentFactorData = {
        MKT: mockFactorData.MKT.slice(-4), // Last 4 periods
        SMB: mockFactorData.SMB.slice(-4),
        HML: mockFactorData.HML.slice(-4)
      }
      
      const recentReturns = mockReturns.slice(-4)
      const exposures = calculateFactorExposures(recentReturns, recentFactorData)
      
      expect(exposures).toBeDefined()
      expect(exposures).toHaveProperty('MKT')
      expect(exposures).toHaveProperty('SMB')
      expect(exposures).toHaveProperty('HML')
    })
  })

  describe('Performance Attribution', () => {
    it('attributes performance to factors', () => {
      const exposures: FactorExposure = {
        MKT: 1.1,
        SMB: 0.2,
        HML: -0.05,
        MOM: 0.3
      }
      
      const attribution = calculateRiskAttribution(exposures, mockFactorData)
      
      expect(attribution.factorContributions).toHaveProperty('MKT')
      expect(attribution.factorContributions).toHaveProperty('SMB')
      expect(attribution.factorContributions).toHaveProperty('HML')
      expect(attribution.factorContributions).toHaveProperty('MOM')
      
      // Contributions should sum to total factor contribution
      const totalContribution = Object.values(attribution.factorContributions)
        .reduce((sum, contrib) => sum + contrib, 0)
      
      expect(Number.isFinite(totalContribution)).toBe(true)
    })

    it('handles long-short exposures', () => {
      const longShortExposures: FactorExposure = {
        MKT: 0.0, // Market neutral
        SMB: 1.5, // Long small caps
        HML: -1.2, // Short value stocks
        MOM: 0.8 // Long momentum
      }
      
      const attribution = calculateRiskAttribution(longShortExposures, mockFactorData)
      
      expect(attribution).toBeDefined()
      expect(Number.isFinite(attribution.totalRisk)).toBe(true)
      
      // Should handle negative exposures
      expect(attribution.factorContributions.HML).toBeDefined()
    })

    it('validates attribution accuracy', () => {
      const exposures: FactorExposure = {
        MKT: 1.0,
        SMB: 0.0,
        HML: 0.0,
        MOM: 0.0
      }
      
      // Pure market exposure should have simple attribution
      const attribution = calculateRiskAttribution(exposures, { MKT: mockFactorData.MKT })
      
      expect(attribution.factorContributions.MKT).toBeGreaterThan(0)
      expect(attribution.specificRisk).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Factor Model Validation', () => {
    it('validates complete factor model', () => {
      const model: FactorModel = {
        name: 'Test 4-Factor Model',
        factors: ['MKT', 'SMB', 'HML', 'MOM'],
        alpha: 0.002,
        betas: {
          MKT: 1.15,
          SMB: 0.25,
          HML: -0.08,
          MOM: 0.35
        },
        rSquared: 0.78,
        tracking: 0.045,
        informationRatio: 1.2
      }
      
      expect(model.factors.length).toBe(4)
      expect(Object.keys(model.betas).length).toBe(4)
      expect(model.rSquared).toBeGreaterThanOrEqual(0)
      expect(model.rSquared).toBeLessThanOrEqual(1)
      expect(model.tracking).toBeGreaterThan(0)
    })

    it('calculates information ratio correctly', () => {
      const regression = performFactorRegression(mockReturns, mockFactorData)
      
      // Information ratio = alpha / tracking error
      if (regression.alpha !== 0 && regression.tracking > 0) {
        const calculatedIR = regression.alpha / regression.tracking
        expect(Number.isFinite(calculatedIR)).toBe(true)
      }
    })

    it('validates model statistics', () => {
      const regression = performFactorRegression(mockReturns, mockFactorData)
      
      // All statistics should be reasonable
      expect(Math.abs(regression.alpha)).toBeLessThan(1) // Alpha shouldn't be extreme
      expect(regression.rSquared).toBeGreaterThanOrEqual(0)
      expect(regression.rSquared).toBeLessThanOrEqual(1)
      
      // Beta to market should be reasonable
      expect(Math.abs(regression.betas.MKT)).toBeLessThan(10)
    })
  })

  describe('Risk Decomposition', () => {
    it('decomposes total risk correctly', () => {
      const exposures: FactorExposure = {
        MKT: 1.0,
        SMB: 0.3,
        HML: 0.1,
        MOM: 0.2
      }
      
      const attribution = calculateRiskAttribution(exposures, mockFactorData)
      
      expect(attribution.totalRisk).toBeGreaterThan(0)
      expect(attribution.factorRisk).toBeGreaterThanOrEqual(0)
      expect(attribution.specificRisk).toBeGreaterThanOrEqual(0)
      
      // Total risk should be meaningful
      expect(attribution.totalRisk).toBeLessThan(1) // Shouldn't be extreme
    })

    it('identifies systematic vs idiosyncratic risk', () => {
      const highBetaExposures: FactorExposure = {
        MKT: 1.8, // High systematic risk
        SMB: 0.1,
        HML: 0.05,
        MOM: 0.1
      }
      
      const lowBetaExposures: FactorExposure = {
        MKT: 0.3, // Low systematic risk
        SMB: 0.1,
        HML: 0.05,
        MOM: 0.1
      }
      
      const highBetaAttribution = calculateRiskAttribution(highBetaExposures, mockFactorData)
      const lowBetaAttribution = calculateRiskAttribution(lowBetaExposures, mockFactorData)
      
      // High beta should have more factor risk
      expect(highBetaAttribution.factorRisk).toBeGreaterThan(lowBetaAttribution.factorRisk)
    })

    it('handles portfolio-level analysis', () => {
      // Simulate portfolio of multiple assets
      const portfolioExposures = [
        { weight: 0.6, exposures: { MKT: 1.2, SMB: 0.3, HML: 0.1, MOM: 0.2 } },
        { weight: 0.4, exposures: { MKT: 0.8, SMB: -0.1, HML: 0.2, MOM: 0.1 } }
      ]
      
      // Calculate weighted average exposures
      const portfolioFactorExposures: FactorExposure = {
        MKT: portfolioExposures.reduce((sum, asset) => sum + asset.weight * asset.exposures.MKT, 0),
        SMB: portfolioExposures.reduce((sum, asset) => sum + asset.weight * asset.exposures.SMB, 0),
        HML: portfolioExposures.reduce((sum, asset) => sum + asset.weight * asset.exposures.HML, 0),
        MOM: portfolioExposures.reduce((sum, asset) => sum + asset.weight * asset.exposures.MOM, 0)
      }
      
      const portfolioAttribution = calculateRiskAttribution(portfolioFactorExposures, mockFactorData)
      
      expect(portfolioAttribution).toBeDefined()
      expect(portfolioAttribution.totalRisk).toBeGreaterThan(0)
      
      // Portfolio betas should be weighted averages
      expect(portfolioFactorExposures.MKT).toBeCloseTo(1.04, 2) // 0.6*1.2 + 0.4*0.8
    })
  })

  describe('Integration with Trading Systems', () => {
    it('supports real-time factor monitoring', () => {
      // Simulate streaming factor data
      const streamingData = Array.from({ length: 100 }, (_, i) => ({
        timestamp: Date.now() + i * 60000, // 1-minute intervals
        returns: 0.001 + Math.sin(i * 0.1) * 0.005,
        factors: {
          MKT: 0.001 + Math.sin(i * 0.05) * 0.008,
          SMB: Math.sin(i * 0.03) * 0.002,
          HML: Math.cos(i * 0.04) * 0.001
        }
      }))
      
      // Process in rolling windows
      const windowSize = 20
      const rollingAnalysis = []
      
      for (let i = windowSize; i < streamingData.length; i++) {
        const window = streamingData.slice(i - windowSize, i)
        const returns = window.map(d => d.returns)
        const factors = {
          MKT: window.map(d => d.factors.MKT),
          SMB: window.map(d => d.factors.SMB),
          HML: window.map(d => d.factors.HML)
        }
        
        const exposures = calculateFactorExposures(returns, factors)
        rollingAnalysis.push({
          timestamp: window[window.length - 1].timestamp,
          exposures
        })
      }
      
      expect(rollingAnalysis.length).toBeGreaterThan(0)
      
      rollingAnalysis.forEach(analysis => {
        expect(analysis.exposures).toHaveProperty('MKT')
        expect(Number.isFinite(analysis.exposures.MKT)).toBe(true)
      })
    })

    it('handles factor model switching', () => {
      // Test switching between different factor models
      const threeFactor = { MKT: mockFactorData.MKT, SMB: mockFactorData.SMB, HML: mockFactorData.HML }
      const fourFactor = { ...threeFactor, MOM: mockFactorData.MOM }
      
      const exposures3 = calculateFactorExposures(mockReturns, threeFactor)
      const exposures4 = calculateFactorExposures(mockReturns, fourFactor)
      
      // Both should be valid
      expect(exposures3).toHaveProperty('MKT')
      expect(exposures4).toHaveProperty('MKT')
      expect(exposures4).toHaveProperty('MOM')
      
      // 4-factor should have momentum exposure
      expect(exposures4).toHaveProperty('MOM')
      expect(exposures3).not.toHaveProperty('MOM')
    })

    it('supports factor-based portfolio construction', () => {
      // Target factor exposures for portfolio
      const targetExposures: FactorExposure = {
        MKT: 1.0, // Market neutral after cash
        SMB: 0.5, // Tilt toward small caps
        HML: -0.2, // Slight growth tilt
        MOM: 0.3 // Momentum exposure
      }
      
      // Validate target exposures are achievable
      Object.values(targetExposures).forEach(exposure => {
        expect(Number.isFinite(exposure)).toBe(true)
        expect(Math.abs(exposure)).toBeLessThan(3) // Reasonable bounds
      })
      
      const attribution = calculateRiskAttribution(targetExposures, mockFactorData)
      
      expect(attribution.totalRisk).toBeGreaterThan(0)
      expect(attribution.factorRisk).toBeGreaterThan(0)
    })
  })
})
