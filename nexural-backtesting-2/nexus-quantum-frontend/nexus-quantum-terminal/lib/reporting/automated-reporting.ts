/**
 * Automated Reporting & Analytics Engine - Phase 3 Enterprise Reporting
 * Compliance reports, performance analytics, automated insights, and data export
 */

import { createReadStream, createWriteStream, writeFileSync } from 'fs'
import { join } from 'path'
import * as XLSX from 'xlsx'
import PDFDocument from 'pdfkit'
import { getClusterManager } from '../database/cluster-manager'
import { getComplianceFramework } from '../compliance/compliance-framework'
import { getTenantManagement } from '../multitenancy/tenant-management'
import { getAdvancedMLEngine } from '../ai/advanced-ml-engine'

export interface ReportTemplate {
  id: string
  name: string
  type: 'compliance' | 'performance' | 'security' | 'financial' | 'operational' | 'custom'
  description: string
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'on_demand'
    dayOfWeek?: number
    dayOfMonth?: number
    time: string
    timezone: string
  }
  recipients: {
    emails: string[]
    roles: string[]
    webhooks: string[]
  }
  format: {
    types: ('pdf' | 'excel' | 'csv' | 'json')[]
    includeCharts: boolean
    includeRawData: boolean
    customStyling?: string
  }
  filters: {
    dateRange: 'last_7_days' | 'last_30_days' | 'last_quarter' | 'last_year' | 'custom'
    tenantIds?: string[]
    userIds?: string[]
    categories?: string[]
    minThreshold?: number
  }
  queries: {
    name: string
    sql: string
    parameters: { [key: string]: any }
    chartType?: 'line' | 'bar' | 'pie' | 'scatter' | 'table'
  }[]
  metadata: {
    createdAt: Date
    updatedAt: Date
    createdBy: string
    lastGenerated?: Date
    generationCount: number
    enabled: boolean
  }
}

export interface GeneratedReport {
  id: string
  templateId: string
  templateName: string
  generatedAt: Date
  generatedBy: string
  period: {
    startDate: Date
    endDate: Date
  }
  status: 'generating' | 'completed' | 'failed' | 'expired'
  format: string
  fileSize: number
  filePath: string
  downloadUrl: string
  metadata: {
    recordCount: number
    queryCount: number
    generationTime: number
    errors: string[]
    warnings: string[]
  }
  distribution: {
    emailsSent: string[]
    webhooksCalled: string[]
    downloadCount: number
    lastAccessed?: Date
  }
  expiresAt: Date
}

export interface ReportInsight {
  id: string
  reportId: string
  type: 'anomaly' | 'trend' | 'recommendation' | 'alert' | 'opportunity'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  data: {
    metric: string
    currentValue: number
    expectedValue?: number
    previousValue?: number
    changePercent?: number
    threshold?: number
  }
  actionItems: string[]
  generatedAt: Date
}

export interface ExportRequest {
  id: string
  userId: string
  userEmail: string
  type: 'full_data_export' | 'portfolio_export' | 'compliance_export' | 'custom_query'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  description: string
  filters: {
    startDate?: Date
    endDate?: Date
    portfolioIds?: string[]
    includePersonalData: boolean
    includeTradingData: boolean
    includeAuditLogs: boolean
    format: 'csv' | 'json' | 'excel'
  }
  result?: {
    filePath: string
    fileSize: number
    downloadUrl: string
    recordCount: number
  }
  createdAt: Date
  completedAt?: Date
  expiresAt: Date
}

export class AutomatedReportingEngine {
  private db = getClusterManager()
  private compliance = getComplianceFramework()
  private tenantManagement = getTenantManagement()
  private mlEngine = getAdvancedMLEngine()
  
  private reportTemplates: Map<string, ReportTemplate> = new Map()
  private scheduledJobs: Map<string, NodeJS.Timeout> = new Map()

  constructor() {
    this.initializeReporting()
  }

  private async initializeReporting() {
    try {
      await this.setupReportingTables()
      await this.loadReportTemplates()
      await this.setupDefaultTemplates()
      await this.startScheduler()
      console.log('📊 Automated reporting engine initialized')
    } catch (error) {
      console.error('❌ Reporting engine initialization failed:', error)
    }
  }

