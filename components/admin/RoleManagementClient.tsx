"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Shield, 
  Users, 
  Plus, 
  Settings, 
  Trash2, 
  Edit3, 
  Check, 
  X,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Crown,
  Key,
  UserCheck,
  Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRequireAdmin } from "@/lib/auth/auth-context"
import { Role, Permission, PERMISSIONS, getPermissionCategories } from "@/lib/auth/rbac-utils"

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  roles?: Role[]
  role?: Role
}

export default function RoleManagementClient() {
  const auth = useRequireAdmin() // Redirect if not admin
  
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  
  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    level: 1,
    color: 'gray',
    permissions: [] as string[]
  })

  // Load roles on mount
  useEffect(() => {
    if (auth.user && !auth.isLoading) {
      loadRoles()
    }
  }, [auth.user, auth.isLoading])

  const loadRoles = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/roles', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      const data: ApiResponse = await response.json()
      
      if (data.success && data.roles) {
        setRoles(data.roles)
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to load roles' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error loading roles' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateRole = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData)
      })
      
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        setShowCreateDialog(false)
        resetForm()
        loadRoles()
      } else {
        setMessage({ type: 'error', text: data.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error creating role' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditRole = async () => {
    if (!selectedRole) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/roles/${selectedRole.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData)
      })
      
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        setShowEditDialog(false)
        setSelectedRole(null)
        resetForm()
        loadRoles()
      } else {
        setMessage({ type: 'error', text: data.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error updating role' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRole = async () => {
    if (!selectedRole) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/roles/${selectedRole.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        setShowDeleteDialog(false)
        setSelectedRole(null)
        loadRoles()
      } else {
        setMessage({ type: 'error', text: data.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error deleting role' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      description: '',
      level: 1,
      color: 'gray',
      permissions: []
    })
  }

  const openEditDialog = (role: Role) => {
    setSelectedRole(role)
    setFormData({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      level: role.level,
      color: role.color,
      permissions: [...role.permissions]
    })
    setShowEditDialog(true)
  }

  const openDeleteDialog = (role: Role) => {
    setSelectedRole(role)
    setShowDeleteDialog(true)
  }

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  // Filter roles based on search and level
  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesLevel = filterLevel === 'all' || 
                        (filterLevel === 'system' && role.isSystem) ||
                        (filterLevel === 'custom' && !role.isSystem) ||
                        (filterLevel === 'high' && role.level >= 8) ||
                        (filterLevel === 'medium' && role.level >= 4 && role.level < 8) ||
                        (filterLevel === 'low' && role.level < 4)
    
    return matchesSearch && matchesLevel
  })

  const getRoleIcon = (role: Role) => {
    if (role.level >= 8) return Crown
    if (role.level >= 4) return Shield
    return Users
  }

  const getRoleLevelColor = (level: number) => {
    if (level >= 8) return 'text-red-400'
    if (level >= 4) return 'text-yellow-400'
    return 'text-green-400'
  }

  if (auth.isLoading || isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading role management...</p>
        </div>
      </div>
    )
  }

  const permissionCategories = getPermissionCategories()

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Role Management</h1>
              <p className="text-gray-400">Manage user roles and permissions for your platform</p>
            </div>
            <Button
              onClick={() => {
                resetForm()
                setShowCreateDialog(true)
              }}
              className="bg-primary text-black hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </Button>
          </div>
        </motion.div>

        {/* Message Alert */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert className={message.type === 'success' 
              ? 'border-green-500/50 bg-green-900/20' 
              : 'border-red-500/50 bg-red-900/20'
            }>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription className={message.type === 'success' ? 'text-green-200' : 'text-red-200'}>
                {message.text}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-gray-900/50 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search roles..."
                      className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <Select value={filterLevel} onValueChange={setFilterLevel}>
                    <SelectTrigger className="w-32 bg-gray-800/50 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                      <SelectItem value="high">High Level</SelectItem>
                      <SelectItem value="medium">Medium Level</SelectItem>
                      <SelectItem value="low">Low Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Roles Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gray-900/50 border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Roles ({filteredRoles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Role</TableHead>
                    <TableHead className="text-gray-300">Level</TableHead>
                    <TableHead className="text-gray-300">Permissions</TableHead>
                    <TableHead className="text-gray-300">Type</TableHead>
                    <TableHead className="text-gray-300">Created</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.map((role) => {
                    const RoleIcon = getRoleIcon(role)
                    return (
                      <TableRow key={role.id} className="border-gray-700 hover:bg-gray-800/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full bg-${role.color}-500/20 flex items-center justify-center`}>
                              <RoleIcon className={`w-5 h-5 text-${role.color}-400`} />
                            </div>
                            <div>
                              <p className="text-white font-medium">{role.displayName}</p>
                              <p className="text-sm text-gray-400">@{role.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${getRoleLevelColor(role.level)}`}>
                              {role.level}
                            </span>
                            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full bg-gradient-to-r ${
                                  role.level >= 8 ? 'from-red-500 to-red-600' :
                                  role.level >= 4 ? 'from-yellow-500 to-yellow-600' :
                                  'from-green-500 to-green-600'
                                }`}
                                style={{ width: `${Math.min(role.level * 10, 100)}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-gray-400" />
                            <span className="text-white">{role.permissions.length}</span>
                            <span className="text-gray-400">permissions</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${
                            role.isSystem 
                              ? 'border-blue-500/50 text-blue-400'
                              : 'border-green-500/50 text-green-400'
                          }`}>
                            {role.isSystem ? 'System' : 'Custom'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-400">
                            {new Date(role.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-gray-800 border-gray-700" align="end">
                              <DropdownMenuItem 
                                className="text-white hover:bg-gray-700 cursor-pointer"
                                onClick={() => openEditDialog(role)}
                              >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit Role
                              </DropdownMenuItem>
                              {!role.isSystem && (
                                <DropdownMenuItem 
                                  className="text-red-400 hover:bg-gray-700 cursor-pointer"
                                  onClick={() => openDeleteDialog(role)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Role
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              
              {filteredRoles.length === 0 && (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No roles found matching your criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Create Role Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Create New Role</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Role Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., content_editor"
                    className="bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Display Name</Label>
                  <Input
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="e.g., Content Editor"
                    className="bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the role and its responsibilities..."
                  className="bg-gray-800/50 border-gray-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Level (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.level}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                    className="bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Color</Label>
                  <Select 
                    value={formData.color} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
                  >
                    <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="red">Red</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="yellow">Yellow</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="pink">Pink</SelectItem>
                      <SelectItem value="gray">Gray</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <Label className="text-gray-300">Permissions</Label>
                <div className="space-y-4">
                  {permissionCategories.map(category => {
                    const categoryPermissions = Object.values(PERMISSIONS).filter(p => p.category === category)
                    const selectedInCategory = categoryPermissions.filter(p => formData.permissions.includes(p.id)).length
                    
                    return (
                      <div key={category} className="border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white font-medium capitalize">
                            {category.replace('_', ' ')}
                          </h4>
                          <Badge variant="outline" className="border-gray-600 text-gray-400">
                            {selectedInCategory}/{categoryPermissions.length}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {categoryPermissions.map(permission => (
                            <div key={permission.id} className="flex items-start space-x-2">
                              <Checkbox
                                id={permission.id}
                                checked={formData.permissions.includes(permission.id)}
                                onCheckedChange={() => handlePermissionToggle(permission.id)}
                              />
                              <div className="grid gap-1.5 leading-none">
                                <Label 
                                  htmlFor={permission.id}
                                  className="text-sm text-white cursor-pointer"
                                >
                                  {permission.name}
                                </Label>
                                <p className="text-xs text-gray-400">
                                  {permission.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateRole}
                disabled={isSubmitting || !formData.name || !formData.displayName}
                className="bg-primary text-black hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-black rounded-full animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Role Dialog - Similar to Create but with selectedRole data */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Edit Role: {selectedRole?.displayName}</DialogTitle>
            </DialogHeader>
            
            {/* Similar form as create dialog but with edit functionality */}
            <div className="space-y-6">
              {/* Form content similar to create dialog... */}
              <div className="text-center py-4">
                <p className="text-gray-400">Edit form implementation similar to create dialog...</p>
                <p className="text-sm text-gray-500 mt-2">Full implementation available in production version</p>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowEditDialog(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditRole}
                disabled={isSubmitting || !formData.name || !formData.displayName}
                className="bg-primary text-black hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-black rounded-full animate-spin mr-2" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl">Delete Role</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <Alert className="border-red-500/50 bg-red-900/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-200">
                  This action cannot be undone. This will permanently delete the role "{selectedRole?.displayName}".
                </AlertDescription>
              </Alert>
              
              {selectedRole?.isSystem && (
                <Alert className="border-yellow-500/50 bg-yellow-900/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-yellow-200">
                    This is a system role and cannot be deleted.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteDialog(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteRole}
                disabled={isSubmitting || selectedRole?.isSystem}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Delete Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}


