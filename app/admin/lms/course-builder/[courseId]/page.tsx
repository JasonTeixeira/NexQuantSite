import { Metadata } from 'next'
import CourseBuilder from '@/components/admin/lms/course-builder'

export const metadata: Metadata = {
  title: 'Edit Course | LMS Admin',
  description: 'Edit and update educational course content',
}

interface CourseBuilderEditPageProps {
  params: {
    courseId: string
  }
}

export default function CourseBuilderEditPage({ params }: CourseBuilderEditPageProps) {
  return <CourseBuilder courseId={params.courseId} />
}

