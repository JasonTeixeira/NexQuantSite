import { Metadata } from 'next'
import LearningPathsManager from '@/components/admin/lms/learning-paths'

export const metadata: Metadata = {
  title: 'Learning Paths & Recommendations | LMS Admin',
  description: 'AI-powered personalized learning journeys and intelligent course recommendations',
}

export default function LearningPathsPage() {
  return <LearningPathsManager />
}

