"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  BookOpen,
  Wrench,
  X,
  Building,
  BarChart2,
  Target,
  Zap,
  Shield,
  Radio,
  Star,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/* --------------------------  Type Defs  --------------------------- */
/* ------------------------------------------------------------------ */

type Term = {
  id: number
  term: string
  acronym?: string
  category: string
  description: string
  formula?: string
  example?: string
  related?: string[]
}

type Technique = {
  name: string
  desc: string
  tags: string[]
}

type Practice = {
  title: string
  content: string
  tips: string[]
}

type GlossaryPageClientProps = {
  terms: Term[]
  techniques: { [key: string]: Technique[] }
  practices: Practice[]
}

/* ------------------------------------------------------------------ */
/* ---------------------------  Config  ----------------------------- */
/* ------------------------------------------------------------------ */

const categoryConfig: { [key: string]: { icon: React.ElementType; color: string } } = {
  strategies: { icon: Target, color: "text-green-400" },
  indicators: { icon: BarChart2, color: "text-cyan-400" },
  risk: { icon: Shield, color: "text-red-400" },
  quant: { icon: Wrench, color: "text-yellow-400" },
  execution: { icon: Zap, color: "text-orange-400" },
  infrastructure: { icon: Building, color: "text-purple-400" },
  analysis: { icon: BookOpen, color: "text-teal-400" },
}

const workshopConfig: { [key: string]: { icon: React.ElementType; title: string; desc: string } } = {
  foundation: { icon: Building, title: "System Foundation", desc: "Core architecture and infrastructure" },
  dataAnalysis: { icon: BarChart2, title: "Data & Analysis", desc: "Data acquisition and analytical techniques" },
  strategies: { icon: Target, title: "Strategy Development", desc: "Building, testing, and optimizing" },
  execution: { icon: Zap, title: "Trade Execution", desc: "Order management and optimization" },
  risk: { icon: Shield, title: "Risk Management", desc: "Position sizing and risk controls" },
  monitoring: { icon: Radio, title: "Monitoring & Operations", desc: "System monitoring and maintenance" },
}

/* ------------------------------------------------------------------ */
/* -----------------------  Main Component  ------------------------- */
/* ------------------------------------------------------------------ */

