import NexusQuantTerminal from "@/components/nexus-quant-terminal"
import ErrorBoundary from "@/components/ui/error-boundary"

export default function Home() {
  return (
    <ErrorBoundary>
      <NexusQuantTerminal />
    </ErrorBoundary>
  )
}
