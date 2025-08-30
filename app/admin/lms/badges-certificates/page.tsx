import { Metadata } from 'next'
import BadgesCertificatesManager from '@/components/admin/lms/badges-certificates'

export const metadata: Metadata = {
  title: 'Badges & Certificates | LMS Admin',
  description: 'Create and manage gamification rewards, badges, and professional certificates',
}

export default function BadgesCertificatesPage() {
  return <BadgesCertificatesManager />
}

