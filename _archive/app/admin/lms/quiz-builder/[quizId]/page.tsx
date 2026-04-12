import { Metadata } from 'next'
import QuizBuilder from '@/components/admin/lms/quiz-builder'

export const metadata: Metadata = {
  title: 'Edit Quiz | LMS Admin',
  description: 'Edit and update quiz content and settings',
}

interface QuizBuilderEditPageProps {
  params: {
    quizId: string
  }
}

export default function QuizBuilderEditPage({ params }: QuizBuilderEditPageProps) {
  return <QuizBuilder quizId={params.quizId} />
}

