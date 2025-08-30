export interface TransformationPhase {
  id: string
  name: string
  duration: string
  status: "planned" | "in-progress" | "completed" | "delayed"
  progress: number
  budget: number
  budgetUsed: number
  startDate: string
  endDate: string
  milestones: Milestone[]
  risks: Risk[]
  dependencies: string[]
}

interface Milestone {
  id: string
  name: string
  description: string
  dueDate: string
  status: "pending" | "in-progress" | "completed" | "overdue"
  deliverables: string[]
  assignee: string
}

interface Risk {
  id: string
  name: string
  description: string
  impact: "low" | "medium" | "high" | "critical"
  probability: "low" | "medium" | "high"
  mitigation: string
  status: "identified" | "mitigated" | "resolved"
}

export class TransformationTracker {
  private phases: TransformationPhase[] = []

  constructor() {
    this.initializePhases()
  }

  private initializePhases() {
    this.phases = [
      {
        id: "phase-1",
        name: "Assessment and Planning",
        duration: "2 months",
        status: "planned",
        progress: 0,
        budget: 200000,
        budgetUsed: 0,
        startDate: "2024-02-01",
        endDate: "2024-03-31",
        milestones: [
          {
            id: "m1-1",
            name: "Technical Audit Complete",
            description: "Complete assessment of current system architecture and performance",
            dueDate: "2024-02-15",
            status: "pending",
            deliverables: ["Technical audit report", "Performance baseline", "Security assessment"],
            assignee: "Technical Lead",
          },
          {
            id: "m1-2",
            name: "User Research Complete",
            description: "Complete stakeholder interviews and usage analytics",
            dueDate: "2024-02-28",
            status: "pending",
            deliverables: ["User research report", "Requirements document", "User personas"],
            assignee: "UX Designer",
          },
          {
            id: "m1-3",
            name: "Strategic Roadmap Finalized",
            description: "Finalize transformation roadmap and resource allocation",
            dueDate: "2024-03-31",
            status: "pending",
            deliverables: ["Detailed roadmap", "Resource plan", "Budget allocation"],
            assignee: "Project Manager",
          },
        ],
        risks: [
          {
            id: "r1-1",
            name: "Stakeholder Availability",
            description: "Key stakeholders may not be available for interviews",
            impact: "medium",
            probability: "medium",
            mitigation: "Schedule interviews well in advance and have backup dates",
            status: "identified",
          },
        ],
        dependencies: [],
      },
      {
        id: "phase-2",
        name: "Core Enhancements",
        duration: "6 months",
        status: "planned",
        progress: 0,
        budget: 800000,
        budgetUsed: 0,
        startDate: "2024-04-01",
        endDate: "2024-09-30",
        milestones: [
          {
            id: "m2-1",
            name: "Real-time Infrastructure Deployed",
            description: "WebSocket infrastructure with Redis clustering implemented",
            dueDate: "2024-05-31",
            status: "pending",
            deliverables: ["WebSocket server", "Redis cluster", "Real-time dashboard"],
            assignee: "Backend Team Lead",
          },
          {
            id: "m2-2",
            name: "Enhanced Security Framework",
            description: "Zero-trust security architecture implemented",
            dueDate: "2024-07-31",
            status: "pending",
            deliverables: ["MFA system", "RBAC 2.0", "Audit logging"],
            assignee: "Security Engineer",
          },
          {
            id: "m2-3",
            name: "Customer Support Integration",
            description: "Omnichannel support system integrated",
            dueDate: "2024-08-31",
            status: "pending",
            deliverables: ["Live chat system", "Ticket management", "Knowledge base"],
            assignee: "Full-stack Developer",
          },
          {
            id: "m2-4",
            name: "Performance Optimization Complete",
            description: "System performance optimized for enterprise scale",
            dueDate: "2024-09-30",
            status: "pending",
            deliverables: ["Database optimization", "CDN integration", "Code optimization"],
            assignee: "DevOps Engineer",
          },
        ],
        risks: [
          {
            id: "r2-1",
            name: "Real-time System Complexity",
            description: "WebSocket implementation may be more complex than anticipated",
            impact: "high",
            probability: "medium",
            mitigation: "Prototype early and conduct thorough testing",
            status: "identified",
          },
        ],
        dependencies: ["phase-1"],
      },
      {
        id: "phase-3",
        name: "Advanced Functionality",
        duration: "6 months",
        status: "planned",
        progress: 0,
        budget: 900000,
        budgetUsed: 0,
        startDate: "2024-10-01",
        endDate: "2025-03-31",
        milestones: [
          {
            id: "m3-1",
            name: "Advanced Financial Reporting",
            description: "Real-time financial dashboards and predictive analytics",
            dueDate: "2024-11-30",
            status: "pending",
            deliverables: ["Financial dashboard", "Predictive models", "Compliance reports"],
            assignee: "Financial Systems Developer",
          },
          {
            id: "m3-2",
            name: "Marketing Automation Platform",
            description: "Complete marketing automation and campaign management",
            dueDate: "2025-01-31",
            status: "pending",
            deliverables: ["Campaign manager", "Segmentation engine", "A/B testing"],
            assignee: "Marketing Tech Developer",
          },
          {
            id: "m3-3",
            name: "API Management 2.0",
            description: "Enterprise-grade API management with developer portal",
            dueDate: "2025-03-31",
            status: "pending",
            deliverables: ["API gateway", "Developer portal", "API analytics"],
            assignee: "API Developer",
          },
        ],
        risks: [
          {
            id: "r3-1",
            name: "Third-party Integration Delays",
            description: "Marketing automation integrations may face delays",
            impact: "medium",
            probability: "medium",
            mitigation: "Have backup integration options ready",
            status: "identified",
          },
        ],
        dependencies: ["phase-2"],
      },
      {
        id: "phase-4",
        name: "User Experience Improvements",
        duration: "4 months",
        status: "planned",
        progress: 0,
        budget: 500000,
        budgetUsed: 0,
        startDate: "2025-04-01",
        endDate: "2025-07-31",
        milestones: [
          {
            id: "m4-1",
            name: "Advanced Dashboard Customization",
            description: "Visual dashboard builder and widget marketplace",
            dueDate: "2025-05-31",
            status: "pending",
            deliverables: ["Dashboard builder", "Widget marketplace", "Theme engine"],
            assignee: "Frontend Team Lead",
          },
          {
            id: "m4-2",
            name: "AI-Powered User Segmentation",
            description: "Machine learning enhanced user segmentation",
            dueDate: "2025-06-30",
            status: "pending",
            deliverables: ["ML models", "Dynamic segmentation", "Segment analytics"],
            assignee: "Data Scientist",
          },
          {
            id: "m4-3",
            name: "Enterprise Media Management",
            description: "AI-powered digital asset management system",
            dueDate: "2025-07-31",
            status: "pending",
            deliverables: ["AI tagging", "Video processing", "DAM workflow"],
            assignee: "Media Systems Developer",
          },
        ],
        risks: [
          {
            id: "r4-1",
            name: "AI Model Performance",
            description: "Machine learning models may not achieve desired accuracy",
            impact: "medium",
            probability: "low",
            mitigation: "Have fallback rule-based systems ready",
            status: "identified",
          },
        ],
        dependencies: ["phase-3"],
      },
      {
        id: "phase-5",
        name: "Compliance and Security",
        duration: "3 months",
        status: "planned",
        progress: 0,
        budget: 400000,
        budgetUsed: 0,
        startDate: "2025-08-01",
        endDate: "2025-10-31",
        milestones: [
          {
            id: "m5-1",
            name: "Regulatory Compliance Suite",
            description: "Complete GDPR and SOC 2 compliance implementation",
            dueDate: "2025-09-30",
            status: "pending",
            deliverables: ["GDPR tools", "SOC 2 monitoring", "Compliance reporting"],
            assignee: "Compliance Officer",
          },
          {
            id: "m5-2",
            name: "Advanced Data Protection",
            description: "Enterprise-grade data protection and disaster recovery",
            dueDate: "2025-10-31",
            status: "pending",
            deliverables: ["Encryption system", "DLP implementation", "Disaster recovery"],
            assignee: "Security Engineer",
          },
        ],
        risks: [
          {
            id: "r5-1",
            name: "Compliance Requirements Change",
            description: "Regulatory requirements may change during development",
            impact: "high",
            probability: "low",
            mitigation: "Stay updated with regulatory changes and build flexible systems",
            status: "identified",
          },
        ],
        dependencies: ["phase-4"],
      },
      {
        id: "phase-6",
        name: "Testing and Optimization",
        duration: "2 months",
        status: "planned",
        progress: 0,
        budget: 200000,
        budgetUsed: 0,
        startDate: "2025-11-01",
        endDate: "2025-12-31",
        milestones: [
          {
            id: "m6-1",
            name: "Comprehensive Testing Complete",
            description: "All testing phases completed with 95% code coverage",
            dueDate: "2025-11-30",
            status: "pending",
            deliverables: ["Test reports", "Performance benchmarks", "Security assessment"],
            assignee: "QA Team Lead",
          },
          {
            id: "m6-2",
            name: "Performance Optimization Complete",
            description: "System optimized to meet all performance targets",
            dueDate: "2025-12-31",
            status: "pending",
            deliverables: ["Performance report", "Optimization recommendations", "Monitoring setup"],
            assignee: "Performance Engineer",
          },
        ],
        risks: [
          {
            id: "r6-1",
            name: "Performance Issues Discovery",
            description: "Critical performance issues may be discovered late",
            impact: "high",
            probability: "low",
            mitigation: "Continuous performance monitoring throughout development",
            status: "identified",
          },
        ],
        dependencies: ["phase-5"],
      },
      {
        id: "phase-7",
        name: "Launch and Monitor",
        duration: "1 month",
        status: "planned",
        progress: 0,
        budget: 120000,
        budgetUsed: 0,
        startDate: "2026-01-01",
        endDate: "2026-01-31",
        milestones: [
          {
            id: "m7-1",
            name: "Production Deployment",
            description: "Zero-downtime deployment to production environment",
            dueDate: "2026-01-15",
            status: "pending",
            deliverables: ["Production deployment", "Monitoring setup", "Documentation"],
            assignee: "DevOps Team Lead",
          },
          {
            id: "m7-2",
            name: "Post-Launch Monitoring",
            description: "Initial monitoring and optimization period",
            dueDate: "2026-01-31",
            status: "pending",
            deliverables: ["Monitoring reports", "User feedback", "Optimization plan"],
            assignee: "Project Manager",
          },
        ],
        risks: [
          {
            id: "r7-1",
            name: "Production Issues",
            description: "Unexpected issues may arise in production environment",
            impact: "critical",
            probability: "low",
            mitigation: "Comprehensive pre-production testing and rollback procedures",
            status: "identified",
          },
        ],
        dependencies: ["phase-6"],
      },
    ]
  }

