"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Activity,
  Calendar,
  Users,
  MessageSquare,
  Settings,
  ExternalLink,
  Clock,
  Flag,
  TrendingUp,
  BarChart3,
  Bell,
  RefreshCw
} from "lucide-react"

interface ContentItem {
  id: string
  title: string
  type: 'guideline' | 'changelog' | 'status' | 'help'
  status: 'draft' | 'published' | 'archived'
  lastModified: string
  author: string
}

const mockContent: ContentItem[] = [
  {
    id: '1',
    title: 'Community Guidelines',
    type: 'guideline',
    status: 'published',
    lastModified: '2024-01-15',
    author: 'Admin Team'
  },
  {
    id: '2',
    title: 'v2.1.0 Release Notes',
    type: 'changelog',
    status: 'published',
    lastModified: '2024-01-15',
    author: 'Engineering'
  },
  {
    id: '3',
    title: 'System Status Configuration',
    type: 'status',
    status: 'published',
    lastModified: '2024-01-14',
    author: 'DevOps Team'
  },
  {
    id: '4',
    title: 'Getting Started Guide',
    type: 'help',
    status: 'draft',
    lastModified: '2024-01-13',
    author: 'Support Team'
  }
]

const contentTypeConfig = {
  guideline: { 
    label: 'Guidelines', 
    icon: Users, 
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-700'
  },
  changelog: { 
    label: 'Changelog', 
    icon: Calendar, 
    color: 'text-green-400',
    bgColor: 'bg-green-900/20',
    borderColor: 'border-green-700'
  },
  status: { 
    label: 'Status Page', 
    icon: Activity, 
    color: 'text-amber-400',
    bgColor: 'bg-amber-900/20',
    borderColor: 'border-amber-700'
  },
  help: { 
    label: 'Help Center', 
    icon: MessageSquare, 
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
    borderColor: 'border-purple-700'
  }
}

