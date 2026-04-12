import { Metadata } from 'next'
import PerformanceCommandCenter from '@/components/admin/performance-command-center'

export const metadata: Metadata = {
  title: 'Performance Command Center - Admin Dashboard',
  description: 'Comprehensive system, application, and user experience monitoring',
}

export default function PerformanceCommandCenterPage() {
  return <PerformanceCommandCenter />
}
