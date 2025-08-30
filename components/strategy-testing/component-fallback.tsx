"use client"

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ComponentFallbackProps {
  componentName?: string
  error?: string
  onRetry?: () => void
}

export default function ComponentFallback({ 
  componentName = "Component", 
  error = "not available",
  onRetry 
}: ComponentFallbackProps) {
  return (
    <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {componentName} Unavailable
            </h3>
            <p className="text-[#a0a0b8] text-sm mb-4">
              The {componentName.toLowerCase()} component is {error}. 
              This might be due to a loading issue or the component is still being developed.
            </p>
          </div>

          {onRetry && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRetry}
              className="border-[#2a2a3e] text-white hover:bg-[#2a2a3e]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          
          <div className="text-xs text-[#606078] mt-4">
            Component: {componentName}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

