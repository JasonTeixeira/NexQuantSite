"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import {
  ImageIcon,
  Video,
  Crop,
  Palette,
  Type,
  Layers,
  Upload,
  Save,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Square,
  Circle,
  Triangle,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Play,
  Pause,
  Volume2,
  VolumeX,
  FilterIcon,
  Contrast,
  Sun,
  Moon,
  CloudyIcon as Blur,
  Focus,
  Droplets,
} from "lucide-react"
import { toast } from "sonner"

interface MediaFile {
  id: string
  name: string
  type: "image" | "video"
  url: string
  width: number
  height: number
  duration?: number
  size: number
  format: string
  lastModified: string
}

interface EditHistory {
  id: string
  action: string
  timestamp: string
  preview: string
}

interface Layer {
  id: string
  type: "image" | "text" | "shape" | "filterLayer"
  name: string
  visible: boolean
  opacity: number
  x: number
  y: number
  width: number
  height: number
  rotation: number
  content?: any
  style?: any
}

interface ImageFilter {
  id: string
  name: string
  icon: any
  params: Record<string, number>
}

const imageFilters: ImageFilter[] = [
  { id: "brightness", name: "Brightness", icon: Sun, params: { value: 0 } },
  { id: "contrast", name: "Contrast", icon: Contrast, params: { value: 0 } },
  { id: "saturation", name: "Saturation", icon: Palette, params: { value: 0 } },
  { id: "blur", name: "Blur", icon: Blur, params: { radius: 0 } },
  { id: "sharpen", name: "Sharpen", icon: Focus, params: { amount: 0 } },
  { id: "vintage", name: "Vintage", icon: Moon, params: { intensity: 0 } },
  { id: "sepia", name: "Sepia", icon: Droplets, params: { amount: 0 } },
  { id: "vignette", name: "Vignette", icon: Circle, params: { strength: 0 } },
]

const cropPresets = [
  { name: "Original", ratio: null },
  { name: "Square", ratio: 1 },
  { name: "16:9", ratio: 16 / 9 },
  { name: "4:3", ratio: 4 / 3 },
  { name: "3:2", ratio: 3 / 2 },
  { name: "Instagram Post", ratio: 1 },
  { name: "Instagram Story", ratio: 9 / 16 },
  { name: "Facebook Cover", ratio: 820 / 312 },
]

