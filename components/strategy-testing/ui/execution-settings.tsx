"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ExecutionSettings({ onApply }: { onApply: (opts: { costsBps: number; slippageBps: number; venue: string; partialFillRate: number }) => void }) {
  const presets = [
    { name: 'Retail', costsBps: 5, slippageBps: 10, venue: 'Smart Route', partialFillRate: 0.6 },
    { name: 'Pro', costsBps: 2, slippageBps: 5, venue: 'Exchange', partialFillRate: 0.8 },
    { name: 'HFT', costsBps: 1, slippageBps: 3, venue: 'Direct Access', partialFillRate: 0.9 },
  ]
  return (
    <Card className="bg-[#15151f] border-[#2a2a3e]">
      <CardHeader><CardTitle className="text-white text-sm">Execution Settings</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-2">
          {presets.map(p => (
            <Button 
              key={p.name} 
              variant="outline" 
              className="w-full justify-start h-auto p-3" 
              onClick={() => onApply(p)}
            >
              <div className="flex flex-col items-start text-left">
                <div className="font-semibold text-sm">{p.name}</div>
                <div className="text-xs text-muted-foreground">
                  {p.costsBps}bps costs • {p.slippageBps}bps slip • {p.venue}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}



