interface ContentVersion {
  id: string
  contentId: string
  version: number
  title: string
  content: string
  metadata: {
    author: string
    authorId: string
    createdAt: string
    updatedAt: string
    status: "draft" | "review" | "published" | "archived"
    tags: string[]
    category: string
    language: string
  }
  changes: {
    type: "create" | "update" | "delete" | "restore"
    description: string
    changedFields: string[]
    previousValues: Record<string, any>
    newValues: Record<string, any>
  }
  approval: {
    required: boolean
    approvedBy?: string
    approvedAt?: string
    rejectedBy?: string
    rejectedAt?: string
    comments?: string
  }
  publishing: {
    scheduledAt?: string
    publishedAt?: string
    unpublishedAt?: string
    publishedBy?: string
  }
  analytics: {
    views: number
    engagement: number
    shares: number
    comments: number
    rating: number
  }
}

interface ContentItem {
  id: string
  slug: string
  currentVersion: number
  latestVersion: number
  type: "article" | "page" | "post" | "documentation" | "tutorial" | "faq"
  versions: ContentVersion[]
  workflow: {
    currentStage: "draft" | "review" | "approved" | "published" | "archived"
    assignedTo?: string
    dueDate?: string
    priority: "low" | "medium" | "high" | "urgent"
  }
  seo: {
    metaTitle?: string
    metaDescription?: string
    keywords: string[]
    canonicalUrl?: string
    ogImage?: string
  }
  permissions: {
    canView: string[]
    canEdit: string[]
    canApprove: string[]
    canPublish: string[]
  }
}

interface ContentTemplate {
  id: string
  name: string
  description: string
  type: string
  structure: {
    fields: Array<{
      name: string
      type: "text" | "textarea" | "rich-text" | "image" | "video" | "select" | "multi-select"
      required: boolean
      placeholder?: string
      options?: string[]
      validation?: {
        minLength?: number
        maxLength?: number
        pattern?: string
      }
    }>
  }
  defaultValues: Record<string, any>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ContentWorkflow {
  id: string
  name: string
  description: string
  stages: Array<{
    id: string
    name: string
    description: string
    order: number
    permissions: {
      canEnter: string[]
      canExit: string[]
      canApprove: string[]
    }
    actions: Array<{
      name: string
      type: "approve" | "reject" | "request-changes" | "publish" | "archive"
      nextStage?: string
      notifications: string[]
    }>
    sla: {
      duration: number
      unit: "hours" | "days"
      escalation: {
        enabled: boolean
        after: number
        to: string[]
      }
    }
  }>
  isDefault: boolean
  applicableTypes: string[]
}

export class ContentVersioningSystem {
  private contentItems: Map<string, ContentItem> = new Map()
  private contentVersions: Map<string, ContentVersion> = new Map()
  private contentTemplates: Map<string, ContentTemplate> = new Map()
  private contentWorkflows: Map<string, ContentWorkflow> = new Map()

  constructor() {
    this.initializeTemplates()
    this.initializeWorkflows()
    this.initializeContent()
  }

