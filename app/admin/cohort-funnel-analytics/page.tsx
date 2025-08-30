import { Metadata } from 'next'
import CohortFunnelAnalytics from '@/components/admin/cohort-funnel-analytics'

export const metadata: Metadata = {
  title: 'Cohort & Funnel Analytics - Admin Dashboard',
  description: 'Advanced user behavior and conversion analysis',
}

export default function CohortFunnelAnalyticsPage() {
  return <CohortFunnelAnalytics />
}
