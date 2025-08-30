"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface GuidedTourProps {
  onClose: () => void
}

const tourSteps = [
  {
    id: 1,
    title: "Welcome to NexusQuant",
    content: "Your professional institutional trading terminal with AI-powered insights.",
    highlight: "overview"
  },
  {
    id: 2,
    title: "Performance Dashboard",
    content: "Monitor your portfolio performance, returns, and risk metrics in real-time.",
    highlight: "performance"
  },
  {
    id: 3,
    title: "Strategy Lab",
    content: "Develop, backtest, and optimize trading strategies with our ML factory.",
    highlight: "strategy"
  },
  {
    id: 4,
    title: "BYOK Security",
    content: "Securely manage your API keys and data sources with military-grade encryption.",
    highlight: "byok"
  }
]

export default function GuidedTour({ onClose }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onClose()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const step = tourSteps[currentStep]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-96 bg-[#0f1320] border-[#2a2a3e]">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">
              {step.title}
            </CardTitle>
            <Badge variant="outline" className="mt-2">
              Step {currentStep + 1} of {tourSteps.length}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[#a0a0b8]">
            {step.content}
          </p>
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button onClick={nextStep}>
              {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
              {currentStep !== tourSteps.length - 1 && (
                <ChevronRight className="w-4 h-4 ml-1" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}