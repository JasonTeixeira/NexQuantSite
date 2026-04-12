"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, CheckCircle, Mail, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email) {
      setStatus("error")
      setMessage("Please enter a valid email address.")
      return
    }

    setStatus("submitting")
    setMessage("")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (email.includes("@")) {
      setStatus("success")
      setMessage("Success! You are now connected to the Nexural datastream.")
      setEmail("")
    } else {
      setStatus("error")
      setMessage("Invalid email format. Please try again.")
    }
  }

  return (
    <section className="py-8 bg-black relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-cyan-500/20 rounded-xl p-6 backdrop-blur-sm"
        >
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg">
                  <Mail className="w-6 h-6 text-cyan-400" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  ACCESS THE <span className="text-primary">DATASTREAM</span>
                </h2>
              </div>
              <p className="text-gray-300 text-sm max-w-xl lg:max-w-none mx-auto lg:mx-0">
                Join our free newsletter for market analysis, bot performance reports, and exclusive insights from the Nexural core.
              </p>
            </div>

            {/* Form */}
            <div className="w-full lg:w-auto lg:min-w-[400px]">
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row items-center gap-3"
              >
                <Input
                  type="email"
                  placeholder="your_alias@domain.com"
                  className="flex-1 bg-black/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400 font-mono"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "submitting" || status === "success"}
                />
                <Button
                  type="submit"
                  className={cn(
                    "w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider transition-all duration-300 px-6",
                    status === "submitting" && "animate-pulse",
                  )}
                  disabled={status === "submitting" || status === "success"}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={status}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-center"
                    >
                      {status === "submitting" ? (
                        "Connecting..."
                      ) : status === "success" ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Connected
                        </>
                      ) : (
                        <>
                          Subscribe <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </motion.span>
                  </AnimatePresence>
                </Button>
              </form>

              <AnimatePresence>
                {message && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      "mt-3 text-xs font-mono flex items-center justify-center gap-2",
                      status === "success" && "text-primary",
                      status === "error" && "text-red-500",
                    )}
                  >
                    {status === "success" ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
