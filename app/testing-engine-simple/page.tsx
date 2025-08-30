import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Simple Testing Engine | Nexural Trading",
  description: "Simple test version of the testing engine"
}

export default function SimpleTestingEnginePage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">🧪 Testing Engine</h1>
        <p className="text-xl text-gray-300">Simple version - WORKING!</p>
        <div className="mt-8 p-4 bg-green-900 rounded-lg">
          <p className="text-green-200">✅ If you can see this, the basic testing engine structure works!</p>
        </div>
      </div>
    </div>
  )
}
