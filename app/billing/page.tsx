import { Metadata } from 'next'
import BillingPageClient from '@/components/billing-page-client'

export const metadata: Metadata = {
  title: 'Billing - NEXURAL',
  description: 'Manage your subscription and billing information',
}

export default function BillingPage() {
  return <BillingPageClient />
}
