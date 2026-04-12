import type { Metadata } from "next"
import TestimonialsClient from "@/components/TestimonialsClient"

export const metadata: Metadata = {
  title: "Customer Testimonials - Nexural Trading",
  description: "Read success stories from our customers who are achieving exceptional results with our AI-powered trading platform.",
  keywords: ["testimonials", "customer reviews", "success stories", "trading results", "algorithmic trading"],
}

export default function TestimonialsPage() {
  return <TestimonialsClient />
}


