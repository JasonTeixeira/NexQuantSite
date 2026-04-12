import GlossaryPageClient from "@/components/GlossaryPageClient"
import { glossaryTerms, workshopTechniques, bestPractices } from "@/lib/glossary-data"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Trading Knowledge Base - Nexural",
  description:
    "Master the language and techniques of quantitative trading with our comprehensive glossary and workshop.",
}

export default function GlossaryPage() {
  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(#00ff41_1px,transparent_1px)] [background-size:50px_50px]"></div>
      </div>
      <div className="fixed top-[-300px] right-[-300px] w-[600px] h-[600px] bg-primary/30 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="fixed bottom-[-200px] left-[-200px] w-[400px] h-[400px] bg-blue-500/30 rounded-full filter blur-3xl opacity-30 animate-pulse animation-delay-4000"></div>

      <div className="relative z-10">
        <GlossaryPageClient terms={glossaryTerms} techniques={workshopTechniques} practices={bestPractices} />
      </div>
    </div>
  )
}
