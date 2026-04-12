import { Metadata } from 'next'
import CourseBuilder from '@/components/admin/lms/course-builder'

export const metadata: Metadata = {
  title: 'Course Builder | LMS Admin',
  description: 'Create and manage educational courses with our professional course builder',
}

export default function CourseBuilderPage() {
  return <CourseBuilder />
}