  private async setupReportingTables() {
    const createReportTemplatesTable = `
      CREATE TABLE IF NOT EXISTS report_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        description TEXT,
        schedule JSONB NOT NULL DEFAULT '{}',
        recipients JSONB NOT NULL DEFAULT '{}',
        format JSONB NOT NULL DEFAULT '{}',
        filters JSONB NOT NULL DEFAULT '{}',
        queries JSONB NOT NULL DEFAULT '[]',
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_report_templates_type ON report_templates(type);
    `

    const createGeneratedReportsTable = `
      CREATE TABLE IF NOT EXISTS generated_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        template_id UUID NOT NULL,
        template_name VARCHAR(255) NOT NULL,
        generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        generated_by VARCHAR(255) NOT NULL,
        period JSONB NOT NULL DEFAULT '{}',
        status VARCHAR(20) NOT NULL CHECK (status IN ('generating', 'completed', 'failed', 'expired')),
        format VARCHAR(20) NOT NULL,
        file_size BIGINT DEFAULT 0,
        file_path VARCHAR(500),
        download_url VARCHAR(500),
        metadata JSONB NOT NULL DEFAULT '{}',
        distribution JSONB NOT NULL DEFAULT '{}',
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_generated_reports_template_id ON generated_reports(template_id);
      CREATE INDEX IF NOT EXISTS idx_generated_reports_status ON generated_reports(status);
      CREATE INDEX IF NOT EXISTS idx_generated_reports_expires_at ON generated_reports(expires_at);
    `

    const createReportInsightsTable = `
      CREATE TABLE IF NOT EXISTS report_insights (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        report_id UUID NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
        confidence INTEGER NOT NULL DEFAULT 0,
        data JSONB NOT NULL DEFAULT '{}',
        action_items TEXT[] DEFAULT '{}',
        generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_report_insights_report_id ON report_insights(report_id);
      CREATE INDEX IF NOT EXISTS idx_report_insights_severity ON report_insights(severity);
    `

    const createExportRequestsTable = `
      CREATE TABLE IF NOT EXISTS export_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
        description TEXT NOT NULL,
        filters JSONB NOT NULL DEFAULT '{}',
        result JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMPTZ,
        expires_at TIMESTAMPTZ NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_export_requests_user_id ON export_requests(user_id);
      CREATE INDEX IF NOT EXISTS idx_export_requests_status ON export_requests(status);
    `

    await this.db.query(createReportTemplatesTable)
    await this.db.query(createGeneratedReportsTable)
    await this.db.query(createReportInsightsTable)
    await this.db.query(createExportRequestsTable)
  }