  getPhaseById(id: string): TransformationPhase | undefined {
    return this.phases.find((phase) => phase.id === id)
  }

  getAllPhases(): TransformationPhase[] {
    return this.phases
  }

  getPhaseProgress(): { completed: number; inProgress: number; planned: number } {
    const completed = this.phases.filter((p) => p.status === "completed").length
    const inProgress = this.phases.filter((p) => p.status === "in-progress").length
    const planned = this.phases.filter((p) => p.status === "planned").length

    return { completed, inProgress, planned }
  }

  getTotalBudget(): { allocated: number; used: number; remaining: number } {
    const allocated = this.phases.reduce((sum, phase) => sum + phase.budget, 0)
    const used = this.phases.reduce((sum, phase) => sum + phase.budgetUsed, 0)
    const remaining = allocated - used

    return { allocated, used, remaining }
  }

  getCriticalRisks(): Risk[] {
    return this.phases
      .flatMap((phase) => phase.risks)
      .filter((risk) => risk.impact === "critical" && risk.status !== "resolved")
  }

  getUpcomingMilestones(days = 30): Milestone[] {
    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + days)

    return this.phases
      .flatMap((phase) => phase.milestones)
      .filter((milestone) => {
        const dueDate = new Date(milestone.dueDate)
        return dueDate >= today && dueDate <= futureDate && milestone.status !== "completed"
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }

  updatePhaseProgress(phaseId: string, progress: number) {
    const phase = this.getPhaseById(phaseId)
    if (phase) {
      phase.progress = Math.max(0, Math.min(100, progress))
      if (progress >= 100) {
        phase.status = "completed"
      } else if (progress > 0) {
        phase.status = "in-progress"
      }
    }
  }

  updateMilestoneStatus(milestoneId: string, status: Milestone["status"]) {
    for (const phase of this.phases) {
      const milestone = phase.milestones.find((m) => m.id === milestoneId)
      if (milestone) {
        milestone.status = status
        break
      }
    }
  }

  addRisk(phaseId: string, risk: Omit<Risk, "id">) {
    const phase = this.getPhaseById(phaseId)
    if (phase) {
      const newRisk: Risk = {
        ...risk,
        id: `r${phaseId}-${Date.now()}`,
      }
      phase.risks.push(newRisk)
    }
  }

  updateRiskStatus(riskId: string, status: Risk["status"]) {
    for (const phase of this.phases) {
      const risk = phase.risks.find((r) => r.id === riskId)
      if (risk) {
        risk.status = status
        break
      }
    }
  }

  generateProgressReport(): string {
    const progress = this.getPhaseProgress()
    const budget = this.getTotalBudget()
    const criticalRisks = this.getCriticalRisks()
    const upcomingMilestones = this.getUpcomingMilestones()

    return `
# Enterprise Transformation Progress Report
Generated: ${new Date().toISOString()}

## Overall Progress
- Completed Phases: ${progress.completed}/7 (${Math.round((progress.completed / 7) * 100)}%)
- In Progress: ${progress.inProgress} phases
- Planned: ${progress.planned} phases

## Budget Status
- Total Allocated: $${budget.allocated.toLocaleString()}
- Used to Date: $${budget.used.toLocaleString()} (${Math.round((budget.used / budget.allocated) * 100)}%)
- Remaining: $${budget.remaining.toLocaleString()}

## Critical Risks
${criticalRisks.length === 0 ? "No critical risks identified" : criticalRisks.map((risk) => `- ${risk.name}: ${risk.description}`).join("\n")}

## Upcoming Milestones (Next 30 Days)
${upcomingMilestones.length === 0 ? "No upcoming milestones" : upcomingMilestones.map((milestone) => `- ${milestone.name} (Due: ${milestone.dueDate})`).join("\n")}

## Phase Details
${this.phases
  .map(
    (phase) => `
### ${phase.name}
- Status: ${phase.status}
- Progress: ${phase.progress}%
- Budget Used: $${phase.budgetUsed.toLocaleString()}/$${phase.budget.toLocaleString()}
- Duration: ${phase.duration}
- Milestones: ${phase.milestones.filter((m) => m.status === "completed").length}/${phase.milestones.length} completed
`,
  )
  .join("\n")}
    `
  }
}

export const transformationTracker = new TransformationTracker()
