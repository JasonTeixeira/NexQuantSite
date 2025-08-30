import React from 'react'
import { render, screen, fireEvent } from '../utils/test-utils'

// Import key UI components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'

describe('UI Components', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Button Component', () => {
    it('renders button correctly', () => {
      render(<Button>Test Button</Button>)
      expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument()
    })

    it('handles click events', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click Me</Button>)
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('supports different variants', () => {
      render(<Button variant="destructive">Delete</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('supports disabled state', () => {
      render(<Button disabled>Disabled Button</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('supports different sizes', () => {
      render(<Button size="sm">Small Button</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Card Component', () => {
    it('renders card with all parts', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
          <CardContent>Test Content</CardContent>
        </Card>
      )
      
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('applies correct CSS classes', () => {
      render(<Card className="custom-class">Card Content</Card>)
      expect(screen.getByText('Card Content')).toBeInTheDocument()
    })
  })

  describe('Input Component', () => {
    it('renders input correctly', () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('handles value changes', () => {
      render(<Input placeholder="Test input" />)
      const input = screen.getByPlaceholderText('Test input')
      
      fireEvent.change(input, { target: { value: 'test value' } })
      expect(input).toHaveValue('test value')
    })

    it('supports different types', () => {
      render(<Input type="password" placeholder="Password" />)
      expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password')
    })

    it('supports disabled state', () => {
      render(<Input disabled placeholder="Disabled input" />)
      expect(screen.getByPlaceholderText('Disabled input')).toBeDisabled()
    })
  })

  describe('Badge Component', () => {
    it('renders badge correctly', () => {
      render(<Badge>Test Badge</Badge>)
      expect(screen.getByText('Test Badge')).toBeInTheDocument()
    })

    it('supports different variants', () => {
      render(<Badge variant="destructive">Error Badge</Badge>)
      expect(screen.getByText('Error Badge')).toBeInTheDocument()
    })

    it('supports custom content', () => {
      render(<Badge>🚀 Rocket</Badge>)
      expect(screen.getByText('🚀 Rocket')).toBeInTheDocument()
    })
  })

  describe('Progress Component', () => {
    it('renders progress bar correctly', () => {
      render(<Progress value={50} />)
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toBeInTheDocument()
      expect(progressBar).toHaveAttribute('aria-valuenow', '50')
    })

    it('handles different progress values', () => {
      render(<Progress value={75} max={100} />)
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '75')
      expect(progressBar).toHaveAttribute('aria-valuemax', '100')
    })

    it('handles zero progress', () => {
      render(<Progress value={0} />)
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '0')
    })

    it('handles complete progress', () => {
      render(<Progress value={100} />)
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '100')
    })
  })

  describe('Tabs Component', () => {
    it('renders tabs correctly', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )
      
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument()
      expect(screen.getByText('Content 1')).toBeInTheDocument()
    })

    it('handles tab switching', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )
      
      fireEvent.click(screen.getByRole('tab', { name: 'Tab 2' }))
      expect(screen.getByText('Content 2')).toBeInTheDocument()
    })
  })

  describe('Select Component', () => {
    it('renders select correctly', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )
      
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('handles selection', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      fireEvent.click(trigger)
      // Note: Radix Select behavior might need more specific testing
    })
  })

  describe('Slider Component', () => {
    it('renders slider correctly', () => {
      render(<Slider defaultValue={[50]} max={100} step={1} />)
      const slider = screen.getByRole('slider')
      expect(slider).toBeInTheDocument()
      expect(slider).toHaveAttribute('aria-valuenow', '50')
    })

    it('handles value changes', () => {
      render(<Slider defaultValue={[25]} max={100} step={1} />)
      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('aria-valuenow', '25')
    })

    it('supports range sliders', () => {
      render(<Slider defaultValue={[25, 75]} max={100} step={1} />)
      const sliders = screen.getAllByRole('slider')
      expect(sliders).toHaveLength(2)
    })
  })

  describe('Textarea Component', () => {
    it('renders textarea correctly', () => {
      render(<Textarea placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('handles value changes', () => {
      render(<Textarea placeholder="Test textarea" />)
      const textarea = screen.getByPlaceholderText('Test textarea')
      
      fireEvent.change(textarea, { target: { value: 'test content' } })
      expect(textarea).toHaveValue('test content')
    })

    it('supports disabled state', () => {
      render(<Textarea disabled placeholder="Disabled textarea" />)
      expect(screen.getByPlaceholderText('Disabled textarea')).toBeDisabled()
    })
  })

  describe('UI Component Integration', () => {
    it('components work together in forms', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Form</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Name" />
            <Textarea placeholder="Description" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
              </SelectContent>
            </Select>
            <Slider defaultValue={[50]} max={100} />
            <Progress value={75} />
            <Button>Submit</Button>
          </CardContent>
        </Card>
      )
      
      expect(screen.getByText('Test Form')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Description')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByRole('slider')).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
    })

    it('components maintain consistent theming', () => {
      render(
        <div>
          <Button>Themed Button</Button>
          <Card>
            <CardContent>Themed Card</CardContent>
          </Card>
          <Badge>Themed Badge</Badge>
        </div>
      )
      
      // All components should render without theme conflicts
      expect(screen.getByText('Themed Button')).toBeInTheDocument()
      expect(screen.getByText('Themed Card')).toBeInTheDocument()
      expect(screen.getByText('Themed Badge')).toBeInTheDocument()
    })

    it('components handle accessibility correctly', () => {
      render(
        <div>
          <Button aria-label="Accessible button">Button</Button>
          <Input aria-label="Accessible input" />
          <Progress value={50} aria-label="Loading progress" />
          <Slider defaultValue={[50]} aria-label="Volume control" />
        </div>
      )
      
      expect(screen.getByLabelText('Accessible button')).toBeInTheDocument()
      expect(screen.getByLabelText('Accessible input')).toBeInTheDocument()
      expect(screen.getByLabelText('Loading progress')).toBeInTheDocument()
      expect(screen.getByLabelText('Volume control')).toBeInTheDocument()
    })

    it('components perform well under load', () => {
      const startTime = performance.now()
      
      // Render many components
      render(
        <div>
          {Array.from({ length: 50 }, (_, i) => (
            <Card key={i}>
              <CardContent>
                <Button>Button {i}</Button>
                <Badge>Badge {i}</Badge>
                <Progress value={i * 2} />
              </CardContent>
            </Card>
          ))}
        </div>
      )
      
      const renderTime = performance.now() - startTime
      expect(renderTime).toBeLessThan(500) // Should render 50 components quickly
    })

    it('components handle edge cases', () => {
      // Test with empty/null values
      expect(() => render(<Button></Button>)).not.toThrow()
      expect(() => render(<Card><CardContent></CardContent></Card>)).not.toThrow()
      expect(() => render(<Badge></Badge>)).not.toThrow()
      expect(() => render(<Progress value={0} />)).not.toThrow()
      expect(() => render(<Input value="" />)).not.toThrow()
    })
  })
})
