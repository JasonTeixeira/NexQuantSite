import { Metadata } from 'next'
import UnifiedAnalyticsHub from '@/components/admin/unified-analytics-hub'

export const metadata: Metadata = {
  title: 'Unified Analytics Hub - Admin Dashboard',
  description: 'Comprehensive analytics, insights, and business intelligence',
}

export default function UnifiedAnalyticsPage() {
  return <UnifiedAnalyticsHub />
}