export default function GlossaryPageClient({ terms, techniques, practices }: GlossaryPageClientProps) {
  /* ------------------------  State  ------------------------ */
  const [activeSection, setActiveSection] = useState<"glossary" | "workshop">("glossary")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [viewedTerms, setViewedTerms] = useState(new Set<number>())
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null)

  /* ---------------------  Derived Data  -------------------- */
  const filteredTerms = useMemo(() => {
    let result = terms

    if (activeCategory !== "all") {
      result = result.filter((t) => t.category === activeCategory)
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      result = result.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.acronym && t.acronym.toLowerCase().includes(q)),
      )
    }

    return result.sort((a, b) => a.term.localeCompare(b.term))
  }, [terms, activeCategory, searchTerm])

  /* ----------------------  Handlers  ----------------------- */
  const openTermModal = (term: Term) => {
    setSelectedTerm(term)
    setViewedTerms((prev) => new Set(prev).add(term.id))
  }

  const closeTermModal = () => setSelectedTerm(null)

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && closeTermModal()
    window.addEventListener("keydown", onEsc)
    return () => window.removeEventListener("keydown", onEsc)
  }, [])

  /* --------------------  Small Components  ------------------ */
  const TermCard = ({ term }: { term: Term }) => {
    const CategoryIcon = categoryConfig[term.category]?.icon
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-900/50 border border-primary/20 rounded-lg p-6 cursor-pointer hover:border-primary hover:bg-primary/10 transition-all duration-300 relative overflow-hidden group"
        onClick={() => openTermModal(term)}
      >
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent -translate-x-full group-hover:translate-x-0 animate-[slide_1s_linear_infinite]" />
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-primary">{term.term}</h3>
            {term.acronym && <p className="text-xs text-gray-400 italic">{term.acronym}</p>}
          </div>
          <div
            className={cn(
              "flex items-center gap-2 text-xs font-semibold uppercase px-2 py-1 rounded-full border",
              categoryConfig[term.category]?.color,
            )}
          >
            {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
            {term.category}
          </div>
        </div>
        <p className="text-gray-300 text-sm line-clamp-3">{term.description}</p>
      </motion.div>
    )
  }

  /* -----------------------  Render  ------------------------ */
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* ----------  Page Header  ---------- */}
      <header className="text-center mb-16">
        <motion.h1
          className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 pb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Trading Knowledge Base
        </motion.h1>
        <motion.p
          className="text-lg text-gray-400 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Master the language and techniques of quantitative trading with our comprehensive glossary and workshop.
        </motion.p>
      </header>

      {/* ----------  Tabs  ---------- */}
      <div className="flex justify-center gap-4 mb-12">
        <Button
          onClick={() => setActiveSection("glossary")}
          className={cn(
            "gap-2 transition-colors duration-300",
            activeSection === "glossary"
              ? "bg-primary text-black hover:bg-primary/90"
              : "bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white border border-gray-700",
          )}
        >
          <BookOpen size={16} />
          Glossary
        </Button>
        <Button
          onClick={() => setActiveSection("workshop")}
          className={cn(
            "gap-2 transition-colors duration-300",
            activeSection === "workshop"
              ? "bg-primary text-black hover:bg-primary/90"
              : "bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white border border-gray-700",
          )}
        >
          <Wrench size={16} />
          Techniques Workshop
        </Button>
      </div>

      {/* ----------  Glossary Section  ---------- */}
      <AnimatePresence mode="wait">
        {activeSection === "glossary" && (
          <motion.div
            key="glossary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* --- Search --- */}
            <div className="mb-8 relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search terms, formulas, or concepts..."
                className="pl-12 h-12 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* --- Category Filters --- */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <Button
                variant={activeCategory === "all" ? "secondary" : "ghost"}
                onClick={() => setActiveCategory("all")}
                className="rounded-full"
              >
                All Terms
              </Button>
              {Object.entries(categoryConfig).map(([key, { icon: Icon }]) => (
                <Button
                  key={key}
                  variant={activeCategory === key ? "secondary" : "ghost"}
                  onClick={() => setActiveCategory(key)}
                  className="rounded-full capitalize gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {key}
                </Button>
              ))}
            </div>

            {/* --- Stats Card --- */}
            <Card className="mb-8 bg-gray-900/30 border-primary/20">
              <CardContent className="p-4 flex justify-around items-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{filteredTerms.length}</p>
                  <p className="text-xs text-gray-400 uppercase">Terms Showing</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary capitalize">{activeCategory}</p>
                  <p className="text-xs text-gray-400 uppercase">Category</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{viewedTerms.size}</p>
                  <p className="text-xs text-gray-400 uppercase">Viewed</p>
                </div>
              </CardContent>
            </Card>

            {/* --- Term Grid --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredTerms.map((t) => (
                  <TermCard key={t.id} term={t} />
                ))}
              </AnimatePresence>
            </div>

            {filteredTerms.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <BookOpen className="mx-auto h-12 w-12 mb-4" />
                <p>No terms found matching your search.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ----------  Workshop Section  ---------- */}
        {activeSection === "workshop" && (
          <motion.div
            key="workshop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-primary mb-2">Quantitative Trading Workshop</h2>
              <p className="text-gray-400 max-w-3xl mx-auto">
                Build world-class trading systems with these proven techniques, tools, and best practices used by
                professional quants and institutional traders.
              </p>
            </div>

            {/* --- Category Cards --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {Object.entries(workshopConfig).map(([key, { icon: Icon, title, desc }]) => (
                <Card
                  key={key}
                  className="bg-gray-900/50 border border-primary/20 text-center p-6 hover:border-primary hover:bg-primary/10 transition-all duration-300"
                >
                  {Icon && <Icon className="h-10 w-10 mx-auto mb-4 text-primary" />}
                  <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                  <p className="text-sm text-gray-400">{desc}</p>
                </Card>
              ))}
            </div>

            {/* --- Techniques Lists --- */}
            <div className="space-y-12">
              {Object.entries(techniques).map(([category, list]) => (
                <Card key={category} className="bg-gray-900/30 border-primary/20 overflow-hidden">
                  <CardHeader className="flex items-center gap-4 bg-gray-900/50 p-4">
                    {(() => {
                      const Icon = workshopConfig[category]?.icon
                      return Icon ? <Icon className="h-8 w-8 text-primary" /> : null
                    })()}
                    <CardTitle className="text-2xl text-white capitalize">
                      {workshopConfig[category]?.title || category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {list.map((tech) => (
                      <div key={tech.name} className="bg-gray-900/50 p-4 rounded-lg border border-primary/10">
                        <h4 className="font-bold text-primary mb-2">{tech.name}</h4>
                        <p className="text-sm text-gray-300 mb-3">{tech.desc}</p>
                        <div className="flex flex-wrap gap-2">
                          {tech.tags.map((tag) => (
                            <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* --- Best Practices --- */}
            <div className="mt-16">
              <div className="flex items-center gap-4 mb-6">
                <Star className="h-8 w-8 text-yellow-400" />
                <h2 className="text-3xl font-bold text-white">Best Practices for Quantitative Trading</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {practices.map((p, i) => (
                  <Card key={i} className="bg-gray-900/50 border border-yellow-400/20 p-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-4">
                        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-400/20 text-yellow-400 font-bold">
                          {i + 1}
                        </span>
                        {p.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 mb-4">{p.content}</p>
                      <div className="space-y-2">
                        {p.tips.map((tip, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                            <ArrowRight className="h-4 w-4 mt-1 shrink-0 text-primary" />
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------  Term Modal  ---------- */}
      <AnimatePresence>
        {selectedTerm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeTermModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-gray-900 border-2 border-primary rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 rounded-full"
                onClick={closeTermModal}
              >
                <X size={20} />
              </Button>

              {/* --- Modal Header --- */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-primary">{selectedTerm.term}</h2>
                  {selectedTerm.acronym && <p className="text-sm text-gray-400 italic">{selectedTerm.acronym}</p>}
                </div>
                {(() => {
                  const Icon = categoryConfig[selectedTerm.category]?.icon
                  return (
                    <div
                      className={cn(
                        "flex items-center gap-2 text-sm font-semibold uppercase px-3 py-1 rounded-full border",
                        categoryConfig[selectedTerm.category]?.color,
                      )}
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      {selectedTerm.category}
                    </div>
                  )
                })()}
              </div>

              {/* --- Modal Body --- */}
              <p className="text-gray-300 mb-6">{selectedTerm.description}</p>

              {selectedTerm.formula && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">Formula</h4>
                  <div className="bg-black p-4 rounded-md font-mono text-primary text-sm border border-primary/20">
                    {selectedTerm.formula}
                  </div>
                </div>
              )}

              {selectedTerm.example && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">Example</h4>
                  <div className="bg-primary/5 p-4 rounded-md border-l-4 border-primary text-gray-300 text-sm">
                    {selectedTerm.example}
                  </div>
                </div>
              )}

              {selectedTerm.related && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">Related Terms</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTerm.related.map((rel) => (
                      <Button
                        key={rel}
                        variant="outline"
                        size="sm"
                        className="rounded-full bg-transparent"
                        onClick={() => {
                          setSearchTerm(rel)
                          setActiveSection("glossary")
                          closeTermModal()
                        }}
                      >
                        {rel}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
