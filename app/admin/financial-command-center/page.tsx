import { Metadata } from 'next'
import FinancialCommandCenter from '@/components/admin/financial-command-center'

export const metadata: Metadata = {
  title: 'Financial Command Center - Admin Dashboard',
  description: 'Comprehensive financial reporting, analytics, and forecasting',
}

export default function FinancialCommandCenterPage() {
  return <FinancialCommandCenter />
}