export default function ContentManagementAdmin() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [editingItem, setEditingItem] = useState<string | null>(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-600">Published</Badge>
      case 'draft':
        return <Badge className="bg-amber-600">Draft</Badge>
      case 'archived':
        return <Badge className="bg-gray-600">Archived</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Content Management</h1>
          <p className="text-gray-400">Manage community guidelines, changelog, system status, and help content</p>
        </div>
        <div className="flex gap-4">
          <Button className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Content
          </Button>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Changes
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
          <TabsTrigger value="changelog">Changelog</TabsTrigger>
          <TabsTrigger value="status">Status Page</TabsTrigger>
          <TabsTrigger value="help">Help Center</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Content Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                <FileText className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                <div className="text-2xl font-bold text-white mb-2">12</div>
                <div className="text-sm text-gray-400">Total Pages</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-4" />
                <div className="text-2xl font-bold text-white mb-2">8</div>
                <div className="text-sm text-gray-400">Published</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                <Edit3 className="w-8 h-8 text-amber-400 mx-auto mb-4" />
                <div className="text-2xl font-bold text-white mb-2">3</div>
                <div className="text-sm text-gray-400">In Draft</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-4" />
                <div className="text-2xl font-bold text-white mb-2">24K</div>
                <div className="text-sm text-gray-400">Page Views</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Content Activity */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Recent Content Activity</CardTitle>
              <CardDescription>Latest updates and modifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockContent.map((item) => {
                  const config = contentTypeConfig[item.type]
                  return (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-4">
                        <config.icon className={`w-5 h-5 ${config.color}`} />
                        <div>
                          <div className="font-semibold text-white">{item.title}</div>
                          <div className="text-sm text-gray-400">Modified by {item.author} on {item.lastModified}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(item.status)}
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Content Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  Page Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Community Guidelines</span>
                    <span className="text-green-400">+12% views</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">System Status</span>
                    <span className="text-blue-400">+8% views</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Help Center</span>
                    <span className="text-amber-400">+15% searches</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Changelog</span>
                    <span className="text-purple-400">+25% engagement</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-400" />
                  Content Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-amber-900/20 border border-amber-700 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-amber-400">Review Required</div>
                      <div className="text-xs text-gray-300">Terms of Service needs quarterly review</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                    <Flag className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-blue-400">Update Available</div>
                      <div className="text-xs text-gray-300">New changelog entry ready for publication</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-900/20 border border-green-700 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-green-400">All Systems Operational</div>
                      <div className="text-xs text-gray-300">Status page showing healthy services</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Community Guidelines Tab */}
        <TabsContent value="guidelines" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Community Guidelines Management
              </CardTitle>
              <CardDescription>
                Manage platform rules, code of conduct, and community policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-white">Current Guidelines</h3>
                  <p className="text-sm text-gray-400">Last updated: January 15, 2024</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button size="sm">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <MessageSquare className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-sm font-semibold text-white">Communication</div>
                    <div className="text-xs text-gray-400">5 rules</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-sm font-semibold text-white">Information</div>
                    <div className="text-xs text-gray-400">5 rules</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Flag className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                    <div className="text-sm font-semibold text-white">Violations</div>
                    <div className="text-xs text-gray-400">4 levels</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Settings className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-sm font-semibold text-white">Enforcement</div>
                    <div className="text-xs text-gray-400">Auto + Manual</div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Quick Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Rule Category
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Modify Violation Levels
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Public Page
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Usage Analytics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Changelog Tab */}
        <TabsContent value="changelog" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-400" />
                Changelog Management
              </CardTitle>
              <CardDescription>
                Manage product updates, release notes, and version history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-white">Latest Release</h3>
                  <p className="text-sm text-gray-400">Version 2.1.0 - January 15, 2024</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Release
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Draft
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge className="bg-blue-600">v2.1.0</Badge>
                    <div>
                      <div className="font-semibold text-white">Enhanced AI Signals & Portfolio Analytics</div>
                      <div className="text-sm text-gray-400">24 new features, 47 improvements, 33 fixes</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-green-600">Published</Badge>
                    <Button size="sm" variant="outline">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge className="bg-green-600">v2.0.5</Badge>
                    <div>
                      <div className="font-semibold text-white">Security & Performance Updates</div>
                      <div className="text-sm text-gray-400">Critical security patches and optimizations</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-green-600">Published</Badge>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge className="bg-amber-600">v2.2.0</Badge>
                    <div>
                      <div className="font-semibold text-white">Advanced Trading Features</div>
                      <div className="text-sm text-gray-400">Draft - In development</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-amber-600">Draft</Badge>
                    <Button size="sm" variant="outline">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Plus className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-sm font-semibold text-white">New Features</div>
                    <div className="text-2xl font-bold text-green-400">127</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-sm font-semibold text-white">Improvements</div>
                    <div className="text-2xl font-bold text-blue-400">234</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-sm font-semibold text-white">Bug Fixes</div>
                    <div className="text-2xl font-bold text-purple-400">189</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Status Page Tab */}
        <TabsContent value="status" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                System Status Management
              </CardTitle>
              <CardDescription>
                Configure system status display, incident reporting, and service monitoring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-green-900/20 border-green-700">
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-sm font-semibold text-white">Operational</div>
                    <div className="text-xs text-gray-400">6 services</div>
                  </CardContent>
                </Card>
                <Card className="bg-amber-900/20 border-amber-700">
                  <CardContent className="p-4 text-center">
                    <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                    <div className="text-sm font-semibold text-white">Degraded</div>
                    <div className="text-xs text-gray-400">1 service</div>
                  </CardContent>
                </Card>
                <Card className="bg-blue-900/20 border-blue-700">
                  <CardContent className="p-4 text-center">
                    <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-sm font-semibold text-white">Maintenance</div>
                    <div className="text-xs text-gray-400">1 scheduled</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-sm font-semibold text-white">Uptime</div>
                    <div className="text-xs text-gray-400">99.96%</div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Status Page Configuration</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Public Status Page</Label>
                      <p className="text-sm text-gray-400">Allow public access to system status</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Incident Notifications</Label>
                      <p className="text-sm text-gray-400">Send alerts for new incidents</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Maintenance Announcements</Label>
                      <p className="text-sm text-gray-400">Display scheduled maintenance</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Historical Data</Label>
                      <p className="text-sm text-gray-400">Show 90-day uptime history</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service Monitor
                </Button>
                <Button variant="outline" className="justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Maintenance
                </Button>
                <Button variant="outline" className="justify-start">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report Incident
                </Button>
                <Button variant="outline" className="justify-start">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Public Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Help Center Tab */}
        <TabsContent value="help" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                Help Center Management
              </CardTitle>
              <CardDescription>
                Manage knowledge base articles, FAQs, and support documentation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <FileText className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">47</div>
                    <div className="text-sm text-gray-400">Articles</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">1.2K</div>
                    <div className="text-sm text-gray-400">Monthly Views</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">87%</div>
                    <div className="text-sm text-gray-400">Helpful Rating</div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold text-white">Categories</h4>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div>
                        <div className="font-semibold text-white">Getting Started</div>
                        <div className="text-sm text-gray-400">12 articles</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">Published</Badge>
                      <Button size="sm" variant="outline">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div>
                        <div className="font-semibold text-white">Trading Features</div>
                        <div className="text-sm text-gray-400">18 articles</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">Published</Badge>
                      <Button size="sm" variant="outline">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                      <div>
                        <div className="font-semibold text-white">API Documentation</div>
                        <div className="text-sm text-gray-400">8 articles</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">Published</Badge>
                      <Button size="sm" variant="outline">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <div>
                        <div className="font-semibold text-white">Troubleshooting</div>
                        <div className="text-sm text-gray-400">9 articles</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">Published</Badge>
                      <Button size="sm" variant="outline">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Article
                </Button>
                <Button variant="outline" className="justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" className="justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  User Feedback
                </Button>
                <Button variant="outline" className="justify-start">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Preview Help Center
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


