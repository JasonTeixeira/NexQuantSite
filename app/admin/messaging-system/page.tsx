import { Metadata } from 'next'
import MessagingSystemDashboard from '@/components/admin/messaging-system-dashboard'

export const metadata: Metadata = {
  title: 'Messaging System - Admin Dashboard',
  description: 'Communicate with users through multiple channels',
}

export default function MessagingSystemPage() {
  return <MessagingSystemDashboard />
}
