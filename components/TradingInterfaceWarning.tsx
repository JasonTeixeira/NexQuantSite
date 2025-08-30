"use client"

import { AlertTriangle, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function TradingInterfaceWarning() {
  return (
    <div className="mb-6">
      {/* Professional Risk Notice */}
      <Alert className="bg-gray-900/50 border border-gray-700">
        <AlertTriangle className="h-4 w-4 text-gray-400" />
        <AlertDescription className="text-gray-300 text-sm">
          <strong className="text-gray-200">Risk Notice:</strong> Trading involves substantial risk of loss and is not suitable 
          for all investors. We provide execution software only and do not hold client funds. All trading decisions are your 
          sole responsibility. This platform does not provide investment advice.
        </AlertDescription>
      </Alert>
    </div>
  )
}

// Pre-trade confirmation component
export function PreTradeWarning({ onAccept, onCancel }: { onAccept: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-md w-full p-6">
        <div className="text-center mb-4">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white">Trade Confirmation</h3>
        </div>
        
        <div className="space-y-4 mb-6">
          <p className="text-sm text-gray-300">
            You are about to execute a trade. Please confirm that you understand:
          </p>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• Trading involves risk of loss</li>
            <li>• This decision is yours alone</li>
            <li>• Past performance doesn't guarantee future results</li>
            <li>• You should only trade with risk capital</li>
          </ul>
          <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
            <p className="text-xs text-gray-400 text-center">
              By proceeding, you acknowledge that you have read and accept our terms of service.
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-black rounded font-medium text-sm transition-colors"
          >
            Confirm Trade
          </button>
        </div>
      </div>
    </div>
  )
}
