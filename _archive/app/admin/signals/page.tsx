import { Metadata } from 'next'
import AdminSignalsClient from '@/components/admin/admin-signals-client'

export const metadata: Metadata = {
  title: 'Signal Management - Admin Dashboard',
  description: 'Manage trading signals and bots',
}

export default function AdminSignalsPage() {
  return <AdminSignalsClient />
}
