import { Metadata } from 'next'
import LearningAnalyticsDashboard from '@/components/admin/lms/learning-analytics'

export const metadata: Metadata = {
  title: 'Learning Analytics | LMS Admin',
  description: 'Advanced AI-powered insights and predictive analytics for your learning platform',
}

export default function LearningAnalyticsPage() {
  return <LearningAnalyticsDashboard />
}

