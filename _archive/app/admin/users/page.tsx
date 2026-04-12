import { Metadata } from 'next'
import AdminUsersClient from '@/components/admin/admin-users-client'

export const metadata: Metadata = {
  title: 'User Management - Admin Dashboard',
  description: 'Manage platform users and subscriptions',
}

export default function AdminUsersPage() {
  return <AdminUsersClient />
}
