import React, { useState } from 'react'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

describe('Additional UI Components', () => {
  describe('Button', () => {
    it('renders with default variant', () => {
      render(<Button>Click me</Button>)
      
      expect(screen.getByText('Click me')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('handles click events', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Test Button</Button>)
      
      fireEvent.click(screen.getByText('Test Button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('supports different variants', () => {
      const { rerender } = render(<Button variant="default">Default</Button>)
      expect(screen.getByText('Default')).toBeInTheDocument()
      
      rerender(<Button variant="destructive">Destructive</Button>)
      expect(screen.getByText('Destructive')).toBeInTheDocument()
      
      rerender(<Button variant="outline">Outline</Button>)
      expect(screen.getByText('Outline')).toBeInTheDocument()
      
      rerender(<Button variant="secondary">Secondary</Button>)
      expect(screen.getByText('Secondary')).toBeInTheDocument()
      
      rerender(<Button variant="ghost">Ghost</Button>)
      expect(screen.getByText('Ghost')).toBeInTheDocument()
      
      rerender(<Button variant="link">Link</Button>)
      expect(screen.getByText('Link')).toBeInTheDocument()
    })

    it('supports different sizes', () => {
      const { rerender } = render(<Button size="default">Default Size</Button>)
      expect(screen.getByText('Default Size')).toBeInTheDocument()
      
      rerender(<Button size="sm">Small</Button>)
      expect(screen.getByText('Small')).toBeInTheDocument()
      
      rerender(<Button size="lg">Large</Button>)
      expect(screen.getByText('Large')).toBeInTheDocument()
      
      rerender(<Button size="icon">Icon</Button>)
      expect(screen.getByText('Icon')).toBeInTheDocument()
    })

    it('handles disabled state', () => {
      render(<Button disabled>Disabled Button</Button>)
      
      const button = screen.getByText('Disabled Button')
      expect(button).toBeDisabled()
    })

    it('supports asChild prop', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      )
      
      expect(screen.getByText('Link Button')).toBeInTheDocument()
      expect(screen.getByRole('link')).toBeInTheDocument()
    })
  })

  describe('Progress', () => {
    it('renders with default value', () => {
      render(<Progress />)
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toBeInTheDocument()
    })

    it('displays correct progress value', () => {
      render(<Progress value={75} />)
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '75')
    })

    it('handles different progress values', () => {
      const { rerender } = render(<Progress value={0} />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
      
      rerender(<Progress value={50} />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50')
      
      rerender(<Progress value={100} />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
    })

    it('respects max value', () => {
      render(<Progress value={150} max={200} />)
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuemax', '200')
      expect(progressBar).toHaveAttribute('aria-valuenow', '150')
    })

    it('applies custom className', () => {
      render(<Progress value={50} className="custom-progress" />)
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveClass('custom-progress')
    })
  })

  describe('Badge', () => {
    it('renders badge content', () => {
      render(<Badge>New</Badge>)
      
      expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('supports different variants', () => {
      const { rerender } = render(<Badge variant="default">Default</Badge>)
      expect(screen.getByText('Default')).toBeInTheDocument()
      
      rerender(<Badge variant="secondary">Secondary</Badge>)
      expect(screen.getByText('Secondary')).toBeInTheDocument()
      
      rerender(<Badge variant="destructive">Destructive</Badge>)
      expect(screen.getByText('Destructive')).toBeInTheDocument()
      
      rerender(<Badge variant="outline">Outline</Badge>)
      expect(screen.getByText('Outline')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<Badge className="custom-badge">Test</Badge>)
      
      expect(screen.getByText('Test')).toHaveClass('custom-badge')
    })
  })

  describe('Tabs', () => {
    const TestTabs = () => (
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          Account content here
        </TabsContent>
        <TabsContent value="password">
          Password content here
        </TabsContent>
        <TabsContent value="settings">
          Settings content here
        </TabsContent>
      </Tabs>
    )

    it('renders tabs with triggers and content', () => {
      render(<TestTabs />)
      
      expect(screen.getByText('Account')).toBeInTheDocument()
      expect(screen.getByText('Password')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Account content here')).toBeInTheDocument()
    })

    it('switches between tabs', async () => {
      render(<TestTabs />)
      
      // Default tab should be active
      expect(screen.getByText('Account content here')).toBeInTheDocument()
      
      // Click on Password tab
      fireEvent.click(screen.getByText('Password'))
      
      await waitFor(() => {
        expect(screen.getByText('Password content here')).toBeInTheDocument()
        expect(screen.queryByText('Account content here')).not.toBeInTheDocument()
      })
    })

    it('maintains tab state', async () => {
      render(<TestTabs />)
      
      // Switch to Settings tab
      fireEvent.click(screen.getByText('Settings'))
      
      await waitFor(() => {
        expect(screen.getByText('Settings content here')).toBeInTheDocument()
      })
      
      // Settings should remain active
      expect(screen.getByText('Settings content here')).toBeInTheDocument()
    })
  })

  describe('Input', () => {
    it('renders input field', () => {
      render(<Input placeholder="Enter text" />)
      
      const input = screen.getByPlaceholderText('Enter text')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
    })

    it('handles value changes', () => {
      const TestInput = () => {
        const [value, setValue] = useState('')
        return (
          <Input 
            value={value} 
            onChange={(e) => setValue(e.target.value)}
            placeholder="Test input"
          />
        )
      }
      
      render(<TestInput />)
      
      const input = screen.getByPlaceholderText('Test input')
      fireEvent.change(input, { target: { value: 'Hello World' } })
      
      expect(input).toHaveValue('Hello World')
    })

    it('supports different input types', () => {
      const { rerender } = render(<Input type="text" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')
      
      rerender(<Input type="email" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
      
      rerender(<Input type="password" />)
      expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'password')
    })

    it('handles disabled state', () => {
      render(<Input disabled placeholder="Disabled input" />)
      
      const input = screen.getByPlaceholderText('Disabled input')
      expect(input).toBeDisabled()
    })

    it('applies custom className', () => {
      render(<Input className="custom-input" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('custom-input')
    })
  })

  describe('Textarea', () => {
    it('renders textarea', () => {
      render(<Textarea placeholder="Enter description" />)
      
      const textarea = screen.getByPlaceholderText('Enter description')
      expect(textarea).toBeInTheDocument()
      expect(textarea.tagName).toBe('TEXTAREA')
    })

    it('handles value changes', () => {
      const TestTextarea = () => {
        const [value, setValue] = useState('')
        return (
          <Textarea 
            value={value} 
            onChange={(e) => setValue(e.target.value)}
            placeholder="Test textarea"
          />
        )
      }
      
      render(<TestTextarea />)
      
      const textarea = screen.getByPlaceholderText('Test textarea')
      fireEvent.change(textarea, { target: { value: 'Multi-line\ntext content' } })
      
      expect(textarea).toHaveValue('Multi-line\ntext content')
    })

    it('supports resize behavior', () => {
      render(<Textarea className="resize-none" />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('resize-none')
    })

    it('handles disabled state', () => {
      render(<Textarea disabled placeholder="Disabled textarea" />)
      
      const textarea = screen.getByPlaceholderText('Disabled textarea')
      expect(textarea).toBeDisabled()
    })
  })

  describe('Slider', () => {
    it('renders slider with default value', () => {
      render(<Slider defaultValue={[50]} max={100} step={1} />)
      
      const slider = screen.getByRole('slider')
      expect(slider).toBeInTheDocument()
    })

    it('handles value changes', () => {
      const TestSlider = () => {
        const [value, setValue] = useState([25])
        return (
          <div>
            <Slider value={value} onValueChange={setValue} max={100} />
            <span>Value: {value[0]}</span>
          </div>
        )
      }
      
      render(<TestSlider />)
      
      expect(screen.getByText('Value: 25')).toBeInTheDocument()
      
      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '75' } })
      
      expect(screen.getByText('Value: 75')).toBeInTheDocument()
    })

    it('supports range sliders', () => {
      render(<Slider defaultValue={[25, 75]} max={100} />)
      
      const sliders = screen.getAllByRole('slider')
      expect(sliders.length).toBe(2)
    })

    it('respects min and max values', () => {
      render(<Slider defaultValue={[50]} min={10} max={90} />)
      
      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('aria-valuemin', '10')
      expect(slider).toHaveAttribute('aria-valuemax', '90')
    })

    it('handles disabled state', () => {
      render(<Slider defaultValue={[50]} disabled />)
      
      const slider = screen.getByRole('slider')
      expect(slider).toBeDisabled()
    })
  })

  describe('Avatar', () => {
    it('renders with image', () => {
      render(
        <Avatar>
          <AvatarImage src="/test-avatar.jpg" alt="Test User" />
          <AvatarFallback>TU</AvatarFallback>
        </Avatar>
      )
      
      expect(screen.getByAltText('Test User')).toBeInTheDocument()
    })

    it('falls back to fallback when image fails', async () => {
      render(
        <Avatar>
          <AvatarImage src="/nonexistent.jpg" alt="Test User" />
          <AvatarFallback>TU</AvatarFallback>
        </Avatar>
      )
      
      // Should show fallback
      await waitFor(() => {
        expect(screen.getByText('TU')).toBeInTheDocument()
      })
    })

    it('renders fallback only', () => {
      render(
        <Avatar>
          <AvatarFallback>JS</AvatarFallback>
        </Avatar>
      )
      
      expect(screen.getByText('JS')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <Avatar className="custom-avatar">
          <AvatarFallback>CA</AvatarFallback>
        </Avatar>
      )
      
      const avatar = screen.getByText('CA').closest('span')
      expect(avatar).toHaveClass('custom-avatar')
    })
  })

  describe('Component Integration', () => {
    it('creates complex financial interfaces', () => {
      const FinancialInterface = () => {
        const [riskLevel, setRiskLevel] = useState([3])
        const [activeTab, setActiveTab] = useState('performance')
        
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback>TT</AvatarFallback>
              </Avatar>
              <div>
                <Badge variant="secondary">Active Strategy</Badge>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="risk">Risk</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="performance">
                <div className="space-y-4">
                  <h3>Strategy Performance</h3>
                  <Progress value={75} />
                  <p>Total Return: +24.5%</p>
                </div>
              </TabsContent>
              
              <TabsContent value="risk">
                <div className="space-y-4">
                  <h3>Risk Management</h3>
                  <label>Risk Level: {riskLevel[0]}</label>
                  <Slider 
                    value={riskLevel} 
                    onValueChange={setRiskLevel}
                    max={10}
                    step={1}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="settings">
                <div className="space-y-4">
                  <Input placeholder="Strategy Name" />
                  <Textarea placeholder="Strategy Description" />
                  <Button>Save Configuration</Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )
      }
      
      render(<FinancialInterface />)
      
      // All components should render
      expect(screen.getByText('TT')).toBeInTheDocument()
      expect(screen.getByText('Active Strategy')).toBeInTheDocument()
      expect(screen.getByText('Performance')).toBeInTheDocument()
      expect(screen.getByText('Strategy Performance')).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('handles complex interactions', async () => {
      const InteractiveInterface = () => {
        const [progress, setProgress] = useState(0)
        const [riskLevel, setRiskLevel] = useState([5])
        
        const handleCalculate = () => {
          setProgress(75)
        }
        
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button onClick={handleCalculate}>Calculate Risk</Button>
              <Badge variant={progress > 50 ? "destructive" : "secondary"}>
                {progress > 50 ? "High Risk" : "Normal"}
              </Badge>
            </div>
            
            <Progress value={progress} />
            
            <div>
              <label>Risk Tolerance: {riskLevel[0]}</label>
              <Slider 
                value={riskLevel} 
                onValueChange={setRiskLevel}
                max={10}
              />
            </div>
            
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                Risk Level: {riskLevel[0]}/10
              </TabsContent>
              
              <TabsContent value="analysis">
                Progress: {progress}%
              </TabsContent>
            </Tabs>
          </div>
        )
      }
      
      render(<InteractiveInterface />)
      
      // Initial state
      expect(screen.getByText('Normal')).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
      
      // Click calculate button
      fireEvent.click(screen.getByText('Calculate Risk'))
      
      await waitFor(() => {
        expect(screen.getByText('High Risk')).toBeInTheDocument()
        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75')
      })
      
      // Switch to analysis tab
      fireEvent.click(screen.getByText('Analysis'))
      
      await waitFor(() => {
        expect(screen.getByText('Progress: 75%')).toBeInTheDocument()
      })
    })
  })

  describe('Form Elements', () => {
    it('creates complete form with validation', () => {
      const TradingForm = () => {
        const [symbol, setSymbol] = useState('')
        const [quantity, setQuantity] = useState('')
        const [notes, setNotes] = useState('')
        const [riskLevel, setRiskLevel] = useState([2])
        
        const isValid = symbol.length > 0 && quantity.length > 0
        
        return (
          <form className="space-y-4">
            <div>
              <label>Symbol</label>
              <Input 
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="AAPL"
              />
            </div>
            
            <div>
              <label>Quantity</label>
              <Input 
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="100"
              />
            </div>
            
            <div>
              <label>Risk Level: {riskLevel[0]}</label>
              <Slider 
                value={riskLevel}
                onValueChange={setRiskLevel}
                max={5}
                step={1}
              />
            </div>
            
            <div>
              <label>Notes</label>
              <Textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Trade notes..."
              />
            </div>
            
            <div className="flex gap-2">
              <Button disabled={!isValid} variant="default">
                Place Order
              </Button>
              <Badge variant={isValid ? "secondary" : "destructive"}>
                {isValid ? "Ready" : "Invalid"}
              </Badge>
            </div>
            
            <Progress value={isValid ? 100 : 0} />
          </form>
        )
      }
      
      render(<TradingForm />)
      
      // Initial state - form should be invalid
      expect(screen.getByText('Invalid')).toBeInTheDocument()
      expect(screen.getByText('Place Order')).toBeDisabled()
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
      
      // Fill in required fields
      fireEvent.change(screen.getByPlaceholderText('AAPL'), { target: { value: 'AAPL' } })
      fireEvent.change(screen.getByPlaceholderText('100'), { target: { value: '100' } })
      
      // Form should become valid
      expect(screen.getByText('Ready')).toBeInTheDocument()
      expect(screen.getByText('Place Order')).toBeEnabled()
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
    })
  })

  describe('Accessibility', () => {
    it('provides proper ARIA attributes', () => {
      render(
        <div>
          <Button aria-label="Save strategy">💾</Button>
          <Progress value={50} aria-label="Loading progress" />
          <Badge role="status">Active</Badge>
          <Input aria-label="Strategy name" />
          <Slider aria-label="Risk level" defaultValue={[5]} max={10} />
        </div>
      )
      
      expect(screen.getByLabelText('Save strategy')).toBeInTheDocument()
      expect(screen.getByLabelText('Loading progress')).toBeInTheDocument()
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByLabelText('Strategy name')).toBeInTheDocument()
      expect(screen.getByLabelText('Risk level')).toBeInTheDocument()
    })

    it('supports keyboard navigation', () => {
      render(
        <div>
          <Button>First</Button>
          <Button>Second</Button>
          <Input placeholder="Input field" />
        </div>
      )
      
      const firstButton = screen.getByText('First')
      const secondButton = screen.getByText('Second')
      const input = screen.getByPlaceholderText('Input field')
      
      // Should be focusable
      fireEvent.focus(firstButton)
      expect(firstButton).toHaveFocus()
      
      fireEvent.focus(secondButton)
      expect(secondButton).toHaveFocus()
      
      fireEvent.focus(input)
      expect(input).toHaveFocus()
    })

    it('provides screen reader content', () => {
      render(
        <div>
          <Progress value={75} />
          <Badge>Status: Active</Badge>
          <Slider defaultValue={[3]} max={5} />
        </div>
      )
      
      const progress = screen.getByRole('progressbar')
      expect(progress).toHaveAttribute('aria-valuenow', '75')
      
      expect(screen.getByText('Status: Active')).toBeInTheDocument()
      
      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('aria-valuenow', '3')
    })
  })

  describe('Theming and Styling', () => {
    it('applies consistent theme across components', () => {
      render(
        <div>
          <Button className="themed-button">Button</Button>
          <Badge className="themed-badge">Badge</Badge>
          <Input className="themed-input" />
          <Progress className="themed-progress" value={50} />
        </div>
      )
      
      expect(screen.getByText('Button')).toHaveClass('themed-button')
      expect(screen.getByText('Badge')).toHaveClass('themed-badge')
      expect(screen.getByRole('textbox')).toHaveClass('themed-input')
      expect(screen.getByRole('progressbar')).toHaveClass('themed-progress')
    })

    it('supports dark mode styling', () => {
      render(
        <div className="dark">
          <Button>Dark Button</Button>
          <Badge>Dark Badge</Badge>
          <Input placeholder="Dark Input" />
        </div>
      )
      
      // Should render without errors in dark mode
      expect(screen.getByText('Dark Button')).toBeInTheDocument()
      expect(screen.getByText('Dark Badge')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Dark Input')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('renders multiple components efficiently', () => {
      const startTime = performance.now()
      
      render(
        <div>
          {Array.from({ length: 50 }, (_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Button size="sm">Button {i}</Button>
              <Badge>Badge {i}</Badge>
              <Progress value={i * 2} />
            </div>
          ))}
        </div>
      )
      
      const endTime = performance.now()
      
      // Should render 50 sets of components quickly
      expect(endTime - startTime).toBeLessThan(1000)
      
      // All should be present
      expect(screen.getByText('Button 0')).toBeInTheDocument()
      expect(screen.getByText('Badge 49')).toBeInTheDocument()
    })

    it('handles rapid state changes', () => {
      const RapidUpdates = () => {
        const [count, setCount] = useState(0)
        
        return (
          <div>
            <Button onClick={() => setCount(c => c + 1)}>
              Count: {count}
            </Button>
            <Progress value={count % 100} />
            <Badge variant={count % 2 === 0 ? "secondary" : "default"}>
              {count % 2 === 0 ? "Even" : "Odd"}
            </Badge>
          </div>
        )
      }
      
      render(<RapidUpdates />)
      
      const button = screen.getByText('Count: 0')
      
      // Rapid clicks
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button)
      }
      
      expect(screen.getByText('Count: 10')).toBeInTheDocument()
      expect(screen.getByText('Even')).toBeInTheDocument()
    })
  })
})