export default function MediaEditorClient() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null)
  const [editHistory, setEditHistory] = useState<EditHistory[]>([])
  const [layers, setLayers] = useState<Layer[]>([])
  const [selectedLayer, setSelectedLayer] = useState<Layer | null>(null)
  const [activeTab, setActiveTab] = useState("crop")
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(100)
  const [zoom, setZoom] = useState(100)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Edit states
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 })
  const [selectedCropRatio, setSelectedCropRatio] = useState<number | null>(null)
  const [rotation, setRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [filters, setFilters] = useState<Record<string, number>>({})
  const [textInput, setTextInput] = useState("")
  const [textStyle, setTextStyle] = useState({
    fontSize: 24,
    fontFamily: "Arial",
    color: "#ffffff",
    bold: false,
    italic: false,
    underline: false,
  })

  useEffect(() => {
    loadMediaFiles()
  }, [])

  const loadMediaFiles = () => {
    // Mock data - replace with real API
    const mockFiles: MediaFile[] = [
      {
        id: "1",
        name: "hero-banner.jpg",
        type: "image",
        url: "/placeholder.svg?height=600&width=800&text=Hero+Banner",
        width: 1920,
        height: 1080,
        size: 2048576,
        format: "JPEG",
        lastModified: "2024-01-20",
      },
      {
        id: "2",
        name: "product-demo.mp4",
        type: "video",
        url: "/placeholder.svg?height=400&width=600&text=Video+Demo",
        width: 1280,
        height: 720,
        duration: 120,
        size: 15728640,
        format: "MP4",
        lastModified: "2024-01-19",
      },
      {
        id: "3",
        name: "logo-design.png",
        type: "image",
        url: "/placeholder.svg?height=300&width=300&text=Logo",
        width: 512,
        height: 512,
        size: 1024000,
        format: "PNG",
        lastModified: "2024-01-18",
      },
    ]

    setMediaFiles(mockFiles)
  }

  const selectFile = (file: MediaFile) => {
    setSelectedFile(file)
    setCanvasSize({ width: Math.min(file.width, 800), height: Math.min(file.height, 600) })
    setEditHistory([])
    setLayers([])
    setFilters({})
    setRotation(0)
    setFlipH(false)
    setFlipV(false)
    setCropArea({ x: 0, y: 0, width: file.width, height: file.height })
  }

  const addToHistory = (action: string) => {
    const historyItem: EditHistory = {
      id: Date.now().toString(),
      action,
      timestamp: new Date().toLocaleTimeString(),
      preview: selectedFile?.url || "",
    }
    setEditHistory((prev) => [...prev, historyItem])
  }

  const applyCrop = () => {
    if (!selectedFile) return
    addToHistory("Crop applied")
    toast.success("Crop applied successfully")
  }

  const applyRotation = (degrees: number) => {
    setRotation((prev) => (prev + degrees) % 360)
    addToHistory(`Rotated ${degrees}°`)
    toast.success(`Rotated ${degrees}°`)
  }

  const applyFlip = (direction: "horizontal" | "vertical") => {
    if (direction === "horizontal") {
      setFlipH((prev) => !prev)
      addToHistory("Flipped horizontally")
    } else {
      setFlipV((prev) => !prev)
      addToHistory("Flipped vertically")
    }
    toast.success(`Flipped ${direction}`)
  }

  const applyFilter = (filterId: string, value: number) => {
    setFilters((prev) => ({ ...prev, [filterId]: value }))
    addToHistory(`Applied ${filterId} filter`)
  }

  const addTextLayer = () => {
    if (!textInput.trim()) {
      toast.error("Please enter some text")
      return
    }

    const newLayer: Layer = {
      id: Date.now().toString(),
      type: "text",
      name: `Text: ${textInput.substring(0, 20)}...`,
      visible: true,
      opacity: 100,
      x: canvasSize.width / 2,
      y: canvasSize.height / 2,
      width: 200,
      height: 50,
      rotation: 0,
      content: textInput,
      style: { ...textStyle },
    }

    setLayers((prev) => [...prev, newLayer])
    setSelectedLayer(newLayer)
    setTextInput("")
    addToHistory("Added text layer")
    toast.success("Text layer added")
  }

  const addShapeLayer = (shapeType: "rectangle" | "circle" | "triangle") => {
    const newLayer: Layer = {
      id: Date.now().toString(),
      type: "shape",
      name: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)}`,
      visible: true,
      opacity: 100,
      x: canvasSize.width / 2,
      y: canvasSize.height / 2,
      width: 100,
      height: 100,
      rotation: 0,
      content: { type: shapeType, fill: "#00ff44", stroke: "#ffffff", strokeWidth: 2 },
    }

    setLayers((prev) => [...prev, newLayer])
    setSelectedLayer(newLayer)
    addToHistory(`Added ${shapeType} shape`)
    toast.success(`${shapeType} shape added`)
  }

  const updateLayer = (layerId: string, updates: Partial<Layer>) => {
    setLayers((prev) => prev.map((layer) => (layer.id === layerId ? { ...layer, ...updates } : layer)))
  }

  const deleteLayer = (layerId: string) => {
    setLayers((prev) => prev.filter((layer) => layer.id !== layerId))
    if (selectedLayer?.id === layerId) {
      setSelectedLayer(null)
    }
    addToHistory("Deleted layer")
    toast.success("Layer deleted")
  }

  const duplicateLayer = (layerId: string) => {
    const layer = layers.find((l) => l.id === layerId)
    if (!layer) return

    const newLayer: Layer = {
      ...layer,
      id: Date.now().toString(),
      name: `${layer.name} Copy`,
      x: layer.x + 20,
      y: layer.y + 20,
    }

    setLayers((prev) => [...prev, newLayer])
    addToHistory("Duplicated layer")
    toast.success("Layer duplicated")
  }

  const saveProject = () => {
    if (!selectedFile) return

    // Simulate save
    addToHistory("Project saved")
    toast.success("Project saved successfully")
  }

  const exportMedia = (format: string) => {
    if (!selectedFile) return

    // Simulate export
    addToHistory(`Exported as ${format}`)
    toast.success(`Media exported as ${format}`)
  }

  const resetEdits = () => {
    setFilters({})
    setRotation(0)
    setFlipH(false)
    setFlipV(false)
    setLayers([])
    setEditHistory([])
    setCropArea({ x: 0, y: 0, width: selectedFile?.width || 100, height: selectedFile?.height || 100 })
    toast.success("All edits reset")
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              MEDIA <span className="text-primary">EDITOR</span>
            </h1>
            <p className="text-gray-400">Advanced media editing capabilities</p>
          </div>
          <div className="flex items-center gap-4">
            {selectedFile && (
              <>
                <Button
                  onClick={resetEdits}
                  variant="outline"
                  className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 bg-transparent"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={saveProject}
                  variant="outline"
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 bg-transparent"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Select onValueChange={exportMedia}>
                  <SelectTrigger className="w-32 bg-primary/20 border-primary/30 text-primary">
                    <SelectValue placeholder="Export" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-primary/30">
                    <SelectItem value="jpg">JPG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                    {selectedFile?.type === "video" && (
                      <>
                        <SelectItem value="mp4">MP4</SelectItem>
                        <SelectItem value="webm">WebM</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* File Browser */}
          <div className="lg:col-span-1">
            <Card className="bg-black/40 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  Media Files
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mediaFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedFile?.id === file.id
                        ? "border-primary bg-primary/10"
                        : "border-primary/20 hover:border-primary/40"
                    }`}
                    onClick={() => selectFile(file)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                        {file.type === "image" ? (
                          <ImageIcon className="w-6 h-6 text-primary" />
                        ) : (
                          <Video className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{file.name}</p>
                        <p className="text-gray-400 text-sm">
                          {file.width}×{file.height} • {formatFileSize(file.size)}
                        </p>
                        {file.duration && <p className="text-gray-400 text-sm">{formatDuration(file.duration)}</p>}
                      </div>
                    </div>
                  </div>
                ))}

                {mediaFiles.length === 0 && (
                  <div className="text-center py-8">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">No media files</p>
                    <Button
                      size="sm"
                      className="mt-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Edit History */}
            {editHistory.length > 0 && (
              <Card className="bg-black/40 border-primary/30 mt-6">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Edit History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {editHistory.map((item) => (
                      <div key={item.id} className="text-sm">
                        <p className="text-white">{item.action}</p>
                        <p className="text-gray-400 text-xs">{item.timestamp}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Editor */}
          <div className="lg:col-span-2">
            {selectedFile ? (
              <Card className="bg-black/40 border-primary/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{selectedFile.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setZoom(Math.max(25, zoom - 25))}>
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-white text-sm">{zoom}%</span>
                      <Button size="sm" variant="ghost" onClick={() => setZoom(Math.min(200, zoom + 25))}>
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                    {selectedFile.type === "image" ? (
                      <div className="relative">
                        <img
                          src={selectedFile.url || "/placeholder.svg"}
                          alt={selectedFile.name}
                          className="w-full h-auto max-h-96 object-contain"
                          style={{
                            transform: `scale(${zoom / 100}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                            filter: Object.entries(filters)
                              .map(([key, value]) => {
                                switch (key) {
                                  case "brightness":
                                    return `brightness(${100 + value}%)`
                                  case "contrast":
                                    return `contrast(${100 + value}%)`
                                  case "saturation":
                                    return `saturate(${100 + value}%)`
                                  case "blur":
                                    return `blur(${value}px)`
                                  case "sepia":
                                    return `sepia(${value}%)`
                                  default:
                                    return ""
                                }
                              })
                              .join(" "),
                          }}
                        />
                        <canvas
                          ref={canvasRef}
                          className="absolute inset-0 pointer-events-none"
                          width={canvasSize.width}
                          height={canvasSize.height}
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <video
                          ref={videoRef}
                          src={selectedFile.url}
                          className="w-full h-auto max-h-96"
                          controls={false}
                          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                        />
                        <div className="absolute bottom-4 left-4 right-4 bg-black/50 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (videoRef.current) {
                                  if (isPlaying) {
                                    videoRef.current.pause()
                                  } else {
                                    videoRef.current.play()
                                  }
                                  setIsPlaying(!isPlaying)
                                }
                              }}
                            >
                              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <div className="flex-1">
                              <input
                                type="range"
                                min="0"
                                max={selectedFile.duration || 100}
                                value={currentTime}
                                onChange={(e) => {
                                  const time = Number.parseFloat(e.target.value)
                                  setCurrentTime(time)
                                  if (videoRef.current) {
                                    videoRef.current.currentTime = time
                                  }
                                }}
                                className="w-full"
                              />
                            </div>
                            <span className="text-white text-sm">
                              {formatDuration(currentTime)} / {formatDuration(selectedFile.duration || 0)}
                            </span>
                            <Button size="sm" variant="ghost" onClick={() => setVolume(volume === 0 ? 100 : 0)}>
                              {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-black/40 border-primary/30">
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Select a file to start editing</p>
                    <p className="text-gray-500 text-sm">Choose from the media files on the left</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tools Panel */}
          <div className="lg:col-span-1">
            {selectedFile && (
              <Card className="bg-black/40 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-white">Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-black/40">
                      <TabsTrigger value="crop">
                        <Crop className="h-4 w-4 mr-1" />
                        Crop
                      </TabsTrigger>
                      <TabsTrigger value="filters">
                        <FilterIcon className="h-4 w-4 mr-1" />
                        Filters
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="crop" className="space-y-4">
                      {/* Transform Tools */}
                      <div className="space-y-3">
                        <Label className="text-white">Transform</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => applyRotation(-90)}
                            className="border-primary/30"
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Rotate L
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => applyRotation(90)}
                            className="border-primary/30"
                          >
                            <RotateCw className="h-4 w-4 mr-1" />
                            Rotate R
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => applyFlip("horizontal")}
                            className="border-primary/30"
                          >
                            <FlipHorizontal className="h-4 w-4 mr-1" />
                            Flip H
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => applyFlip("vertical")}
                            className="border-primary/30"
                          >
                            <FlipVertical className="h-4 w-4 mr-1" />
                            Flip V
                          </Button>
                        </div>
                      </div>

                      {/* Crop Presets */}
                      <div className="space-y-3">
                        <Label className="text-white">Crop Ratio</Label>
                        <Select
                          value={selectedCropRatio?.toString() || "original"}
                          onValueChange={(value) => {
                            const ratio = value === "original" ? null : Number.parseFloat(value)
                            setSelectedCropRatio(ratio)
                          }}
                        >
                          <SelectTrigger className="bg-white/10 border-primary/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-primary/30">
                            {cropPresets.map((preset) => (
                              <SelectItem key={preset.name} value={preset.ratio?.toString() || "original"}>
                                {preset.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={applyCrop}
                          className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                        >
                          Apply Crop
                        </Button>
                      </div>

                      {/* Add Text */}
                      <div className="space-y-3">
                        <Label className="text-white">Add Text</Label>
                        <Input
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          placeholder="Enter text"
                          className="bg-white/10 border-primary/30 text-white"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            value={textStyle.fontSize}
                            onChange={(e) =>
                              setTextStyle({ ...textStyle, fontSize: Number.parseInt(e.target.value) || 24 })
                            }
                            placeholder="Size"
                            className="bg-white/10 border-primary/30 text-white"
                          />
                          <Input
                            type="color"
                            value={textStyle.color}
                            onChange={(e) => setTextStyle({ ...textStyle, color: e.target.value })}
                            className="bg-white/10 border-primary/30"
                          />
                        </div>
                        <Button
                          onClick={addTextLayer}
                          className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30"
                        >
                          <Type className="h-4 w-4 mr-2" />
                          Add Text
                        </Button>
                      </div>

                      {/* Add Shapes */}
                      <div className="space-y-3">
                        <Label className="text-white">Add Shapes</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addShapeLayer("rectangle")}
                            className="border-primary/30"
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addShapeLayer("circle")}
                            className="border-primary/30"
                          >
                            <Circle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addShapeLayer("triangle")}
                            className="border-primary/30"
                          >
                            <Triangle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="filters" className="space-y-4">
                      {imageFilters.map((filter) => {
                        const Icon = filter.icon
                        const paramKey = Object.keys(filter.params)[0]
                        const currentValue = filters[filter.id] || 0

                        return (
                          <div key={filter.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-white flex items-center gap-2">
                                <Icon className="h-4 w-4 text-primary" />
                                {filter.name}
                              </Label>
                              <span className="text-gray-400 text-sm">{currentValue}</span>
                            </div>
                            <Slider
                              value={[currentValue]}
                              onValueChange={([value]) => applyFilter(filter.id, value)}
                              min={-100}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                          </div>
                        )
                      })}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Layers Panel */}
            {layers.length > 0 && (
              <Card className="bg-black/40 border-primary/30 mt-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    Layers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {layers.map((layer) => (
                      <div
                        key={layer.id}
                        className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                          selectedLayer?.id === layer.id
                            ? "border-primary bg-primary/10"
                            : "border-primary/20 hover:border-primary/40"
                        }`}
                        onClick={() => setSelectedLayer(layer)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateLayer(layer.id, { visible: !layer.visible })
                              }}
                              className="w-6 h-6 p-0"
                            >
                              {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                            </Button>
                            <span className="text-white text-sm">{layer.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                duplicateLayer(layer.id)
                              }}
                              className="w-6 h-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteLayer(layer.id)
                              }}
                              className="w-6 h-6 p-0 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Layer Properties */}
                        {selectedLayer?.id === layer.id && (
                          <div className="mt-2 pt-2 border-t border-primary/20 space-y-2">
                            <div className="space-y-1">
                              <Label className="text-white text-xs">Opacity</Label>
                              <Slider
                                value={[layer.opacity]}
                                onValueChange={([value]) => updateLayer(layer.id, { opacity: value })}
                                min={0}
                                max={100}
                                step={1}
                                className="w-full"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
