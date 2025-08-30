import { Metadata } from 'next'
import AdminSettingsClient from '@/components/admin/admin-settings-client'

export const metadata: Metadata = {
  title: 'Platform Settings - Admin Dashboard',
  description: 'Configure platform settings and preferences',
}

export default function AdminSettingsPage() {
  return <AdminSettingsClient />
}
