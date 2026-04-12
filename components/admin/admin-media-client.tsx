"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Upload,
  Search,
  Grid,
  List,
  ImageIcon,
  FileText,
  Video,
  Music,
  Download,
  Trash2,
  Edit,
  Copy,
  FolderPlus,
  Folder,
  File,
  HardDrive,
  Cloud,
  Check,
  Archive,
  Database,
} from "lucide-react"
import { toast } from "sonner"

interface MediaFile {
  id: string
  name: string
  originalName: string
  type: "image" | "video" | "audio" | "document" | "archive"
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  folder: string
  uploadedBy: string
  uploadedAt: string
  lastModified: string
  description?: string
  tags: string[]
  alt?: string
  width?: number
  height?: number
  duration?: number
  downloads: number
  isPublic: boolean
}

interface MediaFolder {
  id: string
  name: string
  path: string
  parent?: string
  createdAt: string
  fileCount: number
  size: number
}

export default function AdminMediaClient() {
  const [isLoading, setIsLoading] = useState(true)
  const [files, setFiles] = useState<MediaFile[]>([])
  const [folders, setFolders] = useState<MediaFolder[]>([])
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null)
  const [currentFolder, setCurrentFolder] = useState("/")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const router = useRouter()

  // Form states
  const [newFolderName, setNewFolderName] = useState("")
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    alt: "",
    tags: "",
    isPublic: true,
  })

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken")
    if (!adminToken) {
      router.push("/admin/login")
      return
    }
    loadMediaFiles()
    loadFolders()
  }, [router, currentFolder])

  const loadMediaFiles = async () => {
    setIsLoading(true)
    try {
      // Mock data - replace with real API
      const mockFiles: MediaFile[] = [
        {
          id: "1",
          name: "hero-banner.jpg",
          originalName: "hero-banner.jpg",
          type: "image",
          mimeType: "image/jpeg",
          size: 2048576,
          url: "/placeholder.svg?height=400&width=800&text=Hero+Banner",
          thumbnailUrl: "/placeholder.svg?height=150&width=150&text=Hero",
          folder: "/",
          uploadedBy: "Admin",
          uploadedAt: "2024-01-20 10:30",
          lastModified: "2024-01-20 10:30",
          description: "Main hero banner for homepage",
          tags: ["banner", "hero", "homepage"],
          alt: "Hero banner showing trading platform",
          width: 1920,
          height: 1080,
          downloads: 45,
          isPublic: true,
        },
        {
          id: "2",
          name: "trading-bot-demo.mp4",
          originalName: "trading-bot-demo.mp4",
          type: "video",
          mimeType: "video/mp4",
          size: 15728640,
          url: "/placeholder.svg?height=300&width=400&text=Video+Demo",
          thumbnailUrl: "/placeholder.svg?height=150&width=150&text=Video",
          folder: "/videos",
          uploadedBy: "Content Team",
          uploadedAt: "2024-01-19 15:45",
          lastModified: "2024-01-19 15:45",
          description: "Demo video showing trading bot functionality",
          tags: ["demo", "trading", "bot", "video"],
          duration: 120,
          downloads: 23,
          isPublic: true,
        },
        {
          id: "3",
          name: "user-guide.pdf",
          originalName: "user-guide.pdf",
          type: "document",
          mimeType: "application/pdf",
          size: 1024000,
          url: "/placeholder.svg?height=300&width=200&text=PDF+Document",
          thumbnailUrl: "/placeholder.svg?height=150&width=150&text=PDF",
          folder: "/documents",
          uploadedBy: "Support Team",
          uploadedAt: "2024-01-18 09:15",
          lastModified: "2024-01-20 14:20",
          description: "Complete user guide for the platform",
          tags: ["guide", "documentation", "help"],
          downloads: 156,
          isPublic: false,
        },
        {
          id: "4",
          name: "notification-sound.mp3",
          originalName: "notification-sound.mp3",
          type: "audio",
          mimeType: "audio/mpeg",
          size: 512000,
          url: "/placeholder.svg?height=150&width=150&text=Audio",
          folder: "/audio",
          uploadedBy: "UI Team",
          uploadedAt: "2024-01-17 11:30",
          lastModified: "2024-01-17 11:30",
          description: "Notification sound for alerts",
          tags: ["notification", "sound", "alert"],
          duration: 3,
          downloads: 8,
          isPublic: true,
        },
        {
          id: "5",
          name: "logo-variations.zip",
          originalName: "logo-variations.zip",
          type: "archive",
          mimeType: "application/zip",
          size: 3072000,
          url: "/placeholder.svg?height=150&width=150&text=Archive",
          folder: "/assets",
          uploadedBy: "Design Team",
          uploadedAt: "2024-01-16 16:20",
          lastModified: "2024-01-16 16:20",
          description: "Logo variations in different formats",
          tags: ["logo", "branding", "assets"],
          downloads: 12,
          isPublic: false,
        },
      ]
      setFiles(mockFiles.filter((file) => file.folder === currentFolder))
    } catch (error) {
      toast.error("Failed to load media files")
    } finally {
      setIsLoading(false)
    }
  }

  const loadFolders = async () => {
    try {
      // Mock data - replace with real API
      const mockFolders: MediaFolder[] = [
        {
          id: "1",
          name: "images",
          path: "/images",
          createdAt: "2024-01-15",
          fileCount: 25,
          size: 52428800,
        },
        {
          id: "2",
          name: "videos",
          path: "/videos",
          createdAt: "2024-01-15",
          fileCount: 8,
          size: 125829120,
        },
        {
          id: "3",
          name: "documents",
          path: "/documents",
          createdAt: "2024-01-15",
          fileCount: 15,
          size: 15360000,
        },
        {
          id: "4",
          name: "audio",
          path: "/audio",
          createdAt: "2024-01-15",
          fileCount: 5,
          size: 2560000,
        },
        {
          id: "5",
          name: "assets",
          path: "/assets",
          createdAt: "2024-01-15",
          fileCount: 12,
          size: 8192000,
        },
      ]
      setFolders(
        mockFolders.filter((folder) =>
          currentFolder === "/" ? !folder.path.includes("/", 1) : folder.path.startsWith(currentFolder),
        ),
      )
    } catch (error) {
      toast.error("Failed to load folders")
    }
  }

  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = typeFilter === "all" || file.type === typeFilter
    return matchesSearch && matchesType
  })

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name)
      case "size":
        return b.size - a.size
      case "type":
        return a.type.localeCompare(b.type)
      case "date":
      default:
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    }
  })

  const handleFileUpload = useCallback(
    async (files: FileList) => {
      setIsUploading(true)
      setUploadProgress(0)

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]

          // Simulate upload progress
          for (let progress = 0; progress <= 100; progress += 10) {
            setUploadProgress(progress)
            await new Promise((resolve) => setTimeout(resolve, 100))
          }

          // Create new media file entry
          const newFile: MediaFile = {
            id: Date.now().toString() + i,
            name: file.name,
            originalName: file.name,
            type: getFileType(file.type),
            mimeType: file.type,
            size: file.size,
            url: URL.createObjectURL(file),
            folder: currentFolder,
            uploadedBy: "Admin",
            uploadedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
            lastModified: new Date().toISOString().replace("T", " ").substring(0, 16),
            tags: [],
            downloads: 0,
            isPublic: true,
          }

          setFiles((prev) => [...prev, newFile])
        }

        toast.success(`${files.length} file(s) uploaded successfully`)
        setIsUploadDialogOpen(false)
      } catch (error) {
        toast.error("Failed to upload files")
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    },
    [currentFolder],
  )

  const getFileType = (mimeType: string): MediaFile["type"] => {
    if (mimeType.startsWith("image/")) return "image"
    if (mimeType.startsWith("video/")) return "video"
    if (mimeType.startsWith("audio/")) return "audio"
    if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("tar")) return "archive"
    return "document"
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileUpload(e.dataTransfer.files)
      }
    },
    [handleFileUpload],
  )

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    try {
      const newFolder: MediaFolder = {
        id: Date.now().toString(),
        name: newFolderName,
        path: currentFolder === "/" ? `/${newFolderName}` : `${currentFolder}/${newFolderName}`,
        parent: currentFolder === "/" ? undefined : currentFolder,
        createdAt: new Date().toISOString().split("T")[0],
        fileCount: 0,
        size: 0,
      }

      setFolders((prev) => [...prev, newFolder])
      setNewFolderName("")
      setIsCreateFolderDialogOpen(false)
      toast.success("Folder created successfully")
    } catch (error) {
      toast.error("Failed to create folder")
    }
  }

  const handleDeleteFiles = async (fileIds: string[]) => {
    try {
      setFiles((prev) => prev.filter((file) => !fileIds.includes(file.id)))
      setSelectedFiles([])
      toast.success(`${fileIds.length} file(s) deleted successfully`)
    } catch (error) {
      toast.error("Failed to delete files")
    }
  }

  const handleEditFile = async () => {
    if (!selectedFile) return

    try {
      setFiles((prev) =>
        prev.map((file) =>
          file.id === selectedFile.id
            ? {
                ...file,
                name: editForm.name,
                description: editForm.description,
                alt: editForm.alt,
                tags: editForm.tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean),
                isPublic: editForm.isPublic,
                lastModified: new Date().toISOString().replace("T", " ").substring(0, 16),
              }
            : file,
        ),
      )
      setIsEditDialogOpen(false)
      setSelectedFile(null)
      toast.success("File updated successfully")
    } catch (error) {
      toast.error("Failed to update file")
    }
  }

  const openEditDialog = (file: MediaFile) => {
    setSelectedFile(file)
    setEditForm({
      name: file.name,
      description: file.description || "",
      alt: file.alt || "",
      tags: file.tags.join(", "),
      isPublic: file.isPublic,
    })
    setIsEditDialogOpen(true)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: MediaFile["type"]) => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-5 h-5" />
      case "video":
        return <Video className="w-5 h-5" />
      case "audio":
        return <Music className="w-5 h-5" />
      case "archive":
        return <Archive className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const copyFileUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success("File URL copied to clipboard")
  }

  const downloadFile = (file: MediaFile) => {
    const link = document.createElement("a")
    link.href = file.url
    link.download = file.originalName
    link.click()

    // Update download count
    setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, downloads: f.downloads + 1 } : f)))
    toast.success("File download started")
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-purple-500/20 bg-black/20 backdrop-blur-xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push("/admin/dashboard")}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Media Library</h1>
                <p className="text-gray-400">Manage files, images, and media assets</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={isCreateFolderDialogOpen} onOpenChange={setIsCreateFolderDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 bg-transparent"
                  >
                    <FolderPlus className="w-4 h-4 mr-2" />
                    New Folder
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black/90 backdrop-blur-xl border-purple-500/20">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create New Folder</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Create a new folder to organize your media files
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="folderName" className="text-white">
                        Folder Name
                      </Label>
                      <Input
                        id="folderName"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Enter folder name"
                        className="bg-white/10 border-purple-500/30 text-white"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateFolderDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateFolder}>Create Folder</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Files
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black/90 backdrop-blur-xl border-purple-500/20 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">Upload Files</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Upload images, videos, documents, and other media files
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-purple-500/30 hover:border-purple-500/50"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                      <p className="text-white mb-2">Drag and drop files here, or click to select</p>
                      <p className="text-gray-400 text-sm">Supports images, videos, documents, and archives</p>
                      <Input
                        type="file"
                        multiple
                        className="hidden"
                        id="file-upload"
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                      />
                      <Label
                        htmlFor="file-upload"
                        className="inline-block mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg cursor-pointer hover:bg-purple-600 transition-colors"
                      >
                        Select Files
                      </Label>
                    </div>

                    {isUploading && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Uploading...</span>
                          <span className="text-white">{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                      Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Files</p>
                  <p className="text-2xl font-bold text-white">{files.length}</p>
                  <p className="text-green-400 text-sm">+12 this week</p>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Database className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Storage Used</p>
                  <p className="text-2xl font-bold text-white">
                    {formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}
                  </p>
                  <p className="text-green-400 text-sm">68% of 1GB</p>
                </div>
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <HardDrive className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Downloads</p>
                  <p className="text-2xl font-bold text-white">
                    {files.reduce((sum, file) => sum + file.downloads, 0)}
                  </p>
                  <p className="text-green-400 text-sm">+45 this month</p>
                </div>
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Download className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Public Files</p>
                  <p className="text-2xl font-bold text-white">{files.filter((f) => f.isPublic).length}</p>
                  <p className="text-green-400 text-sm">85% public</p>
                </div>
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Cloud className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Breadcrumb and Controls */}
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentFolder("/")}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <Folder className="w-4 h-4" />
                </Button>
                <span className="text-gray-400">/</span>
                {currentFolder !== "/" && <span className="text-white">{currentFolder.split("/").pop()}</span>}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="p-2"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="p-2"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px] bg-white/10 border-purple-500/30 text-white">
                  <SelectValue placeholder="File Type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-purple-500/30">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="archive">Archives</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px] bg-white/10 border-purple-500/30 text-white">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-purple-500/30">
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedFiles.length > 0 && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-purple-500/10 rounded-lg">
                <span className="text-white text-sm">{selectedFiles.length} file(s) selected</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedFiles([])}
                  className="border-purple-500/30"
                >
                  Clear
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-black/90 backdrop-blur-xl border-purple-500/20">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Delete Files</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-400">
                        Are you sure you want to delete {selectedFiles.length} file(s)? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteFiles(selectedFiles)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Folders */}
        {folders.length > 0 && (
          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Folders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className="flex flex-col items-center p-4 rounded-lg border border-purple-500/20 hover:border-purple-500/40 cursor-pointer transition-colors group"
                    onClick={() => setCurrentFolder(folder.path)}
                  >
                    <Folder className="w-12 h-12 text-purple-400 mb-2 group-hover:text-purple-300" />
                    <span className="text-white text-sm font-medium text-center">{folder.name}</span>
                    <span className="text-gray-400 text-xs">{folder.fileCount} files</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Files */}
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Files ({sortedFiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {sortedFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`relative group rounded-lg border transition-colors cursor-pointer ${
                      selectedFiles.includes(file.id)
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-purple-500/20 hover:border-purple-500/40"
                    }`}
                    onClick={() => {
                      if (selectedFiles.includes(file.id)) {
                        setSelectedFiles((prev) => prev.filter((id) => id !== file.id))
                      } else {
                        setSelectedFiles((prev) => [...prev, file.id])
                      }
                    }}
                  >
                    <div className="aspect-square p-4 flex flex-col items-center justify-center">
                      {file.type === "image" ? (
                        <img
                          src={file.thumbnailUrl || file.url}
                          alt={file.alt || file.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 flex items-center justify-center bg-purple-500/20 rounded-lg">
                          {getFileIcon(file.type)}
                        </div>
                      )}
                    </div>

                    <div className="p-3 border-t border-purple-500/20">
                      <p className="text-white text-sm font-medium truncate">{file.name}</p>
                      <p className="text-gray-400 text-xs">{formatFileSize(file.size)}</p>
                      {file.isPublic && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Public
                        </Badge>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-8 h-8 p-0 bg-black/50 hover:bg-black/70"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditDialog(file)
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-8 h-8 p-0 bg-black/50 hover:bg-black/70"
                          onClick={(e) => {
                            e.stopPropagation()
                            downloadFile(file)
                          }}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Selection indicator */}
                    {selectedFiles.includes(file.id) && (
                      <div className="absolute top-2 left-2">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {sortedFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`flex items-center gap-4 p-3 rounded-lg border transition-colors cursor-pointer ${
                      selectedFiles.includes(file.id)
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-purple-500/20 hover:border-purple-500/40"
                    }`}
                    onClick={() => {
                      if (selectedFiles.includes(file.id)) {
                        setSelectedFiles((prev) => prev.filter((id) => id !== file.id))
                      } else {
                        setSelectedFiles((prev) => [...prev, file.id])
                      }
                    }}
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-purple-500/20 rounded">
                      {getFileIcon(file.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{file.name}</p>
                      <p className="text-gray-400 text-sm">
                        {formatFileSize(file.size)} • {file.uploadedAt} • {file.downloads} downloads
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {file.isPublic && (
                        <Badge variant="outline" className="text-xs">
                          Public
                        </Badge>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyFileUrl(file.url)
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditDialog(file)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          downloadFile(file)
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>

                    {selectedFiles.includes(file.id) && (
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {sortedFiles.length === 0 && (
              <div className="text-center py-12">
                <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No files found</p>
                <p className="text-gray-500 text-sm">Upload some files to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit File Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-black/90 backdrop-blur-xl border-purple-500/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Edit File</DialogTitle>
            <DialogDescription className="text-gray-400">Update file information and settings</DialogDescription>
          </DialogHeader>
          {selectedFile && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                <div className="w-16 h-16 flex items-center justify-center bg-purple-500/20 rounded">
                  {selectedFile.type === "image" ? (
                    <img
                      src={selectedFile.thumbnailUrl || selectedFile.url}
                      alt={selectedFile.alt || selectedFile.name}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    getFileIcon(selectedFile.type)
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">{selectedFile.originalName}</p>
                  <p className="text-gray-400 text-sm">
                    {formatFileSize(selectedFile.size)} • {selectedFile.mimeType}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fileName" className="text-white">
                    File Name
                  </Label>
                  <Input
                    id="fileName"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="bg-white/10 border-purple-500/30 text-white"
                  />
                </div>

                {selectedFile.type === "image" && (
                  <div className="space-y-2">
                    <Label htmlFor="altText" className="text-white">
                      Alt Text
                    </Label>
                    <Input
                      id="altText"
                      value={editForm.alt}
                      onChange={(e) => setEditForm({ ...editForm, alt: e.target.value })}
                      placeholder="Describe the image"
                      className="bg-white/10 border-purple-500/30 text-white"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="File description"
                  className="bg-white/10 border-purple-500/30 text-white"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="text-white">
                  Tags (comma separated)
                </Label>
                <Input
                  id="tags"
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                  className="bg-white/10 border-purple-500/30 text-white"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isPublic" className="text-white">
                    Public Access
                  </Label>
                  <p className="text-sm text-gray-400">Allow public access to this file</p>
                </div>
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={editForm.isPublic}
                  onChange={(e) => setEditForm({ ...editForm, isPublic: e.target.checked })}
                  className="w-4 h-4"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditFile}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
