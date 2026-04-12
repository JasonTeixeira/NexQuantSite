import type { Metadata } from "next"
import { JobsPageClient } from "@/components/jobs-page-client"

export const metadata: Metadata = {
  title: "Careers - Join Nexural Trading | Quantitative Trading Jobs",
  description:
    "Join our elite team of quantitative traders, AI engineers, and fintech innovators. Explore exciting career opportunities at Nexural Trading with competitive compensation and cutting-edge technology.",
  keywords:
    "careers, jobs, quantitative trading, AI engineering, fintech careers, trading technology, machine learning jobs, financial technology",
}

export default function JobsPage() {
  return <JobsPageClient />
}
