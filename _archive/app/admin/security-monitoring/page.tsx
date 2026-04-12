import { Metadata } from 'next'
import SecurityMonitoringDashboard from '@/components/admin/security-monitoring-dashboard'

export const metadata: Metadata = {
  title: 'Security Monitoring - Admin Dashboard',
  description: 'Advanced threat detection and fraud prevention',
}

export default function SecurityMonitoringPage() {
  return <SecurityMonitoringDashboard />
}
