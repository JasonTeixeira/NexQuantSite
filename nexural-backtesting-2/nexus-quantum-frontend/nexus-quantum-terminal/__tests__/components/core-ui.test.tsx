import React, { useState } from 'react'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

describe('Core UI Components', () => {
  describe('Accordion', () => {
    const TestAccordion = () => (
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trading Strategies</AccordionTrigger>
          <AccordionContent>
            RSI, MACD, and Bollinger Band strategies
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Risk Management</AccordionTrigger>
          <AccordionContent>
            Portfolio optimization and risk controls
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    it('renders accordion with items', () => {
      render(<TestAccordion />)
      
      expect(screen.getByText('Trading Strategies')).toBeInTheDocument()
      expect(screen.getByText('Risk Management')).toBeInTheDocument()
    })

    it('expands and collapses items', async () => {
      render(<TestAccordion />)
      
      const trigger = screen.getByText('Trading Strategies')
      
      // Content should be hidden initially
      expect(screen.queryByText('RSI, MACD, and Bollinger Band strategies')).not.toBeVisible()
      
      // Click to expand
      fireEvent.click(trigger)
      
      await waitFor(() => {
        expect(screen.getByText('RSI, MACD, and Bollinger Band strategies')).toBeVisible()
      })
    })

    it('supports single mode (only one item open)', async () => {
      render(<TestAccordion />)
      
      // Open first item
      fireEvent.click(screen.getByText('Trading Strategies'))
      
      await waitFor(() => {
        expect(screen.getByText('RSI, MACD, and Bollinger Band strategies')).toBeVisible()
      })
      
      // Open second item
      fireEvent.click(screen.getByText('Risk Management'))
      
      await waitFor(() => {
        expect(screen.getByText('Portfolio optimization and risk controls')).toBeVisible()
        // First item should be closed
        expect(screen.queryByText('RSI, MACD, and Bollinger Band strategies')).not.toBeVisible()
      })
    })
  })

  describe('AlertDialog', () => {
    const TestAlertDialog = () => {
      const [open, setOpen] = useState(false)
      
      return (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <button>Delete Strategy</button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your trading strategy. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )
    }

    it('renders trigger button', () => {
      render(<TestAlertDialog />)
      
      expect(screen.getByText('Delete Strategy')).toBeInTheDocument()
    })

    it('opens dialog when trigger is clicked', async () => {
      render(<TestAlertDialog />)
      
      fireEvent.click(screen.getByText('Delete Strategy'))
      
      await waitFor(() => {
        expect(screen.getByText('Confirm Deletion')).toBeInTheDocument()
        expect(screen.getByText('This will permanently delete your trading strategy')).toBeInTheDocument()
      })
    })

    it('provides cancel and action buttons', async () => {
      render(<TestAlertDialog />)
      
      fireEvent.click(screen.getByText('Delete Strategy'))
      
      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument()
        expect(screen.getByText('Delete')).toBeInTheDocument()
      })
    })
  })

  describe('Alert', () => {
    it('renders basic alert', () => {
      render(
        <Alert>
          <AlertTitle>Performance Alert</AlertTitle>
          <AlertDescription>
            Your strategy is performing above expected parameters.
          </AlertDescription>
        </Alert>
      )
      
      expect(screen.getByText('Performance Alert')).toBeInTheDocument()
      expect(screen.getByText('Your strategy is performing above expected parameters.')).toBeInTheDocument()
    })

    it('supports different variants', () => {
      const { rerender } = render(
        <Alert variant="default">
          <AlertDescription>Default alert</AlertDescription>
        </Alert>
      )
      
      // Should render without error
      expect(screen.getByText('Default alert')).toBeInTheDocument()
      
      rerender(
        <Alert variant="destructive">
          <AlertDescription>Error alert</AlertDescription>
        </Alert>
      )
      
      expect(screen.getByText('Error alert')).toBeInTheDocument()
    })
  })

  describe('Checkbox', () => {
    it('renders unchecked by default', () => {
      render(<Checkbox />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })

    it('can be controlled', () => {
      const TestCheckbox = () => {
        const [checked, setChecked] = useState(false)
        
        return (
          <div>
            <Checkbox checked={checked} onCheckedChange={setChecked} />
            <span>{checked ? 'Checked' : 'Unchecked'}</span>
          </div>
        )
      }
      
      render(<TestCheckbox />)
      
      expect(screen.getByText('Unchecked')).toBeInTheDocument()
      
      fireEvent.click(screen.getByRole('checkbox'))
      
      expect(screen.getByText('Checked')).toBeInTheDocument()
    })

    it('supports disabled state', () => {
      render(<Checkbox disabled />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeDisabled()
    })
  })

  describe('Separator', () => {
    it('renders horizontal separator by default', () => {
      render(<Separator />)
      
      const separator = screen.getByRole('separator')
      expect(separator).toBeInTheDocument()
      expect(separator).toHaveAttribute('aria-orientation', 'horizontal')
    })

    it('supports vertical orientation', () => {
      render(<Separator orientation="vertical" />)
      
      const separator = screen.getByRole('separator')
      expect(separator).toHaveAttribute('aria-orientation', 'vertical')
    })

    it('applies custom className', () => {
      render(<Separator className="custom-separator" />)
      
      const separator = screen.getByRole('separator')
      expect(separator).toHaveClass('custom-separator')
    })
  })

  describe('Skeleton', () => {
    it('renders skeleton loader', () => {
      render(<Skeleton />)
      
      // Skeleton should be present in DOM
      const skeleton = document.querySelector('[class*="animate-pulse"]')
      expect(skeleton).toBeInTheDocument()
    })

    it('applies custom dimensions', () => {
      render(<Skeleton className="h-20 w-40" />)
      
      const skeleton = document.querySelector('[class*="animate-pulse"]')
      expect(skeleton).toHaveClass('h-20', 'w-40')
    })

    it('provides loading state indication', () => {
      render(
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      )
      
      const skeletons = document.querySelectorAll('[class*="animate-pulse"]')
      expect(skeletons).toHaveLength(2)
    })
  })

  describe('Component Integration', () => {
    it('components work together in complex layouts', () => {
      const ComplexLayout = () => (
        <div>
          <Alert>
            <AlertTitle>Strategy Performance</AlertTitle>
            <AlertDescription>Real-time performance monitoring</AlertDescription>
          </Alert>
          
          <Separator className="my-4" />
          
          <Accordion type="single" collapsible>
            <AccordionItem value="performance">
              <AccordionTrigger>Performance Metrics</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <div className="mt-4">
            <Checkbox /> <span>Enable real-time updates</span>
          </div>
        </div>
      )
      
      render(<ComplexLayout />)
      
      // All components should render
      expect(screen.getByText('Strategy Performance')).toBeInTheDocument()
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument()
      expect(screen.getByText('Enable real-time updates')).toBeInTheDocument()
      expect(screen.getByRole('separator')).toBeInTheDocument()
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('maintains consistent styling across components', () => {
      render(
        <div>
          <Alert className="test-alert">
            <AlertDescription>Test</AlertDescription>
          </Alert>
          <Separator className="test-separator" />
          <Checkbox className="test-checkbox" />
        </div>
      )
      
      // Should apply custom classes
      expect(document.querySelector('.test-alert')).toBeInTheDocument()
      expect(document.querySelector('.test-separator')).toBeInTheDocument()
      expect(document.querySelector('.test-checkbox')).toBeInTheDocument()
    })
  })
})
