import { Metadata } from 'next'
import LMSDashboard from '@/components/admin/lms/lms-dashboard'

export const metadata: Metadata = {
  title: 'Learning Management System | Admin Dashboard',
  description: 'World-class LMS with advanced analytics, course management, and student progress tracking',
}

export default function LMSPage() {
  return <LMSDashboard />
}

