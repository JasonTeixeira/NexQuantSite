import { Suspense } from 'react'
import CheckoutPageClient from '@/components/checkout-page-client'

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutPageClient />
    </Suspense>
  )
}
