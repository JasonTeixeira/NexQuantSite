"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export default function PartnersSection() {
  const partners = [
    { name: "Bloomberg", logo: "/generic-financial-logo.png" },
    { name: "Wired", logo: "/generic-tech-logo.png" },
    { name: "The Guardian", logo: "/the-guardian-logo.png" },
    { name: "TechCrunch", logo: "/techcrunch-logo.png" },
  ]

  return (
    <section className="py-12 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="border border-gray-800 cyberpunk-card p-8"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-mono font-bold text-white">OUR PARTNERS</h3>
              <ArrowRight className="text-primary" />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {partners.map((partner) => (
                <img
                  key={partner.name}
                  src={partner.logo || "/placeholder.svg"}
                  alt={partner.name}
                  className="h-6 md:h-8 object-contain"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
