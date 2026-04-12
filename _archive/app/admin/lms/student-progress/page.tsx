import { Metadata } from 'next'
import StudentProgressDashboard from '@/components/admin/lms/student-progress'

export const metadata: Metadata = {
  title: 'Student Progress Dashboard | LMS Admin',
  description: 'Advanced analytics and insights into student performance and engagement',
}

export default function StudentProgressPage() {
  return <StudentProgressDashboard />
}