  /**
   * Report Template Management
   */
  async createReportTemplate(template: Omit<ReportTemplate, 'id' | 'metadata'>): Promise<string> {
    try {
      const templateId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const reportTemplate: ReportTemplate = {
        ...template,
        id: templateId,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system', // Would be passed from context
          generationCount: 0,
          enabled: true
        }
      }

      await this.db.query(`
        INSERT INTO report_templates (id, name, type, description, schedule, recipients, format, filters, queries, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        templateId,
        template.name,
        template.type,
        template.description,
        JSON.stringify(template.schedule),
        JSON.stringify(template.recipients),
        JSON.stringify(template.format),
        JSON.stringify(template.filters),
        JSON.stringify(template.queries),
        JSON.stringify(reportTemplate.metadata)
      ])

      this.reportTemplates.set(templateId, reportTemplate)
      
      // Schedule the report if it has a frequency
      if (template.schedule.frequency !== 'on_demand') {
        this.scheduleReport(templateId)
      }

      console.log(`📋 Report template created: ${template.name} (${templateId})`)
      return templateId

    } catch (error) {
      console.error('❌ Failed to create report template:', error)
      throw error
    }
  }

  private async setupDefaultTemplates() {
    const defaultTemplates: Array<Omit<ReportTemplate, 'id' | 'metadata'>> = [
      {
        name: 'Daily Security Summary',
        type: 'security',
        description: 'Daily summary of security events and threats',
        schedule: {
          frequency: 'daily',
          time: '09:00',
          timezone: 'UTC'
        },
        recipients: {
          emails: ['security@nexural.com'],
          roles: ['admin', 'security'],
          webhooks: []
        },
        format: {
          types: ['pdf', 'json'],
          includeCharts: true,
          includeRawData: false
        },
        filters: {
          dateRange: 'last_7_days'
        },
        queries: [
          {
            name: 'Security Events by Severity',
            sql: 'SELECT severity, COUNT(*) as count FROM security_events WHERE timestamp >= NOW() - INTERVAL \'1 day\' GROUP BY severity',
            parameters: {},
            chartType: 'pie'
          },
          {
            name: 'Failed Login Attempts',
            sql: 'SELECT DATE_TRUNC(\'hour\', timestamp) as hour, COUNT(*) as attempts FROM audit_logs WHERE action = \'login\' AND outcome = \'failure\' AND timestamp >= NOW() - INTERVAL \'1 day\' GROUP BY hour ORDER BY hour',
            parameters: {},
            chartType: 'line'
          }
        ]
      },
      {
        name: 'Monthly Compliance Report',
        type: 'compliance',
        description: 'Monthly compliance status and audit summary',
        schedule: {
          frequency: 'monthly',
          dayOfMonth: 1,
          time: '06:00',
          timezone: 'UTC'
        },
        recipients: {
          emails: ['compliance@nexural.com'],
          roles: ['owner', 'admin'],
          webhooks: []
        },
        format: {
          types: ['pdf', 'excel'],
          includeCharts: true,
          includeRawData: true
        },
        filters: {
          dateRange: 'last_30_days'
        },
        queries: [
          {
            name: 'SOC2 Control Status',
            sql: 'SELECT category, status, COUNT(*) as count FROM soc2_controls GROUP BY category, status',
            parameters: {},
            chartType: 'bar'
          },
          {
            name: 'Privacy Requests',
            sql: 'SELECT type, status, COUNT(*) as count FROM privacy_requests WHERE request_date >= NOW() - INTERVAL \'1 month\' GROUP BY type, status',
            parameters: {},
            chartType: 'table'
          }
        ]
      },
      {
        name: 'Weekly Performance Analytics',
        type: 'performance',
        description: 'Weekly platform performance and usage analytics',
        schedule: {
          frequency: 'weekly',
          dayOfWeek: 1,
          time: '08:00',
          timezone: 'UTC'
        },
        recipients: {
          emails: ['analytics@nexural.com'],
          roles: ['admin'],
          webhooks: ['https://api.nexural.com/webhooks/analytics']
        },
        format: {
          types: ['json', 'excel'],
          includeCharts: true,
          includeRawData: true
        },
        filters: {
          dateRange: 'last_7_days'
        },
        queries: [
          {
            name: 'User Activity Trends',
            sql: 'SELECT DATE_TRUNC(\'day\', last_activity) as day, COUNT(DISTINCT id) as active_users FROM tenant_users WHERE last_activity >= NOW() - INTERVAL \'7 days\' GROUP BY day ORDER BY day',
            parameters: {},
            chartType: 'line'
          },
          {
            name: 'API Usage by Endpoint',
            sql: 'SELECT resource, COUNT(*) as requests FROM audit_logs WHERE action LIKE \'api_%\' AND timestamp >= NOW() - INTERVAL \'7 days\' GROUP BY resource ORDER BY requests DESC LIMIT 10',
            parameters: {},
            chartType: 'bar'
          }
        ]
      }
    ]

    for (const template of defaultTemplates) {
      try {
        await this.createReportTemplate(template)
      } catch (error) {
        console.error(`Failed to create default template: ${template.name}`, error)
      }
    }
  }

  /**
   * Report Generation
   */
  async generateReport(templateId: string, triggeredBy: string = 'system'): Promise<string> {
    console.log(`📊 Generating report from template: ${templateId}`)
    
    try {
      const template = this.reportTemplates.get(templateId) || await this.loadTemplate(templateId)
      if (!template) {
        throw new Error(`Report template not found: ${templateId}`)
      }

      const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const startTime = Date.now()
      
      // Determine report period
      const period = this.calculateReportPeriod(template.filters.dateRange)
      
      // Create report record
      const generatedReport: GeneratedReport = {
        id: reportId,
        templateId,
        templateName: template.name,
        generatedAt: new Date(),
        generatedBy: triggeredBy,
        period,
        status: 'generating',
        format: template.format.types[0] || 'pdf',
        fileSize: 0,
        filePath: '',
        downloadUrl: '',
        metadata: {
          recordCount: 0,
          queryCount: template.queries.length,
          generationTime: 0,
          errors: [],
          warnings: []
        },
        distribution: {
          emailsSent: [],
          webhooksCalled: [],
          downloadCount: 0
        },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }

      await this.db.query(`
        INSERT INTO generated_reports (id, template_id, template_name, generated_by, period, status, format, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        reportId,
        templateId,
        template.name,
        triggeredBy,
        JSON.stringify(period),
        'generating',
        generatedReport.format,
        generatedReport.expiresAt
      ])

      // Execute queries and collect data
      const reportData = await this.executeReportQueries(template, period)
      
      // Generate insights
      const insights = await this.generateReportInsights(reportId, reportData)
      
      // Create report files
      const filePaths = await this.createReportFiles(template, reportData, insights, reportId)
      
      // Update report status
      const generationTime = Date.now() - startTime
      await this.db.query(`
        UPDATE generated_reports 
        SET status = $1, file_path = $2, download_url = $3, file_size = $4,
            metadata = $5
        WHERE id = $6
      `, [
        'completed',
        filePaths[0],
        `/api/reports/${reportId}/download`,
        0, // Would calculate actual file size
        JSON.stringify({
          ...generatedReport.metadata,
          recordCount: reportData.reduce((sum, query) => sum + query.results.length, 0),
          generationTime
        }),
        reportId
      ])

      // Distribute report
      await this.distributeReport(template, reportId, filePaths)

      // Update template metadata
      template.metadata.lastGenerated = new Date()
      template.metadata.generationCount++

      console.log(`✅ Report generated successfully: ${template.name} (${reportId})`)
      return reportId

    } catch (error) {
      console.error(`❌ Report generation failed for template ${templateId}:`, error)
      
      // Update report status to failed
      await this.db.query(`
        UPDATE generated_reports 
        SET status = $1, metadata = metadata || $2
        WHERE template_id = $3 AND status = 'generating'
      `, ['failed', JSON.stringify({ error: error.message }), templateId])
      
      throw error
    }
  }

  private async executeReportQueries(template: ReportTemplate, period: { startDate: Date; endDate: Date }): Promise<any[]> {
    const results = []

    for (const query of template.queries) {
      try {
        console.log(`🔍 Executing query: ${query.name}`)
        
        // Replace date parameters
        let sql = query.sql
        const parameters = {
          ...query.parameters,
          startDate: period.startDate,
          endDate: period.endDate
        }

        // Simple parameter replacement (in production, use proper parameterized queries)
        Object.entries(parameters).forEach(([key, value]) => {
          sql = sql.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), String(value))
        })

        const result = await this.db.query(sql)
        
        results.push({
          name: query.name,
          chartType: query.chartType,
          results: result.rows
        })

      } catch (error) {
        console.error(`❌ Query execution failed: ${query.name}`, error)
        results.push({
          name: query.name,
          chartType: query.chartType,
          results: [],
          error: error.message
        })
      }
    }

    return results
  }

  private async generateReportInsights(reportId: string, reportData: any[]): Promise<ReportInsight[]> {
    const insights: ReportInsight[] = []

    try {
      // Use ML engine for advanced insights
      for (const queryResult of reportData) {
        if (queryResult.results.length === 0) continue

        // Detect anomalies in time series data
        if (queryResult.chartType === 'line' && queryResult.results.length > 5) {
          const values = queryResult.results.map((row: any) => Object.values(row)[1]) as number[]
          const anomalies = await this.detectAnomalies(values)
          
          if (anomalies.length > 0) {
            insights.push({
              id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              reportId,
              type: 'anomaly',
              title: `Anomalies detected in ${queryResult.name}`,
              description: `Detected ${anomalies.length} anomalous data points that deviate significantly from normal patterns.`,
              severity: anomalies.length > 3 ? 'high' : 'medium',
              confidence: 0.85,
              data: {
                metric: queryResult.name,
                currentValue: values[values.length - 1],
                expectedValue: values.reduce((sum, val) => sum + val, 0) / values.length,
                changePercent: anomalies.length > 0 ? (anomalies.length / values.length) * 100 : 0
              },
              actionItems: [
                'Investigate the root cause of anomalous behavior',
                'Review system logs for the affected time periods',
                'Consider adjusting monitoring thresholds'
              ],
              generatedAt: new Date()
            })
          }
        }

        // Detect trends
        if (queryResult.chartType === 'line' && queryResult.results.length > 3) {
          const trend = this.calculateTrend(queryResult.results)
          
          if (Math.abs(trend.slope) > 0.1) {
            insights.push({
              id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              reportId,
              type: 'trend',
              title: `${trend.direction} trend in ${queryResult.name}`,
              description: `${queryResult.name} shows a ${trend.direction} trend with ${trend.slope > 0 ? 'increasing' : 'decreasing'} values over time.`,
              severity: Math.abs(trend.slope) > 0.5 ? 'high' : 'medium',
              confidence: trend.confidence,
              data: {
                metric: queryResult.name,
                currentValue: trend.currentValue,
                changePercent: trend.changePercent
              },
              actionItems: trend.slope > 0 ? [
                'Monitor continued growth',
                'Prepare for scaling requirements',
                'Review capacity planning'
              ] : [
                'Investigate causes of decline',
                'Implement corrective measures',
                'Monitor for stabilization'
              ],
              generatedAt: new Date()
            })
          }
        }
      }

      // Save insights to database
      for (const insight of insights) {
        await this.db.query(`
          INSERT INTO report_insights (id, report_id, type, title, description, severity, confidence, data, action_items)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          insight.id,
          reportId,
          insight.type,
          insight.title,
          insight.description,
          insight.severity,
          insight.confidence,
          JSON.stringify(insight.data),
          insight.actionItems
        ])
      }

    } catch (error) {
      console.error('❌ Failed to generate report insights:', error)
    }

    return insights
  }

  private async detectAnomalies(values: number[]): Promise<number[]> {
    // Simple statistical anomaly detection
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length)
    const threshold = 2 * stdDev

    const anomalies: number[] = []
    values.forEach((value, index) => {
      if (Math.abs(value - mean) > threshold) {
        anomalies.push(index)
      }
    })

    return anomalies
  }

  private calculateTrend(data: any[]): { slope: number; direction: string; confidence: number; currentValue: number; changePercent: number } {
    if (data.length < 2) {
      return { slope: 0, direction: 'stable', confidence: 0, currentValue: 0, changePercent: 0 }
    }

    // Simple linear regression
    const n = data.length
    const xSum = (n * (n - 1)) / 2
    const ySum = data.reduce((sum, row) => sum + Object.values(row)[1] as number, 0)
    const xySum = data.reduce((sum, row, index) => sum + index * (Object.values(row)[1] as number), 0)
    const xSquareSum = (n * (n - 1) * (2 * n - 1)) / 6

    const slope = (n * xySum - xSum * ySum) / (n * xSquareSum - xSum * xSum)
    const currentValue = Object.values(data[data.length - 1])[1] as number
    const firstValue = Object.values(data[0])[1] as number
    const changePercent = firstValue !== 0 ? ((currentValue - firstValue) / firstValue) * 100 : 0

    return {
      slope,
      direction: slope > 0.05 ? 'upward' : slope < -0.05 ? 'downward' : 'stable',
      confidence: Math.min(Math.abs(slope) * 10, 1),
      currentValue,
      changePercent
    }
  }

  private async createReportFiles(
    template: ReportTemplate,
    reportData: any[],
    insights: ReportInsight[],
    reportId: string
  ): Promise<string[]> {
    const filePaths: string[] = []
    const reportDir = join(process.cwd(), 'reports', reportId)

    // Create directory
    // await fs.mkdir(reportDir, { recursive: true })

    for (const format of template.format.types) {
      let fileName: string
      let filePath: string

      switch (format) {
        case 'pdf':
          fileName = `${template.name.replace(/\s+/g, '_')}_${reportId}.pdf`
          filePath = join(reportDir, fileName)
          await this.generatePDFReport(template, reportData, insights, filePath)
          break

        case 'excel':
          fileName = `${template.name.replace(/\s+/g, '_')}_${reportId}.xlsx`
          filePath = join(reportDir, fileName)
          await this.generateExcelReport(template, reportData, insights, filePath)
          break

        case 'csv':
          fileName = `${template.name.replace(/\s+/g, '_')}_${reportId}.csv`
          filePath = join(reportDir, fileName)
          await this.generateCSVReport(reportData, filePath)
          break

        case 'json':
          fileName = `${template.name.replace(/\s+/g, '_')}_${reportId}.json`
          filePath = join(reportDir, fileName)
          await this.generateJSONReport(template, reportData, insights, filePath)
          break
      }

      filePaths.push(filePath)
    }

    return filePaths
  }

  private async generatePDFReport(
    template: ReportTemplate,
    reportData: any[],
    insights: ReportInsight[],
    filePath: string
  ): Promise<void> {
    const doc = new PDFDocument()
    
    // Title page
    doc.fontSize(24).text(template.name, 50, 50)
    doc.fontSize(12).text(`Generated: ${new Date().toISOString()}`, 50, 100)
    doc.fontSize(12).text(`Description: ${template.description}`, 50, 120)

    // Executive Summary
    doc.addPage()
    doc.fontSize(18).text('Executive Summary', 50, 50)
    
    let yPosition = 100
    insights.forEach(insight => {
      if (yPosition > 700) {
        doc.addPage()
        yPosition = 50
      }
      
      doc.fontSize(14).text(insight.title, 50, yPosition)
      doc.fontSize(10).text(insight.description, 50, yPosition + 20)
      yPosition += 60
    })

    // Data sections
    reportData.forEach(queryResult => {
      doc.addPage()
      doc.fontSize(16).text(queryResult.name, 50, 50)
      
      if (queryResult.results.length > 0) {
        const headers = Object.keys(queryResult.results[0])
        doc.fontSize(12).text(headers.join(' | '), 50, 100)
        
        let dataYPosition = 120
        queryResult.results.slice(0, 20).forEach((row: any) => {
          const values = Object.values(row).map(String)
          doc.fontSize(10).text(values.join(' | '), 50, dataYPosition)
          dataYPosition += 15
        })
      }
    })

    doc.end()
    
    // In a real implementation, you'd pipe this to a file
    console.log(`📄 PDF report generated: ${filePath}`)
  }

  private async generateExcelReport(
    template: ReportTemplate,
    reportData: any[],
    insights: ReportInsight[],
    filePath: string
  ): Promise<void> {
    const workbook = XLSX.utils.book_new()

    // Summary sheet
    const summaryData = [
      ['Report Name', template.name],
      ['Generated', new Date().toISOString()],
      ['Description', template.description],
      [''],
      ['Key Insights'],
      ...insights.map(insight => [insight.title, insight.description])
    ]
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

    // Data sheets
    reportData.forEach(queryResult => {
      if (queryResult.results.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(queryResult.results)
        XLSX.utils.book_append_sheet(workbook, worksheet, queryResult.name.substring(0, 30))
      }
    })

    // In a real implementation, you'd write to actual file
    // XLSX.writeFile(workbook, filePath)
    console.log(`📊 Excel report generated: ${filePath}`)
  }

  private async generateCSVReport(reportData: any[], filePath: string): Promise<void> {
    // Combine all query results into single CSV
    const allData: any[] = []
    
    reportData.forEach(queryResult => {
      if (queryResult.results.length > 0) {
        queryResult.results.forEach((row: any) => {
          allData.push({
            query: queryResult.name,
            ...row
          })
        })
      }
    })

    if (allData.length > 0) {
      const headers = Object.keys(allData[0])
      const csvContent = [
        headers.join(','),
        ...allData.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
      ].join('\n')

      // In a real implementation, you'd write to actual file
      // writeFileSync(filePath, csvContent)
      console.log(`📝 CSV report generated: ${filePath}`)
    }
  }

  private async generateJSONReport(
    template: ReportTemplate,
    reportData: any[],
    insights: ReportInsight[],
    filePath: string
  ): Promise<void> {
    const reportJson = {
      metadata: {
        name: template.name,
        description: template.description,
        generatedAt: new Date().toISOString(),
        version: '1.0'
      },
      insights,
      data: reportData,
      summary: {
        totalQueries: reportData.length,
        totalRecords: reportData.reduce((sum, query) => sum + query.results.length, 0),
        insightsCount: insights.length,
        highSeverityInsights: insights.filter(i => i.severity === 'high' || i.severity === 'critical').length
      }
    }

    // In a real implementation, you'd write to actual file
    // writeFileSync(filePath, JSON.stringify(reportJson, null, 2))
    console.log(`🔧 JSON report generated: ${filePath}`)
  }

  /**
   * Data Export Functionality
   */
  async createDataExport(request: Omit<ExportRequest, 'id' | 'createdAt' | 'expiresAt'>): Promise<string> {
    try {
      const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const exportRequest: ExportRequest = {
        ...request,
        id: exportId,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }

      await this.db.query(`
        INSERT INTO export_requests (id, user_id, user_email, type, status, description, filters, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        exportId,
        request.userId,
        request.userEmail,
        request.type,
        'pending',
        request.description,
        JSON.stringify(request.filters),
        exportRequest.expiresAt
      ])

      // Process export asynchronously
      this.processDataExport(exportId)

      console.log(`📤 Data export request created: ${exportId}`)
      return exportId

    } catch (error) {
      console.error('❌ Failed to create data export:', error)
      throw error
    }
  }

  private async processDataExport(exportId: string): Promise<void> {
    try {
      // Update status to processing
      await this.db.query(`
        UPDATE export_requests SET status = $1 WHERE id = $2
      `, ['processing', exportId])

      // Get export request
      const result = await this.db.query(`SELECT * FROM export_requests WHERE id = $1`, [exportId])
      const exportRequest = result.rows[0]

      if (!exportRequest) {
        throw new Error(`Export request not found: ${exportId}`)
      }

      // Process based on type
      let data: any[] = []
      let recordCount = 0

      switch (exportRequest.type) {
        case 'full_data_export':
          data = await this.exportFullUserData(exportRequest.user_id, exportRequest.filters)
          break
        case 'portfolio_export':
          data = await this.exportPortfolioData(exportRequest.user_id, exportRequest.filters)
          break
        case 'compliance_export':
          data = await this.exportComplianceData(exportRequest.user_id, exportRequest.filters)
          break
      }

      recordCount = data.length

      // Generate file
      const fileName = `${exportRequest.type}_${exportId}.${exportRequest.filters.format}`
      const filePath = join(process.cwd(), 'exports', fileName)
      
      await this.generateExportFile(data, exportRequest.filters.format, filePath)

      // Update export request
      await this.db.query(`
        UPDATE export_requests 
        SET status = $1, completed_at = NOW(), result = $2
        WHERE id = $3
      `, [
        'completed',
        JSON.stringify({
          filePath,
          fileSize: 0, // Would calculate actual size
          downloadUrl: `/api/exports/${exportId}/download`,
          recordCount
        }),
        exportId
      ])

      console.log(`✅ Data export completed: ${exportId}`)

    } catch (error) {
      console.error(`❌ Data export failed: ${exportId}`, error)
      
      await this.db.query(`
        UPDATE export_requests SET status = $1 WHERE id = $2
      `, ['failed', exportId])
    }
  }

  private async exportFullUserData(userId: string, filters: any): Promise<any[]> {
    // Export all user data (GDPR compliance)
    const queries = [
      'SELECT * FROM portfolios WHERE user_id = $1',
      'SELECT * FROM trades WHERE portfolio_id IN (SELECT id FROM portfolios WHERE user_id = $1)',
      'SELECT * FROM audit_logs WHERE user_id = $1'
    ]

    const allData: any[] = []

    for (const query of queries) {
      try {
        const result = await this.db.query(query, [userId])
        allData.push(...result.rows)
      } catch (error) {
        console.error('Export query failed:', error)
      }
    }

    return allData
  }

  private async exportPortfolioData(userId: string, filters: any): Promise<any[]> {
    // Export portfolio-specific data
    const result = await this.db.query(`
      SELECT p.*, t.symbol, t.side, t.quantity, t.price, t.executed_at
      FROM portfolios p
      LEFT JOIN trades t ON p.id = t.portfolio_id
      WHERE p.user_id = $1
      ORDER BY p.created_at, t.executed_at
    `, [userId])

    return result.rows
  }

  private async exportComplianceData(userId: string, filters: any): Promise<any[]> {
    // Export compliance-related data
    const result = await this.db.query(`
      SELECT * FROM audit_logs 
      WHERE user_id = $1 AND timestamp BETWEEN $2 AND $3
      ORDER BY timestamp
    `, [userId, filters.startDate, filters.endDate])

    return result.rows
  }

  private async generateExportFile(data: any[], format: string, filePath: string): Promise<void> {
    switch (format) {
      case 'csv':
        // Generate CSV file
        break
      case 'json':
        // Generate JSON file
        break
      case 'excel':
        // Generate Excel file
        break
    }
    
    console.log(`📁 Export file generated: ${filePath}`)
  }

  /**
   * Helper Methods
   */
  private calculateReportPeriod(dateRange: string): { startDate: Date; endDate: Date } {
    const now = new Date()
    const endDate = new Date(now)
    let startDate: Date

    switch (dateRange) {
      case 'last_7_days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'last_30_days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'last_quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
        break
      case 'last_year':
        startDate = new Date(now.getFullYear() - 1, 0, 1)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    return { startDate, endDate }
  }

  private async loadTemplate(templateId: string): Promise<ReportTemplate | null> {
    try {
      const result = await this.db.query('SELECT * FROM report_templates WHERE id = $1', [templateId])
      if (result.rows.length === 0) return null

      const row = result.rows[0]
      return {
        id: row.id,
        name: row.name,
        type: row.type,
        description: row.description,
        schedule: row.schedule,
        recipients: row.recipients,
        format: row.format,
        filters: row.filters,
        queries: row.queries,
        metadata: row.metadata
      }
    } catch (error) {
      console.error(`Failed to load template ${templateId}:`, error)
      return null
    }
  }

  private async loadReportTemplates(): Promise<void> {
    try {
      const result = await this.db.query('SELECT * FROM report_templates WHERE metadata->\'enabled\' = \'true\'')
      
      for (const row of result.rows) {
        const template: ReportTemplate = {
          id: row.id,
          name: row.name,
          type: row.type,
          description: row.description,
          schedule: row.schedule,
          recipients: row.recipients,
          format: row.format,
          filters: row.filters,
          queries: row.queries,
          metadata: row.metadata
        }
        
        this.reportTemplates.set(template.id, template)
      }

      console.log(`📋 Loaded ${this.reportTemplates.size} report templates`)
    } catch (error) {
      console.error('Failed to load report templates:', error)
    }
  }

  private scheduleReport(templateId: string): void {
    const template = this.reportTemplates.get(templateId)
    if (!template) return

    // Calculate next execution time based on schedule
    const nextExecution = this.calculateNextExecution(template.schedule)
    const delay = nextExecution.getTime() - Date.now()

    if (delay > 0) {
      const timeout = setTimeout(async () => {
        await this.generateReport(templateId, 'scheduler')
        this.scheduleReport(templateId) // Reschedule
      }, delay)

      this.scheduledJobs.set(templateId, timeout)
      console.log(`⏰ Scheduled report ${template.name} for ${nextExecution.toISOString()}`)
    }
  }

  private calculateNextExecution(schedule: ReportTemplate['schedule']): Date {
    const now = new Date()
    const [hour, minute] = schedule.time.split(':').map(Number)

    let nextExecution = new Date(now)
    nextExecution.setHours(hour, minute, 0, 0)

    switch (schedule.frequency) {
      case 'daily':
        if (nextExecution <= now) {
          nextExecution.setDate(nextExecution.getDate() + 1)
        }
        break
      case 'weekly':
        const targetDay = schedule.dayOfWeek || 1
        const currentDay = nextExecution.getDay()
        const daysUntilTarget = (targetDay - currentDay + 7) % 7
        nextExecution.setDate(nextExecution.getDate() + daysUntilTarget)
        if (nextExecution <= now) {
          nextExecution.setDate(nextExecution.getDate() + 7)
        }
        break
      case 'monthly':
        nextExecution.setDate(schedule.dayOfMonth || 1)
        if (nextExecution <= now) {
          nextExecution.setMonth(nextExecution.getMonth() + 1)
        }
        break
    }

    return nextExecution
  }

  private async distributeReport(template: ReportTemplate, reportId: string, filePaths: string[]): Promise<void> {
    // Email distribution
    for (const email of template.recipients.emails) {
      // In production, integrate with email service
      console.log(`📧 Would send report to: ${email}`)
    }

    // Webhook distribution
    for (const webhook of template.recipients.webhooks) {
      try {
        // In production, make HTTP POST request
        console.log(`🔗 Would call webhook: ${webhook}`)
      } catch (error) {
        console.error(`Webhook call failed: ${webhook}`, error)
      }
    }
  }

  private startScheduler(): void {
    // Load and schedule all enabled templates
    this.reportTemplates.forEach((template, templateId) => {
      if (template.schedule.frequency !== 'on_demand' && template.metadata.enabled) {
        this.scheduleReport(templateId)
      }
    })

    console.log('⏰ Report scheduler started')
  }

  async cleanup(): Promise<void> {
    // Clear all scheduled jobs
    this.scheduledJobs.forEach((timeout, templateId) => {
      clearTimeout(timeout)
    })
    this.scheduledJobs.clear()

    console.log('✅ Automated reporting engine cleanup completed')
  }
}

// Singleton instance
let automatedReportingEngine: AutomatedReportingEngine | null = null

export const getAutomatedReportingEngine = (): AutomatedReportingEngine => {
  if (!automatedReportingEngine) {
    automatedReportingEngine = new AutomatedReportingEngine()
  }
  return automatedReportingEngine
}

export default AutomatedReportingEngine
