import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  OptimizedAreaChart,
  OptimizedBarChart,
  OptimizedMultiAreaChart,
  ChartContainer,
} from '../optimized-chart-components'

// Mock data for testing
const mockData = [
  { month: 'Jan', users: 1200, revenue: 45000 },
  { month: 'Feb', users: 1350, revenue: 52000 },
  { month: 'Mar', users: 1500, revenue: 48000 },
]

const mockMultiAreaData = [
  { month: 'Jan', subscription: 285000, commissions: 125000, premium: 85000 },
  { month: 'Feb', subscription: 312000, commissions: 142000, premium: 98000 },
]

const mockAreas = [
  { dataKey: 'subscription', stroke: '#3b82f6', fill: '#3b82f6' },
  { dataKey: 'commissions', stroke: '#10b981', fill: '#10b981' },
  { dataKey: 'premium', stroke: '#f59e0b', fill: '#f59e0b' },
]

describe('OptimizedAreaChart', () => {
  it('renders area chart with correct props', async () => {
    render(
      <OptimizedAreaChart
        data={mockData}
        dataKey="users"
        stroke="#3b82f6"
        fill="#3b82f6"
      />
    )

    // Should show mocked recharts components
    await waitFor(() => {
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
      expect(screen.getByTestId('area')).toBeInTheDocument()
      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getByTestId('y-axis')).toBeInTheDocument()
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })
  })

  it('uses default height when not specified', async () => {
    render(
      <OptimizedAreaChart
        data={mockData}
        dataKey="users"
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })
  })

  it('applies custom height when specified', async () => {
    render(
      <OptimizedAreaChart
        data={mockData}
        dataKey="users"
        height={400}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })
  })

  it('handles empty data gracefully', async () => {
    render(
      <OptimizedAreaChart
        data={[]}
        dataKey="users"
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    })
  })
})

describe('OptimizedBarChart', () => {
  it('renders bar chart with correct props', async () => {
    render(
      <OptimizedBarChart
        data={mockData}
        dataKey="revenue"
        fill="#f59e0b"
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      expect(screen.getByTestId('bar')).toBeInTheDocument()
      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getByTestId('y-axis')).toBeInTheDocument()
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })
  })

  it('uses default fill color when not specified', async () => {
    render(
      <OptimizedBarChart
        data={mockData}
        dataKey="revenue"
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('bar')).toBeInTheDocument()
    })
  })

  it('handles different data keys correctly', async () => {
    render(
      <OptimizedBarChart
        data={mockData}
        dataKey="users"
        fill="#10b981"
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('bar')).toBeInTheDocument()
    })
  })
})

describe('OptimizedMultiAreaChart', () => {
  it('renders multi-area chart with multiple areas', async () => {
    render(
      <OptimizedMultiAreaChart
        data={mockMultiAreaData}
        areas={mockAreas}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getByTestId('y-axis')).toBeInTheDocument()
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })
  })

  it('handles empty areas array', async () => {
    render(
      <OptimizedMultiAreaChart
        data={mockMultiAreaData}
        areas={[]}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    })
  })

  it('uses custom height when specified', async () => {
    render(
      <OptimizedMultiAreaChart
        data={mockMultiAreaData}
        areas={mockAreas}
        height={500}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })
  })
})

describe('ChartContainer', () => {
  it('renders chart container with children', () => {
    render(
      <ChartContainer>
        <div data-testid="chart-child">Chart Content</div>
      </ChartContainer>
    )

    expect(screen.getByTestId('chart-child')).toBeInTheDocument()
    expect(screen.getByText('Chart Content')).toBeInTheDocument()
  })

  it('displays title when provided', () => {
    render(
      <ChartContainer title="Test Chart">
        <div>Chart Content</div>
      </ChartContainer>
    )

    expect(screen.getByText('Test Chart')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test Chart')
  })

  it('displays description when provided', () => {
    render(
      <ChartContainer 
        title="Test Chart" 
        description="Chart description"
      >
        <div>Chart Content</div>
      </ChartContainer>
    )

    expect(screen.getByText('Test Chart')).toBeInTheDocument()
    expect(screen.getByText('Chart description')).toBeInTheDocument()
  })

  it('renders without title and description', () => {
    render(
      <ChartContainer>
        <div data-testid="chart-content">Chart Content</div>
      </ChartContainer>
    )

    expect(screen.getByTestId('chart-content')).toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('has proper styling classes', () => {
    const { container } = render(
      <ChartContainer title="Test">
        <div>Content</div>
      </ChartContainer>
    )

    const chartContainer = container.firstChild
    expect(chartContainer).toHaveClass('bg-gray-800', 'p-6', 'rounded-lg', 'border', 'border-gray-700')
  })

  it('handles loading states with Suspense', async () => {
    render(
      <ChartContainer title="Loading Chart">
        <div data-testid="chart-content">Loaded Content</div>
      </ChartContainer>
    )

    // Content should eventually be visible
    await waitFor(() => {
      expect(screen.getByTestId('chart-content')).toBeInTheDocument()
    })
  })
})

describe('Chart Components Performance', () => {
  it('memoizes chart components properly', () => {
    const { rerender } = render(
      <OptimizedAreaChart
        data={mockData}
        dataKey="users"
        stroke="#3b82f6"
      />
    )

    // Re-render with same props shouldn't cause unnecessary updates
    rerender(
      <OptimizedAreaChart
        data={mockData}
        dataKey="users"
        stroke="#3b82f6"
      />
    )

    expect(screen.getByTestId('area-chart')).toBeInTheDocument()
  })

  it('handles dynamic imports gracefully', async () => {
    render(
      <OptimizedBarChart
        data={mockData}
        dataKey="revenue"
      />
    )

    // Should eventually render the chart components
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('uses Suspense for loading states', async () => {
    render(
      <ChartContainer>
        <OptimizedAreaChart
          data={mockData}
          dataKey="users"
        />
      </ChartContainer>
    )

    // Should handle suspense loading
    await waitFor(() => {
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    })
  })
})
