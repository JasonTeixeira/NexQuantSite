import { Metadata } from 'next'
import APIGatewayManagement from '@/components/admin/api-gateway-management'

export const metadata: Metadata = {
  title: 'API Gateway Management - Admin Dashboard',
  description: 'Advanced API gateway with monitoring, security, rate limiting, and comprehensive management',
}

export default function APIManagementPage() {
  return <APIGatewayManagement />
}