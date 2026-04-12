import type { Metadata } from "next"
import EnhancedLearningInterface from "@/components/enhanced-learning-interface"

export const metadata: Metadata = {
  title: "Trading Education - Learn to Trade | Nexural",
  description: "Master algorithmic trading with our comprehensive courses, tutorials, and expert-led training programs.",
}

export default function LearningPage() {
  return (
    <div className="min-h-screen text-white overflow-x-hidden">
      <EnhancedLearningInterface />
    </div>
  )
}
