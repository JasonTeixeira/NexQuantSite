"use client"

import React, { useState, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Upload, Image, BarChart3, LineChart, PieChart, 
  TrendingUp, TrendingDown, Target, Zap, Share2,
  Download, Eye, Heart, MessageSquare, Tag,
  Calendar, DollarSign, Percent, Clock
} from "lucide-react"
import { toast } from "sonner"

interface ChartSharingWidgetProps {
  onChartUpload: (chartData: any) => void
  className?: string
}

interface ChartData {
  id: string
  file: File
  preview: string
  metadata: {
    title: string
    description: string
    symbol: string
    timeframe: string
    analysis: string
    tags: string[]
    prediction: {
      direction: 'bullish' | 'bearish' | 'neutral'
      target: string
      timeframe: string
      confidence: number
    }
  }
}

export default function ChartSharingWidget({ onChartUpload, className }: ChartSharingWidgetProps) {
  const [uploadedCharts, setUploadedCharts] = useState<ChartData[]>([])
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [selectedChart, setSelectedChart] = useState<ChartData | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [analysisForm, setAnalysisForm] = useState({
    title: '',
    description: '',
    symbol: '',
    timeframe: '4H',
    analysis: '',
    tags: '',
    prediction: {
      direction: 'bullish' as const,
      target: '',
      timeframe: '1-2 weeks',
      confidence: 75
    }
  })

  const handleFileUpload = useCallback((files: FileList) => {
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/') && file.size < 10 * 1024 * 1024) { // 10MB limit
        const reader = new FileReader()
        reader.onload = (e) => {
          const chartData: ChartData = {
            id: Date.now().toString(),
            file,
            preview: e.target?.result as string,
            metadata: {
              title: '',
              description: '',
              symbol: '',
              timeframe: '',
              analysis: '',
              tags: [],
              prediction: {
                direction: 'neutral',
                target: '',
                timeframe: '',
                confidence: 50
              }
            }
          }
          setUploadedCharts(prev => [...prev, chartData])
          setSelectedChart(chartData)
          setShowAnalysisModal(true)
        }
        reader.readAsDataURL(file)
      } else {
        toast.error('Please upload an image file under 10MB')
      }
    })
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files)
    }
  }, [handleFileUpload])

  const handleAnalysisSubmit = () => {
    if (!selectedChart) return

    const updatedChart = {
      ...selectedChart,
      metadata: {
        title: analysisForm.title,
        description: analysisForm.description,
        symbol: analysisForm.symbol.toUpperCase(),
        timeframe: analysisForm.timeframe,
        analysis: analysisForm.analysis,
        tags: analysisForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        prediction: analysisForm.prediction
      }
    }

    setUploadedCharts(prev => 
      prev.map(chart => chart.id === selectedChart.id ? updatedChart : chart)
    )

    onChartUpload(updatedChart)
    setShowAnalysisModal(false)
    setAnalysisForm({
      title: '',
      description: '',
      symbol: '',
      timeframe: '4H',
      analysis: '',
      tags: '',
      prediction: {
        direction: 'bullish',
        target: '',
        timeframe: '1-2 weeks',
        confidence: 75
      }
    })
    
    toast.success('Chart analysis saved!')
  }

  const ChartPreview = ({ chart }: { chart: ChartData }) => {
    const { metadata } = chart
    const hasAnalysis = metadata.title && metadata.symbol

    return (
      <Card className="bg-gray-900/50 border-gray-700 hover:bg-gray-800/50 transition-all duration-200">
        <div className="relative">
          <img 
            src={chart.preview} 
            alt="Chart preview"
            className="w-full h-48 object-cover rounded-t-lg"
          />
          
          {/* Chart overlay with analysis */}
          {hasAnalysis && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center gap-2 mb-2">
                  {metadata.symbol && (
                    <Badge variant="outline" className="border-blue-500 text-blue-400">
                      {metadata.symbol}
                    </Badge>
                  )}
                  {metadata.timeframe && (
                    <Badge variant="outline" className="border-gray-500 text-gray-300 text-xs">
                      {metadata.timeframe}
                    </Badge>
                  )}
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      metadata.prediction.direction === 'bullish' 
                        ? 'border-green-500 text-green-400' 
                        : metadata.prediction.direction === 'bearish'
                        ? 'border-red-500 text-red-400'
                        : 'border-gray-500 text-gray-400'
                    }`}
                  >
                    {metadata.prediction.direction === 'bullish' ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : metadata.prediction.direction === 'bearish' ? (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    ) : null}
                    {metadata.prediction.direction.toUpperCase()}
                  </Badge>
                </div>
                
                <h3 className="text-white font-semibold text-sm mb-1">
                  {metadata.title}
                </h3>
                
                {metadata.prediction.target && (
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <Target className="w-3 h-3" />
                    <span>Target: {metadata.prediction.target}</span>
                    <span>•</span>
                    <span>{metadata.prediction.confidence}% confidence</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {hasAnalysis ? (
            <div className="space-y-3">
              <p className="text-gray-300 text-sm line-clamp-2">
                {metadata.description}
              </p>
              
              {metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {metadata.tags.slice(0, 3).map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-gray-600 text-gray-400">
                      #{tag}
                    </Badge>
                  ))}
                  {metadata.tags.length > 3 && (
                    <span className="text-xs text-gray-500">+{metadata.tags.length - 3} more</span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    847
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    124
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    32
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="h-6 px-2">
                    <Share2 className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 px-2">
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="text-gray-400 text-sm mb-3">Add analysis to share this chart</p>
              <Button 
                size="sm"
                onClick={() => {
                  setSelectedChart(chart)
                  setShowAnalysisModal(true)
                }}
              >
                Add Analysis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragging 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-gray-600 hover:border-blue-500/50 hover:bg-blue-500/5'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-blue-500/10 rounded-full">
              <Upload className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Share Your Chart Analysis</h3>
            <p className="text-gray-400 mb-4">
              Upload trading charts with your technical analysis and predictions
            </p>
            
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Image className="w-4 h-4" />
                PNG, JPG
              </span>
              <span>•</span>
              <span>Up to 10MB</span>
              <span>•</span>
              <span>Drag & drop or click</span>
            </div>
          </div>

          <Button className="bg-blue-600 hover:bg-blue-700">
            <Upload className="w-4 h-4 mr-2" />
            Choose Files
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Chart Gallery */}
      {uploadedCharts.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Your Chart Analysis ({uploadedCharts.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uploadedCharts.map((chart) => (
              <ChartPreview key={chart.id} chart={chart} />
            ))}
          </div>
        </div>
      )}

      {/* Analysis Modal */}
      <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              Chart Analysis
            </DialogTitle>
            <DialogDescription>
              Add your technical analysis and market predictions
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart Preview */}
            {selectedChart && (
              <div>
                <h4 className="font-semibold text-white mb-3">Chart Preview</h4>
                <img 
                  src={selectedChart.preview} 
                  alt="Chart preview"
                  className="w-full rounded-lg border border-gray-700"
                />
              </div>
            )}

            {/* Analysis Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Chart Title *
                </label>
                <Input
                  placeholder="e.g., TSLA Breaking Out of Triangle Pattern"
                  value={analysisForm.title}
                  onChange={(e) => setAnalysisForm(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-gray-800 border-gray-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Symbol *
                  </label>
                  <Input
                    placeholder="TSLA"
                    value={analysisForm.symbol}
                    onChange={(e) => setAnalysisForm(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Timeframe
                  </label>
                  <select
                    value={analysisForm.timeframe}
                    onChange={(e) => setAnalysisForm(prev => ({ ...prev, timeframe: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white"
                  >
                    <option value="1m">1 Minute</option>
                    <option value="5m">5 Minutes</option>
                    <option value="15m">15 Minutes</option>
                    <option value="1H">1 Hour</option>
                    <option value="4H">4 Hours</option>
                    <option value="1D">Daily</option>
                    <option value="1W">Weekly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Market Analysis *
                </label>
                <Textarea
                  placeholder="Describe your technical analysis, patterns, indicators, and reasoning..."
                  value={analysisForm.analysis}
                  onChange={(e) => setAnalysisForm(prev => ({ ...prev, analysis: e.target.value }))}
                  className="bg-gray-800 border-gray-600 min-h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <Textarea
                  placeholder="Brief summary of your chart analysis..."
                  value={analysisForm.description}
                  onChange={(e) => setAnalysisForm(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-gray-800 border-gray-600"
                />
              </div>

              {/* Prediction Section */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-orange-400" />
                  Market Prediction
                </h4>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Direction
                      </label>
                      <select
                        value={analysisForm.prediction.direction}
                        onChange={(e) => setAnalysisForm(prev => ({ 
                          ...prev, 
                          prediction: { ...prev.prediction, direction: e.target.value as any }
                        }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                      >
                        <option value="bullish">Bullish 🐂</option>
                        <option value="bearish">Bearish 🐻</option>
                        <option value="neutral">Neutral ➡️</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Target Price
                      </label>
                      <Input
                        placeholder="$280.00"
                        value={analysisForm.prediction.target}
                        onChange={(e) => setAnalysisForm(prev => ({ 
                          ...prev, 
                          prediction: { ...prev.prediction, target: e.target.value }
                        }))}
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Time Horizon
                      </label>
                      <Input
                        placeholder="1-2 weeks"
                        value={analysisForm.prediction.timeframe}
                        onChange={(e) => setAnalysisForm(prev => ({ 
                          ...prev, 
                          prediction: { ...prev.prediction, timeframe: e.target.value }
                        }))}
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Confidence ({analysisForm.prediction.confidence}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={analysisForm.prediction.confidence}
                        onChange={(e) => setAnalysisForm(prev => ({ 
                          ...prev, 
                          prediction: { ...prev.prediction, confidence: parseInt(e.target.value) }
                        }))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Tags
                </label>
                <Input
                  placeholder="breakout, support, resistance, earnings"
                  value={analysisForm.tags}
                  onChange={(e) => setAnalysisForm(prev => ({ ...prev, tags: e.target.value }))}
                  className="bg-gray-800 border-gray-600"
                />
                <p className="text-xs text-gray-400 mt-1">Separate tags with commas</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowAnalysisModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAnalysisSubmit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!analysisForm.title || !analysisForm.symbol || !analysisForm.analysis}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Analysis
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
