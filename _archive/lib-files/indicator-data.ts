export interface Indicator {
  id: number
  name: string
  description: string
  usage: string
}

export const indicators: Indicator[] = [
  {
    id: 1,
    name: "Quantum Flow",
    description:
      "A momentum indicator that identifies the underlying trend strength by analyzing volume-weighted price movements. It helps distinguish between strong trends and market noise.",
    usage:
      "Look for the Quantum Flow line to cross above the zero line for a bullish signal, or below for a bearish signal. Divergences between the indicator and price can signal potential reversals.",
  },
  {
    id: 2,
    name: "Nexural Oscillator",
    description:
      "Measures overbought and oversold conditions by comparing a security's closing price to a range of its prices over a certain period.",
    usage:
      "Values above 80 indicate overbought conditions, suggesting a potential pullback. Values below 20 indicate oversold conditions, suggesting a potential rally.",
  },
  {
    id: 3,
    name: "Phase Reversal",
    description:
      "Identifies potential market turning points by detecting shifts in price cycle phases. It is highly sensitive to changes in market direction.",
    usage:
      "A green dot below a price bar suggests a potential upward reversal. A red dot above a price bar suggests a potential downward reversal.",
  },
  {
    id: 4,
    name: "Volatility Matrix",
    description:
      "Visualizes market volatility across multiple timeframes, helping traders identify periods of high and low activity to adapt their strategies.",
    usage:
      "Bright green areas indicate high volatility, suitable for breakout strategies. Darker areas signify low volatility, often preceding a significant price move.",
  },
  {
    id: 5,
    name: "Echo Bands",
    description:
      "Dynamic support and resistance levels that adapt to recent price action and volatility, providing a probable range for future price movements.",
    usage:
      "The upper band acts as resistance, while the lower band acts as support. A price break outside the bands can signal the start of a strong trend.",
  },
  {
    id: 6,
    name: "Cognitive Trend",
    description:
      "A trend-following indicator that uses a proprietary algorithm to filter out insignificant price fluctuations, providing a clearer view of the dominant trend.",
    usage:
      "When the line is green, the market is in an uptrend. When it's red, the market is in a downtrend. A color change indicates a potential trend reversal.",
  },
  {
    id: 7,
    name: "Flux Capacitor",
    description:
      "A predictive indicator that attempts to forecast short-term price direction by analyzing the acceleration of price changes.",
    usage:
      "A rising line suggests bullish momentum is increasing. A falling line suggests bearish momentum is building. Crosses of the zero line can be used as entry signals.",
  },
  {
    id: 8,
    name: "Signal-to-Noise Ratio",
    description:
      "Measures the clarity of the trend by comparing the strength of the trend to the volatility of the price action. It helps traders avoid choppy markets.",
    usage:
      "High readings (above 1) indicate a strong trend (high signal, low noise). Low readings (below 1) indicate a ranging or choppy market (low signal, high noise).",
  },
  {
    id: 9,
    name: "Adaptive RSI",
    description:
      "A variation of the standard Relative Strength Index (RSI) that automatically adjusts its lookback period based on market volatility.",
    usage:
      "Similar to the standard RSI, it identifies overbought and oversold conditions but adapts faster to changing market dynamics, providing more timely signals.",
  },
]
