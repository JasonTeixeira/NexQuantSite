import { marked } from "marked"

export interface Post {
  slug: string
  title: string
  date: string
  category: string
  excerpt: string
  image: string
  author: {
    name: string
    avatar: string
  }
  content: string
}

const posts: (Omit<Post, "content"> & { rawContent: string })[] = [
  {
    slug: "understanding-market-volatility",
    title: "Understanding Market Volatility: A Quant's Perspective",
    date: "2025-07-10",
    category: "Market Analysis",
    excerpt:
      "Dive deep into the metrics and models quants use to measure and predict market volatility, and how you can leverage it.",
    image: "/abstract-financial-chart.png",
    author: {
      name: "Dr. Evelyn Reed",
      avatar: "/futuristic-female-scientist.png",
    },
    rawContent: `
### What is Volatility?

In quantitative finance, volatility is not just a buzzword; it's a measurable quantity representing the degree of variation of a trading price series over time. It's often measured by the standard deviation of logarithmic returns.

\`\`\`python
import numpy as np

# Example: Calculate annualized volatility
log_returns = np.log(prices / prices.shift(1))
annualized_volatility = log_returns.std() * np.sqrt(252)
print(f"Annualized Volatility: {annualized_volatility:.2%}")
\`\`\`

### Types of Volatility

1.  **Historical Volatility:** Derived from time series of past market prices.
2.  **Implied Volatility:** Derived from the market price of a market-traded derivative (in particular, an option).

Understanding the spread between historical and implied volatility can itself be a trading signal. A high implied volatility often suggests the market is expecting a large price swing.

### Modeling Volatility

Quants use sophisticated models to capture the complex nature of volatility:

*   **GARCH (Generalized Autoregressive Conditional Heteroskedasticity):** A popular model that accounts for volatility clustering (periods of high volatility are followed by high volatility, and vice versa).
*   **Stochastic Volatility Models:** These models treat volatility as a random process itself, like the Heston model.

At Nexural, our bots use a hybrid approach, combining machine learning with classical models like GARCH to create a more robust forecast of short-term volatility, giving our users a distinct edge.
    `,
  },
  {
    slug: "psychology-of-algorithmic-trading",
    title: "The Psychology of Algorithmic Trading: Overcoming Human Bias",
    date: "2025-07-05",
    category: "Trading Psychology",
    excerpt:
      "Even with bots, human psychology plays a role. Learn to identify and mitigate common cognitive biases that can sabotage your strategies.",
    image: "/human-brain-vs-computer-chip.png",
    author: {
      name: "Jian Li",
      avatar: "/placeholder-3uzyk.png",
    },
    rawContent: `
### The Bot Can't Save You From Yourself

A common misconception is that using a trading bot eliminates emotional decision-making. While it automates execution, the human element is still present in several key areas:

*   **Strategy Design:** Your biases can influence how you design and backtest your bot.
*   **Parameter Tuning:** Constantly tweaking parameters based on recent performance (recency bias) is a classic trap.
*   **Intervention:** Manually overriding your bot during a drawdown (loss aversion) is one of the fastest ways to ruin a profitable strategy.

### Common Biases in Quant Trading

1.  **Overfitting Bias:** This is the cardinal sin of quant trading. It's the tendency to create a strategy that performs exceptionally well on historical data but fails in live trading. It's a form of confirmation bias where you find a pattern in noise.
2.  **Look-ahead Bias:** Using information in your backtest that would not have been available at the time of the trade. For example, using the day's closing price to make a decision at noon.
3.  **Confirmation Bias:** Favoring information that confirms your pre-existing beliefs about a strategy or market behavior, while ignoring contradictory evidence.

### The Nexural Approach to Discipline

Our platform is designed to instill discipline:

> "The goal is not to be right, but to be profitable. This means having a system and sticking to it."

We provide robust backtesting tools that highlight potential overfitting and encourage out-of-sample testing. Our dashboard focuses on long-term performance metrics, helping you avoid knee-jerk reactions to short-term market noise.
    `,
  },
  {
    slug: "building-your-first-momentum-bot",
    title: "Building Your First Momentum Bot with Nexural",
    date: "2025-06-28",
    category: "Bot Development",
    excerpt:
      "A step-by-step guide to designing, backtesting, and deploying a simple yet effective momentum-based trading bot on our platform.",
    image: "/glowing-code-on-screen.png",
    author: {
      name: "Alex Ivanov",
      avatar: "/eastern-european-male-developer.png",
    },
    rawContent: `
### What is Momentum?

Momentum is the tendency for assets that have performed well in the recent past to continue performing well, and for assets that have performed poorly to continue performing poorly. It's a simple but powerful anomaly in financial markets.

### Step 1: Defining the Signal

Our signal will be the asset's return over a specific lookback period. A common choice is the past 12 months, excluding the most recent month to avoid short-term reversal effects.

\`\`\`javascript
// Simplified logic in Nexural's script editor
function calculate_momentum(price_series) {
  const lookback_period = 252; // Approx 1 year in trading days
  const recent_period = 21; // Approx 1 month
  
  const long_term_return = (price_series.last() / price_series.lookback(lookback_period)) - 1;
  const short_term_return = (price_series.last() / price_series.lookback(recent_period)) - 1;
  
  // A more robust signal might adjust for volatility
  return long_term_return; 
}
\`\`\`

### Step 2: Creating the Rules

*   **Entry Rule:** If the momentum signal is positive, go long. If it's negative, go short (or stay flat if you're long-only).
*   **Exit Rule:** Rebalance periodically (e.g., monthly). If the signal flips, exit the position.

### Step 3: Backtesting on Nexural

This is the most crucial step. Use our backtesting engine to test your strategy across different market regimes.

*   **Check your Sharpe Ratio:** Is it consistently above 1?
*   **Analyze your Max Drawdown:** Could you stomach this loss in a live environment?
*   **Run a Monte Carlo simulation:** Our platform can simulate thousands of potential outcomes to stress-test your bot's resilience.

### Step 4: Paper Trading & Deployment

Once you're satisfied with the backtest results, deploy your bot to a paper trading account. This lets you see how it performs with live data without risking real capital. After a successful paper trading period, you can deploy it live with a single click.
    `,
  },
  {
    slug: "platform-update-q3-2025",
    title: "Platform Update: New Features for Q3 2025",
    date: "2025-07-01",
    category: "Platform Updates",
    excerpt:
      "We're excited to announce multi-asset backtesting, advanced risk analytics, and a brand new community forum for collaboration.",
    image: "/placeholder.svg?height=450&width=800",
    author: {
      name: "The Nexural Team",
      avatar: "/public/nexural-icon.png",
    },
    rawContent: `
We've been hard at work, and we're thrilled to roll out some of the most requested features from our community.

### 1. Multi-Asset Portfolio Backtesting

You can now design and backtest strategies that trade a universe of assets simultaneously. Our new portfolio-level backtester allows for sophisticated allocation and rebalancing rules. Test cross-asset momentum or mean-reversion strategies with ease.

### 2. Advanced Risk Analytics

Your dashboard just got a major upgrade. We've added several new modules:

*   **Value at Risk (VaR) Calculation:** Understand your potential downside with historical and parametric VaR calculations.
*   **Correlation Matrix:** See how your bot's assets move in relation to each other.
*   **Rolling Performance Metrics:** Analyze how your Sharpe ratio and drawdowns have changed over time.

### 3. The Nexural Community Forum

Connect with other quants! We've launched a dedicated forum for users to:

*   Share and discuss strategies.
*   Post code snippets and get help from the community.
*   Form teams for collaborative projects.

We believe that collaboration is the key to success in this field, and we can't wait to see what you build together.
    `,
  },
  {
    slug: "mean-reversion-strategies",
    title: "A Primer on Mean Reversion Strategies",
    date: "2025-06-15",
    category: "Market Analysis",
    excerpt:
      "Explore the concept of mean reversion, how to statistically identify it, and why it forms the backbone of many successful short-term trading bots.",
    image: "/placeholder.svg?height=450&width=800",
    author: {
      name: "Dr. Evelyn Reed",
      avatar: "/futuristic-female-scientist.png",
    },
    rawContent: `
### The Core Idea

Mean reversion is a theory suggesting that asset prices and historical returns eventually revert to their long-run mean or average level. Deviations from this average are expected to be temporary.

### Identifying Mean Reversion

A common statistical test for mean reversion is the **Augmented Dickey-Fuller (ADF) Test**. It tests the null hypothesis that a unit root is present in a time series sample.

*   **Null Hypothesis (H0):** The series has a unit root (it is non-stationary, i.e., not mean-reverting).
*   **Alternative Hypothesis (H1):** The series is stationary (it is mean-reverting).

If the p-value from the test is below a certain threshold (e.g., 0.05), you can reject the null hypothesis and conclude the series is likely mean-reverting.

### A Simple Pairs Trading Example

Pairs trading is a classic mean-reversion strategy.

1.  **Find two highly correlated assets:** For example, Coca-Cola (Coke) and Pepsi (Pepsi).
2.  **Calculate the spread:** This could be the price ratio \`(Coke / Pepsi)\` or the difference in their log prices.
3.  **Trade the spread:** When the spread widens significantly from its historical mean, you short the outperforming asset and go long on the underperforming one, betting that the spread will revert.

The Nexural platform includes built-in tools for cointegration analysis, making it easy to find potential pairs for this type of strategy.
    `,
  },
  {
    slug: "risk-management-for-quants",
    title: "Beyond Stop-Loss: Advanced Risk Management for Quants",
    date: "2025-05-20",
    category: "Trading Psychology",
    excerpt:
      "Effective risk management is what separates hobbyists from professionals. Learn about position sizing, portfolio heatmaps, and factor risk.",
    image: "/placeholder.svg?height=450&width=800",
    author: {
      name: "Jian Li",
      avatar: "/placeholder-3uzyk.png",
    },
    rawContent: `
### Position Sizing is Everything

A great signal is useless without proper position sizing. A simple stop-loss is not enough. Professional quants think in terms of portfolio risk contribution.

#### The Kelly Criterion

A famous (and aggressive) formula for determining the optimal size of a series of bets. A simplified version is:

**f\* = (bp - q) / b**

Where:
*   f\* is the fraction of the current bankroll to wager.
*   b is the net odds received on the wager.
*   p is the probability of winning.
*   q is the probability of losing (q = 1-p).

While the full Kelly Criterion is often too aggressive for practical use, "fractional Kelly" (using a fraction of the recommended size) is a common and robust approach.

### Understanding Your Factor Exposure

Your portfolio's returns are driven by underlying risk factors (e.g., momentum, value, size, market beta). Even if your strategy seems unique, it might just be a complicated way of getting exposure to a common factor.

Our new risk analytics dashboard helps you decompose your returns to understand what's truly driving your performance. Are you generating true alpha, or are you just riding the momentum wave? This is a critical question every quant must answer.
    `,
  },
]

// Pre-render markdown content to HTML
const processedPosts = posts.map((post) => ({
  ...post,
  content: marked(post.rawContent) as string,
}))

export function getAllPosts(): Post[] {
  return processedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): Post | undefined {
  return processedPosts.find((post) => post.slug === slug)
}
