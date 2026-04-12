"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Search, Edit, Trash2, Eye, Globe, FileText, Settings, Calendar, User } from "lucide-react"

interface Page {
  id: string
  title: string
  slug: string
  status: "published" | "draft" | "archived"
  type: "landing" | "content" | "legal" | "help"
  author: string
  lastModified: string
  views: number
  isHomepage: boolean
}

export default function AdminPagesClient() {
  const [isLoading, setIsLoading] = useState(true)
  const [pages, setPages] = useState<Page[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const router = useRouter()

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken")
    if (!adminToken) {
      router.push("/admin/login")
      return
    }

    // Mock data - replace with actual API call
    const mockPages: Page[] = [
      {
        id: "1",
        title: "Home Page",
        slug: "/",
        status: "published",
        type: "landing",
        author: "Admin",
        lastModified: "2024-01-15",
        views: 15420,
        isHomepage: true,
      },
      {
        id: "2",
        title: "About Us",
        slug: "/about",
        status: "published",
        type: "content",
        author: "Admin",
        lastModified: "2024-01-14",
        views: 3240,
        isHomepage: false,
      },
      {
        id: "3",
        title: "Trading Bots",
        slug: "/bots",
        status: "published",
        type: "content",
        author: "Admin",
        lastModified: "2024-01-13",
        views: 8750,
        isHomepage: false,
      },
      {
        id: "4",
        title: "Pricing",
        slug: "/pricing",
        status: "published",
        type: "landing",
        author: "Admin",
        lastModified: "2024-01-12",
        views: 12300,
        isHomepage: false,
      },
      {
        id: "5",
        title: "Privacy Policy",
        slug: "/privacy",
        status: "published",
        type: "legal",
        author: "Legal Team",
        lastModified: "2024-01-10",
        views: 890,
        isHomepage: false,
      },
      {
        id: "6",
        title: "Terms of Service",
        slug: "/terms",
        status: "published",
        type: "legal",
        author: "Legal Team",
        lastModified: "2024-01-10",
        views: 1240,
        isHomepage: false,
      },
      {
        id: "7",
        title: "Help Center",
        slug: "/help",
        status: "draft",
        type: "help",
        author: "Support Team",
        lastModified: "2024-01-08",
        views: 0,
        isHomepage: false,
      },
    ]

    setPages(mockPages)
    setIsLoading(false)
  }, [router])

  const filteredPages = pages.filter((page) => {
    const matchesSearch =
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || page.status === statusFilter
    const matchesType = typeFilter === "all" || page.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const handleCreatePage = () => {
    // Handle page creation
    setIsCreateDialogOpen(false)
  }

  const handleEditPage = (page: Page) => {
    setSelectedPage(page)
    // Navigate to edit page or open edit dialog
  }

  const handleDeletePage = (pageId: string) => {
    setPages(pages.filter((p) => p.id !== pageId))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Published</Badge>
      case "draft":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Draft</Badge>
      case "archived":
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Archived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "landing":
        return <Globe className="w-4 h-4" />
      case "content":
        return <FileText className="w-4 h-4" />
      case "legal":
        return <Settings className="w-4 h-4" />
      case "help":
        return <Settings className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
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
            <div>
              <h1 className="text-2xl font-bold text-white">Pages Management</h1>
              <p className="text-gray-400">Manage all website pages and content</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Page
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/90 backdrop-blur-xl border-purple-500/20">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Page</DialogTitle>
                  <DialogDescription className="text-gray-400">Create a new page for your website</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-white">
                      Page Title
                    </Label>
                    <Input id="title" placeholder="Enter page title" className="bg-black/40 border-purple-500/20" />
                  </div>
                  <div>
                    <Label htmlFor="slug" className="text-white">
                      URL Slug
                    </Label>
                    <Input id="slug" placeholder="/page-url" className="bg-black/40 border-purple-500/20" />
                  </div>
                  <div>
                    <Label htmlFor="type" className="text-white">
                      Page Type
                    </Label>
                    <Select>
                      <SelectTrigger className="bg-black/40 border-purple-500/20">
                        <SelectValue placeholder="Select page type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="landing">Landing Page</SelectItem>
                        <SelectItem value="content">Content Page</SelectItem>
                        <SelectItem value="legal">Legal Page</SelectItem>
                        <SelectItem value="help">Help Page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-white">
                      Meta Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Enter meta description for SEO"
                      className="bg-black/40 border-purple-500/20"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="published" />
                    <Label htmlFor="published" className="text-white">
                      Publish immediately
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePage}>Create Page</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Filters */}
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search pages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-black/40 border-purple-500/20"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-black/40 border-purple-500/20">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] bg-black/40 border-purple-500/20">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="landing">Landing Pages</SelectItem>
                  <SelectItem value="content">Content Pages</SelectItem>
                  <SelectItem value="legal">Legal Pages</SelectItem>
                  <SelectItem value="help">Help Pages</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Pages Table */}
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">All Pages ({filteredPages.length})</CardTitle>
            <CardDescription className="text-gray-400">Manage your website pages and their content</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-purple-500/20">
                  <TableHead className="text-gray-400">Page</TableHead>
                  <TableHead className="text-gray-400">Type</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Author</TableHead>
                  <TableHead className="text-gray-400">Views</TableHead>
                  <TableHead className="text-gray-400">Last Modified</TableHead>
                  <TableHead className="text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.map((page) => (
                  <TableRow key={page.id} className="border-purple-500/20">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getTypeIcon(page.type)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{page.title}</span>
                            {page.isHomepage && (
                              <Badge variant="outline" className="text-xs">
                                Homepage
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-gray-400">{page.slug}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {page.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(page.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{page.author}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-300">{page.views.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{page.lastModified}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => window.open(page.slug, "_blank")}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEditPage(page)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeletePage(page.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
