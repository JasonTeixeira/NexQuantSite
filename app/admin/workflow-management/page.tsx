import { Metadata } from 'next'
import WorkflowManagementSystem from '@/components/admin/workflow-management-system'

export const metadata: Metadata = {
  title: 'Workflow Management - Admin Dashboard',
  description: 'Create, manage, and monitor automated workflows with visual builder',
}

export default function WorkflowManagementPage() {
  return <WorkflowManagementSystem />
}
