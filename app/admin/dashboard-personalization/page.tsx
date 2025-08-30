import { Metadata } from 'next'
import DashboardPersonalization from '@/components/admin/dashboard-personalization'

export const metadata: Metadata = {
  title: 'Dashboard Personalization - Admin Dashboard',
  description: 'Customize your dashboard with drag-and-drop widgets and personal layouts',
}

export default function DashboardPersonalizationPage() {
  return <DashboardPersonalization />
}
