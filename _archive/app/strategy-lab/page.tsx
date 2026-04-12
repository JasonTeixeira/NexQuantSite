import StrategyLabClient from "@/components/strategy-lab-client"
import { ingredients, strategies } from "@/lib/strategy-lab-data"

export default function StrategyLabPage() {
  return (
    <div className="overflow-hidden relative pt-20">
      <div className="fixed top-0 left-0 w-full h-full bg-[url('/grid.svg')] bg-repeat -z-10 opacity-20 animate-grid-move" />
      <div className="fixed top-[-300px] right-[-300px] w-[600px] h-[600px] bg-strategy-green rounded-full filter blur-3xl opacity-30 -z-10 animate-float" />
      <div className="fixed bottom-[-200px] left-[-200px] w-[400px] h-[400px] bg-strategy-blue rounded-full filter blur-3xl opacity-30 -z-10 animate-float [animation-direction:reverse]" />
      <div className="fixed top-1/2 left-1/2 w-[500px] h-[500px] bg-strategy-purple rounded-full filter blur-3xl opacity-20 -z-10 animate-pulse-glow" />

      <StrategyLabClient ingredients={ingredients} strategies={strategies} />
    </div>
  )
}
