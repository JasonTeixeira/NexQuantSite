import { Metadata } from 'next'
import QuizBuilder from '@/components/admin/lms/quiz-builder'

export const metadata: Metadata = {
  title: 'Quiz Builder | LMS Admin',
  description: 'Create and manage interactive quizzes and assessments',
}

export default function QuizBuilderPage() {
  return <QuizBuilder />
}

