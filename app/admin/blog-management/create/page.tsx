import { Metadata } from 'next'
import AdminBlogCreateClient from '@/components/admin/admin-blog-create-client'

export const metadata: Metadata = {
  title: 'Create Blog Post - Admin Dashboard',
  description: 'Create a new blog post',
}

export default function AdminBlogCreatePage() {
  return <AdminBlogCreateClient />
}
