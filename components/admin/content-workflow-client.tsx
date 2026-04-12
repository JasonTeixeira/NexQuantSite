"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  FileText,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  AlertTriangle,
  Users,
  Calendar,
  MessageSquare,
  History,
  GitBranch,
  Search,
  Filter,
  MoreHorizontal,
  Send,
  Archive,
  Trash2,
  Tag,
  Workflow,
  UserCheck,
} from "lucide-react"

// Mock workflow data
const contentItems = [
  {
    id: "CNT-001",
    title: "Q4 Trading Strategy Guide",
    type: "blog",
    status: "in_review",
    author: "John Smith",
    assignee: "Sarah Johnson",
    created: "2024-01-10T09:00:00Z",
    updated: "2024-01-15T14:30:00Z",
    deadline: "2024-01-20T17:00:00Z",
    priority: "high",
    stage: "review",
    progress: 75,
    comments: 3,
    version: "v2.1",
    tags: ["trading", "strategy", "guide"],
  },
  {
    id: "CNT-002",
    title: "Market Analysis Dashboard Update",
    type: "feature",
    status: "draft",
    author: "Mike Davis",
    assignee: "Alex Chen",
    created: "2024-01-12T11:15:00Z",
    updated: "2024-01-15T16:45:00Z",
    deadline: "2024-01-25T12:00:00Z",
    priority: "medium",
    stage: "writing",
    progress: 45,
    comments: 1,
    version: "v1.3",
    tags: ["dashboard", "analysis", "ui"],
  },
  {
    id: "CNT-003",
    title: "New User Onboarding Flow",
    type: "documentation",
    status: "approved",
    author: "Lisa Wang",
    assignee: "Tom Wilson",
    created: "2024-01-08T08:30:00Z",
    updated: "2024-01-14T10:20:00Z",
    deadline: "2024-01-18T15:00:00Z",
    priority: "high",
    stage: "ready_to_publish",
    progress: 100,
    comments: 5,
    version: "v3.0",
    tags: ["onboarding", "ux", "documentation"],
  },
  {
    id: "CNT-004",
    title: "API Integration Tutorial",
    type: "tutorial",
    status: "needs_revision",
    author: "David Brown",
    assignee: "Emma Taylor",
    created: "2024-01-05T13:45:00Z",
    updated: "2024-01-15T09:10:00Z",
    deadline: "2024-01-22T14:00:00Z",
    priority: "low",
    stage: "revision",
    progress: 60,
    comments: 7,
    version: "v1.8",
    tags: ["api", "tutorial", "integration"],
  },
]

const workflowStages = [
  { id: "ideation", name: "Ideation", color: "bg-gray-500", count: 12 },
  { id: "planning", name: "Planning", color: "bg-blue-500", count: 8 },
  { id: "writing", name: "Writing", color: "bg-yellow-500", count: 15 },
  { id: "review", name: "Review", color: "bg-orange-500", count: 6 },
  { id: "revision", name: "Revision", color: "bg-red-500", count: 4 },
  { id: "approval", name: "Approval", color: "bg-purple-500", count: 3 },
  { id: "ready_to_publish", name: "Ready to Publish", color: "bg-green-500", count: 2 },
  { id: "published", name: "Published", color: "bg-emerald-500", count: 45 },
]

const teamMembers = [
  { id: "1", name: "John Smith", role: "Content Writer", avatar: "/placeholder.svg", workload: 85 },
  { id: "2", name: "Sarah Johnson", role: "Editor", avatar: "/placeholder.svg", workload: 92 },
  { id: "3", name: "Mike Davis", role: "Technical Writer", avatar: "/placeholder.svg", workload: 78 },
  { id: "4", name: "Lisa Wang", role: "Content Manager", avatar: "/placeholder.svg", workload: 95 },
  { id: "5", name: "Alex Chen", role: "Designer", avatar: "/placeholder.svg", workload: 67 },
]

const contentTemplates = [
  { id: "1", name: "Blog Post", description: "Standard blog post template", category: "blog" },
  { id: "2", name: "Tutorial", description: "Step-by-step tutorial template", category: "tutorial" },
  { id: "3", name: "Feature Documentation", description: "Product feature documentation", category: "docs" },
  { id: "4", name: "API Guide", description: "API integration guide template", category: "technical" },
  { id: "5", name: "Marketing Copy", description: "Marketing content template", category: "marketing" },
]

