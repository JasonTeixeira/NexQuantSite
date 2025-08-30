"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { AlertTriangle, BookOpen, Mail, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { QACategory, QAItem } from "@/lib/qa-data"

interface QAPageClientProps {
  categories: QACategory[]
  qaData: QAItem[]
}

/* ----------  Local decorative background (no external blobs) ---------- */
function GridBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black">
      <div
        style={{
          position: "absolute",
          width: "200%",
          height: "200%",
          backgroundImage:
            "linear-gradient(rgba(164,255,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(164,255,0,0.04) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
          animation: "gridMove 25s linear infinite",
        }}
      />
      <style jsx global>{`
        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(40px, 40px);
          }
        }
      `}</style>
    </div>
  )
}
/* ---------------------------------------------------------------------- */

export default function QAPageClient({ categories, qaData }: QAPageClientProps) {
  const [activeCategory, setActiveCategory] = useState<QACategory["id"]>("all")

  const filtered = activeCategory === "all" ? qaData : qaData.filter((q) => q.category === activeCategory)

  return (
    <div className="relative">
      <GridBackground />

      <section className="container mx-auto px-4 py-20 md:py-28 relative z-10">
        {/* -------- HERO -------- */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary bg-primary/10 border border-primary/30 rounded-full px-4 py-1">
            Knowledge Base
          </span>

          <h1 className="mt-8 font-extrabold tracking-tight text-4xl md:text-5xl lg:text-6xl">
            Frequently Asked <span className="text-primary">Questions</span>
          </h1>

          <p className="mt-6 text-gray-400 text-lg">
            Everything you need to know about risks, guarantees and our quantitative trading platform.
          </p>
        </div>

        {/* -------- RISK BANNER -------- */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 md:p-8 flex gap-4 mb-16">
          <AlertTriangle className="h-8 w-8 text-red-400 shrink-0 mt-1" />
          <div>
            <h2 className="font-bold text-red-400 mb-2">Important Risk Disclosure</h2>
            <p className="text-gray-300">
              Trading futures and using quantitative models involves substantial risk of loss and is not suitable for
              all investors. You may lose all or more of your initial investment. Past performance is not indicative of
              future results. Only risk capital should be used for trading and only those with sufficient risk capital
              should consider trading.
            </p>
          </div>
        </div>

        {/* -------- CATEGORY FILTER -------- */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-12">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant="ghost"
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "border border-gray-700 hover:bg-gray-800",
                activeCategory === cat.id && "bg-primary/10 border-primary/50 text-primary",
              )}
            >
              {cat.name}
              <span className="ml-2 bg-gray-700/50 text-gray-300 text-[10px] font-mono px-1.5 rounded">
                {cat.count}
              </span>
            </Button>
          ))}
        </div>

        {/* -------- ACCORDION -------- */}
        <Accordion type="multiple" className="space-y-4">
          {filtered.map((qa, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border border-gray-800 bg-gray-900/40 rounded-lg">
              <AccordionTrigger className="px-6 py-4 text-left text-base md:text-lg font-semibold hover:no-underline">
                {qa.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-0 prose prose-invert prose-p:text-gray-300">
                {qa.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* -------- QUICK STATS -------- */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center my-20">
          {[
            { value: "100%", label: "Your Responsibility" },
            { value: "$0", label: "Guaranteed Returns" },
            { value: "24/7", label: "Market Risk" },
            { value: "FREE", label: "Education Access" },
          ].map(({ value, label }) => (
            <div key={label} className="bg-gray-900/40 border border-gray-800 rounded-lg p-6">
              <div className="text-4xl font-bold font-mono text-primary">{value}</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider mt-2">{label}</div>
            </div>
          ))}
        </div>

        {/* -------- CALL-TO-ACTION -------- */}
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-8">
            Join our community or check out our educational resources for more information.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-primary text-black hover:bg-primary/90">
              <Link href="#">
                <MessageCircle className="mr-2 h-5 w-5" /> Join Discord
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#">
                <BookOpen className="mr-2 h-5 w-5" /> View Education Center
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">
                <Mail className="mr-2 h-5 w-5" /> Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