  private initializeTemplates() {
    const templates: ContentTemplate[] = [
      {
        id: "blog-post",
        name: "Blog Post",
        description: "Standard blog post template with SEO optimization",
        type: "article",
        structure: {
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              placeholder: "Enter blog post title",
              validation: { minLength: 10, maxLength: 100 },
            },
            {
              name: "excerpt",
              type: "textarea",
              required: true,
              placeholder: "Brief description of the post",
              validation: { minLength: 50, maxLength: 300 },
            },
            {
              name: "content",
              type: "rich-text",
              required: true,
              placeholder: "Write your blog post content here",
            },
            {
              name: "featuredImage",
              type: "image",
              required: false,
              placeholder: "Upload featured image",
            },
            {
              name: "category",
              type: "select",
              required: true,
              options: ["Trading", "Technology", "Market Analysis", "Education", "News"],
            },
            {
              name: "tags",
              type: "multi-select",
              required: false,
              options: ["Crypto", "Stocks", "Forex", "AI", "Blockchain", "DeFi"],
            },
          ],
        },
        defaultValues: {
          category: "Trading",
          tags: [],
        },
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
      },
      {
        id: "documentation",
        name: "Documentation Page",
        description: "Technical documentation template with code examples",
        type: "documentation",
        structure: {
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              placeholder: "Documentation title",
            },
            {
              name: "description",
              type: "textarea",
              required: true,
              placeholder: "Brief description of the documentation",
            },
            {
              name: "content",
              type: "rich-text",
              required: true,
              placeholder: "Documentation content with code examples",
            },
            {
              name: "difficulty",
              type: "select",
              required: true,
              options: ["Beginner", "Intermediate", "Advanced"],
            },
            {
              name: "prerequisites",
              type: "multi-select",
              required: false,
              options: ["Basic Trading", "API Knowledge", "JavaScript", "Python"],
            },
          ],
        },
        defaultValues: {
          difficulty: "Beginner",
          prerequisites: [],
        },
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-10T14:20:00Z",
      },
    ]

    templates.forEach((template) => this.contentTemplates.set(template.id, template))
  }

  private initializeWorkflows() {
    const workflows: ContentWorkflow[] = [
      {
        id: "standard-review",
        name: "Standard Review Workflow",
        description: "Standard content review and approval process",
        stages: [
          {
            id: "draft",
            name: "Draft",
            description: "Content is being created or edited",
            order: 1,
            permissions: {
              canEnter: ["author", "editor", "admin"],
              canExit: ["author", "editor", "admin"],
              canApprove: ["author"],
            },
            actions: [
              {
                name: "Submit for Review",
                type: "approve",
                nextStage: "review",
                notifications: ["editor", "reviewer"],
              },
            ],
            sla: {
              duration: 7,
              unit: "days",
              escalation: {
                enabled: true,
                after: 5,
                to: ["editor"],
              },
            },
          },
          {
            id: "review",
            name: "Under Review",
            description: "Content is being reviewed by editors",
            order: 2,
            permissions: {
              canEnter: ["editor", "reviewer", "admin"],
              canExit: ["editor", "reviewer", "admin"],
              canApprove: ["editor", "reviewer"],
            },
            actions: [
              {
                name: "Approve",
                type: "approve",
                nextStage: "approved",
                notifications: ["author", "publisher"],
              },
              {
                name: "Request Changes",
                type: "request-changes",
                nextStage: "draft",
                notifications: ["author"],
              },
              {
                name: "Reject",
                type: "reject",
                nextStage: "draft",
                notifications: ["author"],
              },
            ],
            sla: {
              duration: 2,
              unit: "days",
              escalation: {
                enabled: true,
                after: 1,
                to: ["admin"],
              },
            },
          },
          {
            id: "approved",
            name: "Approved",
            description: "Content is approved and ready for publishing",
            order: 3,
            permissions: {
              canEnter: ["editor", "reviewer", "admin"],
              canExit: ["publisher", "admin"],
              canApprove: ["publisher"],
            },
            actions: [
              {
                name: "Publish",
                type: "publish",
                nextStage: "published",
                notifications: ["author", "editor"],
              },
              {
                name: "Schedule",
                type: "approve",
                nextStage: "scheduled",
                notifications: ["author", "editor"],
              },
            ],
            sla: {
              duration: 1,
              unit: "days",
              escalation: {
                enabled: false,
                after: 0,
                to: [],
              },
            },
          },
          {
            id: "published",
            name: "Published",
            description: "Content is live and publicly available",
            order: 4,
            permissions: {
              canEnter: ["publisher", "admin"],
              canExit: ["admin"],
              canApprove: ["admin"],
            },
            actions: [
              {
                name: "Unpublish",
                type: "archive",
                nextStage: "archived",
                notifications: ["author", "editor"],
              },
            ],
            sla: {
              duration: 0,
              unit: "days",
              escalation: {
                enabled: false,
                after: 0,
                to: [],
              },
            },
          },
        ],
        isDefault: true,
        applicableTypes: ["article", "post", "page"],
      },
    ]

    workflows.forEach((workflow) => this.contentWorkflows.set(workflow.id, workflow))
  }

  private initializeContent() {
    const sampleContent: ContentItem[] = [
      {
        id: "content-001",
        slug: "advanced-trading-strategies",
        currentVersion: 3,
        latestVersion: 3,
        type: "article",
        versions: [
          {
            id: "version-001-1",
            contentId: "content-001",
            version: 1,
            title: "Trading Strategies for Beginners",
            content: "Basic trading strategies content...",
            metadata: {
              author: "John Smith",
              authorId: "user-001",
              createdAt: "2024-01-10T09:00:00Z",
              updatedAt: "2024-01-10T09:00:00Z",
              status: "published",
              tags: ["trading", "beginners"],
              category: "Education",
              language: "en",
            },
            changes: {
              type: "create",
              description: "Initial content creation",
              changedFields: ["title", "content"],
              previousValues: {},
              newValues: {
                title: "Trading Strategies for Beginners",
                content: "Basic trading strategies content...",
              },
            },
            approval: {
              required: true,
              approvedBy: "editor-001",
              approvedAt: "2024-01-10T10:30:00Z",
            },
            publishing: {
              publishedAt: "2024-01-10T11:00:00Z",
              publishedBy: "publisher-001",
            },
            analytics: {
              views: 1250,
              engagement: 78.5,
              shares: 45,
              comments: 12,
              rating: 4.2,
            },
          },
          {
            id: "version-001-2",
            contentId: "content-001",
            version: 2,
            title: "Advanced Trading Strategies",
            content: "Updated content with advanced strategies...",
            metadata: {
              author: "John Smith",
              authorId: "user-001",
              createdAt: "2024-01-15T14:00:00Z",
              updatedAt: "2024-01-15T14:00:00Z",
              status: "published",
              tags: ["trading", "advanced"],
              category: "Education",
              language: "en",
            },
            changes: {
              type: "update",
              description: "Updated title and added advanced strategies",
              changedFields: ["title", "content", "tags"],
              previousValues: {
                title: "Trading Strategies for Beginners",
                tags: ["trading", "beginners"],
              },
              newValues: {
                title: "Advanced Trading Strategies",
                tags: ["trading", "advanced"],
              },
            },
            approval: {
              required: true,
              approvedBy: "editor-001",
              approvedAt: "2024-01-15T15:30:00Z",
            },
            publishing: {
              publishedAt: "2024-01-15T16:00:00Z",
              publishedBy: "publisher-001",
            },
            analytics: {
              views: 2100,
              engagement: 85.2,
              shares: 78,
              comments: 23,
              rating: 4.6,
            },
          },
          {
            id: "version-001-3",
            contentId: "content-001",
            version: 3,
            title: "Advanced Trading Strategies",
            content: "Enhanced content with AI insights and real examples...",
            metadata: {
              author: "John Smith",
              authorId: "user-001",
              createdAt: "2024-01-20T10:00:00Z",
              updatedAt: "2024-01-20T10:00:00Z",
              status: "published",
              tags: ["trading", "advanced", "ai"],
              category: "Education",
              language: "en",
            },
            changes: {
              type: "update",
              description: "Added AI insights and real trading examples",
              changedFields: ["content", "tags"],
              previousValues: {
                content: "Updated content with advanced strategies...",
                tags: ["trading", "advanced"],
              },
              newValues: {
                content: "Enhanced content with AI insights and real examples...",
                tags: ["trading", "advanced", "ai"],
              },
            },
            approval: {
              required: true,
              approvedBy: "editor-002",
              approvedAt: "2024-01-20T11:30:00Z",
            },
            publishing: {
              publishedAt: "2024-01-20T12:00:00Z",
              publishedBy: "publisher-001",
            },
            analytics: {
              views: 3450,
              engagement: 92.1,
              shares: 156,
              comments: 45,
              rating: 4.8,
            },
          },
        ],
        workflow: {
          currentStage: "published",
          priority: "medium",
        },
        seo: {
          metaTitle: "Advanced Trading Strategies - NEXURAL",
          metaDescription: "Learn advanced trading strategies with AI insights and real examples",
          keywords: ["trading", "strategies", "advanced", "ai", "crypto"],
          canonicalUrl: "/articles/advanced-trading-strategies",
          ogImage: "/images/trading-strategies-og.jpg",
        },
        permissions: {
          canView: ["public"],
          canEdit: ["author", "editor", "admin"],
          canApprove: ["editor", "admin"],
          canPublish: ["publisher", "admin"],
        },
      },
    ]

    sampleContent.forEach((content) => {
      this.contentItems.set(content.id, content)
      content.versions.forEach((version) => {
        this.contentVersions.set(version.id, version)
      })
    })
  }

  getContentItems(): ContentItem[] {
    return Array.from(this.contentItems.values())
  }

  getContentItem(id: string): ContentItem | undefined {
    return this.contentItems.get(id)
  }

  getContentVersion(contentId: string, version: number): ContentVersion | undefined {
    const content = this.contentItems.get(contentId)
    if (!content) return undefined

    return content.versions.find((v) => v.version === version)
  }

  getContentVersions(contentId: string): ContentVersion[] {
    const content = this.contentItems.get(contentId)
    return content ? content.versions : []
  }

  createContentVersion(contentId: string, updates: Partial<ContentVersion>, changeDescription: string): string | null {
    const content = this.contentItems.get(contentId)
    if (!content) return null

    const latestVersion = Math.max(...content.versions.map((v) => v.version))
    const newVersion = latestVersion + 1
    const versionId = `version-${contentId}-${newVersion}`

    const previousVersion = content.versions.find((v) => v.version === latestVersion)
    const changedFields: string[] = []
    const previousValues: Record<string, any> = {}
    const newValues: Record<string, any> = {}

    // Compare changes
    if (updates.title && previousVersion && updates.title !== previousVersion.title) {
      changedFields.push("title")
      previousValues.title = previousVersion.title
      newValues.title = updates.title
    }

    if (updates.content && previousVersion && updates.content !== previousVersion.content) {
      changedFields.push("content")
      previousValues.content = previousVersion.content
      newValues.content = updates.content
    }

    const newVersionData: ContentVersion = {
      id: versionId,
      contentId,
      version: newVersion,
      title: updates.title || previousVersion?.title || "",
      content: updates.content || previousVersion?.content || "",
      metadata: {
        ...previousVersion?.metadata,
        ...updates.metadata,
        updatedAt: new Date().toISOString(),
        status: "draft",
      },
      changes: {
        type: "update",
        description: changeDescription,
        changedFields,
        previousValues,
        newValues,
      },
      approval: {
        required: true,
      },
      publishing: {},
      analytics: {
        views: 0,
        engagement: 0,
        shares: 0,
        comments: 0,
        rating: 0,
      },
    }

    content.versions.push(newVersionData)
    content.latestVersion = newVersion
    this.contentVersions.set(versionId, newVersionData)

    return versionId
  }

  rollbackToVersion(contentId: string, targetVersion: number): boolean {
    const content = this.contentItems.get(contentId)
    if (!content) return false

    const targetVersionData = content.versions.find((v) => v.version === targetVersion)
    if (!targetVersionData) return false

    // Create a new version based on the target version
    const rollbackVersionId = this.createContentVersion(
      contentId,
      {
        title: targetVersionData.title,
        content: targetVersionData.content,
        metadata: {
          ...targetVersionData.metadata,
          status: "draft",
        },
      },
      `Rolled back to version ${targetVersion}`,
    )

    if (rollbackVersionId) {
      const rollbackVersion = this.contentVersions.get(rollbackVersionId)
      if (rollbackVersion) {
        rollbackVersion.changes.type = "restore"
        return true
      }
    }

    return false
  }

  compareVersions(
    contentId: string,
    version1: number,
    version2: number,
  ): {
    differences: Array<{
      field: string
      version1Value: any
      version2Value: any
      changeType: "added" | "removed" | "modified"
    }>
  } | null {
    const content = this.contentItems.get(contentId)
    if (!content) return null

    const v1 = content.versions.find((v) => v.version === version1)
    const v2 = content.versions.find((v) => v.version === version2)

    if (!v1 || !v2) return null

    const differences: Array<{
      field: string
      version1Value: any
      version2Value: any
      changeType: "added" | "removed" | "modified"
    }> = []

    // Compare title
    if (v1.title !== v2.title) {
      differences.push({
        field: "title",
        version1Value: v1.title,
        version2Value: v2.title,
        changeType: "modified",
      })
    }

    // Compare content
    if (v1.content !== v2.content) {
      differences.push({
        field: "content",
        version1Value: v1.content,
        version2Value: v2.content,
        changeType: "modified",
      })
    }

    // Compare tags
    const v1Tags = v1.metadata.tags.sort()
    const v2Tags = v2.metadata.tags.sort()
    if (JSON.stringify(v1Tags) !== JSON.stringify(v2Tags)) {
      differences.push({
        field: "tags",
        version1Value: v1Tags,
        version2Value: v2Tags,
        changeType: "modified",
      })
    }

    return { differences }
  }

  getContentTemplates(): ContentTemplate[] {
    return Array.from(this.contentTemplates.values())
  }

  getContentWorkflows(): ContentWorkflow[] {
    return Array.from(this.contentWorkflows.values())
  }

  getContentAnalytics(contentId: string): {
    totalViews: number
    totalEngagement: number
    totalShares: number
    totalComments: number
    averageRating: number
    versionPerformance: Array<{
      version: number
      views: number
      engagement: number
      publishedAt: string
    }>
  } | null {
    const content = this.contentItems.get(contentId)
    if (!content) return null

    const totalViews = content.versions.reduce((sum, v) => sum + v.analytics.views, 0)
    const totalEngagement = content.versions.reduce((sum, v) => sum + v.analytics.engagement, 0)
    const totalShares = content.versions.reduce((sum, v) => sum + v.analytics.shares, 0)
    const totalComments = content.versions.reduce((sum, v) => sum + v.analytics.comments, 0)
    const averageRating = content.versions.reduce((sum, v) => sum + v.analytics.rating, 0) / content.versions.length

    const versionPerformance = content.versions.map((v) => ({
      version: v.version,
      views: v.analytics.views,
      engagement: v.analytics.engagement,
      publishedAt: v.publishing.publishedAt || "",
    }))

    return {
      totalViews,
      totalEngagement,
      totalShares,
      totalComments,
      averageRating,
      versionPerformance,
    }
  }

  searchContent(
    query: string,
    filters?: {
      type?: string
      status?: string
      author?: string
      category?: string
      tags?: string[]
    },
  ): ContentItem[] {
    const items = this.getContentItems()

    return items.filter((item) => {
      const currentVersion = item.versions.find((v) => v.version === item.currentVersion)
      if (!currentVersion) return false

      // Text search
      const matchesQuery =
        query === "" ||
        currentVersion.title.toLowerCase().includes(query.toLowerCase()) ||
        currentVersion.content.toLowerCase().includes(query.toLowerCase()) ||
        currentVersion.metadata.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))

      // Filters
      const matchesType = !filters?.type || item.type === filters.type
      const matchesStatus = !filters?.status || currentVersion.metadata.status === filters.status
      const matchesAuthor = !filters?.author || currentVersion.metadata.author === filters.author
      const matchesCategory = !filters?.category || currentVersion.metadata.category === filters.category
      const matchesTags = !filters?.tags || filters.tags.every((tag) => currentVersion.metadata.tags.includes(tag))

      return matchesQuery && matchesType && matchesStatus && matchesAuthor && matchesCategory && matchesTags
    })
  }
}

export const contentVersioningSystem = new ContentVersioningSystem()