export default function ContentWorkflowClient() {
  const [selectedStage, setSelectedStage] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-500/20 text-gray-400"
      case "in_review":
        return "bg-yellow-500/20 text-yellow-400"
      case "approved":
        return "bg-green-500/20 text-green-400"
      case "needs_revision":
        return "bg-red-500/20 text-red-400"
      case "published":
        return "bg-blue-500/20 text-blue-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400"
      case "low":
        return "bg-green-500/20 text-green-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDaysUntilDeadline = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const filteredContent = contentItems.filter((item) => {
    const matchesStage = selectedStage === "all" || item.stage === selectedStage
    const matchesPriority = selectedPriority === "all" || item.priority === selectedPriority
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesStage && matchesPriority && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Workflow className="w-8 h-8 mr-3 text-primary" />
            Content Workflow Management
          </h1>
          <p className="text-gray-400 mt-1">Streamlined content creation, review, and publication workflow</p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/80">
                <Plus className="w-4 h-4 mr-2" />
                New Content
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Content</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Start a new content piece using our workflow system
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title" className="text-gray-300">
                      Title
                    </Label>
                    <Input
                      id="title"
                      placeholder="Enter content title"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type" className="text-gray-300">
                      Content Type
                    </Label>
                    <Select>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="blog">Blog Post</SelectItem>
                        <SelectItem value="tutorial">Tutorial</SelectItem>
                        <SelectItem value="documentation">Documentation</SelectItem>
                        <SelectItem value="feature">Feature</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assignee" className="text-gray-300">
                      Assignee
                    </Label>
                    <Select>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name} - {member.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority" className="text-gray-300">
                      Priority
                    </Label>
                    <Select>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="deadline" className="text-gray-300">
                    Deadline
                  </Label>
                  <Input id="deadline" type="datetime-local" className="bg-gray-800 border-gray-700 text-white" />
                </div>
                <div>
                  <Label htmlFor="description" className="text-gray-300">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the content"
                    className="bg-gray-800 border-gray-700 text-white"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button className="bg-primary hover:bg-primary/80">Create Content</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Workflow Overview */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <GitBranch className="w-5 h-5 mr-2 text-primary" />
            Workflow Pipeline
          </CardTitle>
          <CardDescription className="text-gray-400">Content distribution across workflow stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {workflowStages.map((stage) => (
              <div
                key={stage.id}
                className="text-center p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors cursor-pointer"
                onClick={() => setSelectedStage(stage.id)}
              >
                <div
                  className={`w-12 h-12 ${stage.color} rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg`}
                >
                  {stage.count}
                </div>
                <h3 className="text-sm font-medium text-white mb-1">{stage.name}</h3>
                <p className="text-xs text-gray-400">items</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Stages</SelectItem>
                  {workflowStages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
          <TabsTrigger value="content" className="data-[state=active]:bg-primary">
            Content Items
          </TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-primary">
            Team Workload
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-primary">
            Templates
          </TabsTrigger>
          <TabsTrigger value="calendar" className="data-[state=active]:bg-primary">
            Calendar
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-primary">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <div className="grid gap-4">
            {filteredContent.map((item) => (
              <Card key={item.id} className="bg-gray-900/50 border-gray-800 hover:border-primary/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                        <Badge className={getStatusColor(item.status)}>{item.status.replace("_", " ")}</Badge>
                        <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                        <Badge variant="outline" className="text-gray-300 border-gray-600">
                          {item.type}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-gray-400 mb-3">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>Author: {item.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <UserCheck className="w-4 h-4" />
                          <span>Assignee: {item.assignee}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {formatDate(item.deadline)}</span>
                          {getDaysUntilDeadline(item.deadline) < 3 && (
                            <AlertTriangle className="w-4 h-4 text-red-400 ml-1" />
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{item.comments} comments</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <History className="w-4 h-4" />
                          <span>{item.version}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Progress</span>
                            <span className="text-white">{item.progress}%</span>
                          </div>
                          <Progress value={item.progress} className="h-2" />
                        </div>
                        <div className="flex items-center space-x-1">
                          {item.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs text-gray-400 border-gray-600">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
                          <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                            <Send className="w-4 h-4 mr-2" />
                            Send for Review
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                            <Archive className="w-4 h-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400 hover:bg-gray-800">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" />
                Team Workload Overview
              </CardTitle>
              <CardDescription className="text-gray-400">
                Current workload distribution across team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary text-white">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-white">{member.name}</h3>
                          <p className="text-sm text-gray-400">{member.role}</p>
                        </div>
                        <Badge
                          className={`${
                            member.workload > 90
                              ? "bg-red-500/20 text-red-400"
                              : member.workload > 75
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {member.workload}% capacity
                        </Badge>
                      </div>
                      <Progress value={member.workload} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary" />
                Content Templates
              </CardTitle>
              <CardDescription className="text-gray-400">
                Pre-built templates to streamline content creation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contentTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="bg-gray-800/50 border-gray-700 hover:border-primary/50 transition-all cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-white mb-1">{template.name}</h3>
                          <p className="text-sm text-gray-400">{template.description}</p>
                        </div>
                        <Badge variant="outline" className="text-gray-300 border-gray-600">
                          {template.category}
                        </Badge>
                      </div>
                      <Button className="w-full bg-primary hover:bg-primary/80">Use Template</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
