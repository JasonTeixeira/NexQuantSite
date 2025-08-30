import { Metadata } from 'next'
import VideoManager from '@/components/admin/lms/video-manager'

export const metadata: Metadata = {
  title: 'Video Manager | LMS Admin',
  description: 'Upload, process, and manage educational video content',
}

export default function VideoManagerPage() {
  return <VideoManager />
}

