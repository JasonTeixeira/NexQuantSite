import { Metadata } from 'next'
import ABTestingDashboard from '@/components/admin/ab-testing-dashboard'

export const metadata: Metadata = {
  title: 'A/B Testing - Admin Dashboard',
  description: 'Optimize conversions with data-driven A/B testing',
}

export default function ABTestingPage() {
  return <ABTestingDashboard />
}
