"use client"

import { motion } from "framer-motion"
import { Check, Users, Bot, Zap } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PricingSection() {
  const plans = [
    {
      name: "Discord Community",
      price: "Free",
      pricePeriod: "",
      icon: Users,
      features: ["Community Access", "General Chat Channels", "Weekly Market Outlook", "Limited Support"],
      buttonText: "Join for Free",
      popular: false,
      status: "available",
      href: "/checkout?plan=free",
    },
    {
      name: "Signals Pro",
      price: "$55",
      pricePeriod: "/m",
      icon: Bot,
      features: [
        "Everything in Community",
        "All Bot Signals (Q,R,X,O,Z)",
        "All Indicator Signals",
        "Priority Support",
        "Exclusive Channels",
      ],
      buttonText: "Get Pro Signals",
      popular: true,
      status: "available",
      href: "/checkout?plan=pro",
    },
    {
      name: "Automation",
      price: "$300",
      pricePeriod: "/m",
      icon: Zap,
      features: [
        "Everything in Pro",
        "Full Trade Automation",
        "API Access",
        "Custom Strategy Builder",
        "1-on-1 Onboarding",
      ],
      buttonText: "Get Notified",
      popular: false,
      status: "Coming Soon",
      href: "/checkout?plan=automation",
    },
  ]

  return (
    <section id="pricing" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-mono">
            Choose Your <span className="text-primary">Edge</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">Flexible plans designed for every type of trader.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`cyberpunk-card border p-8 flex flex-col relative transition-all duration-300 hover:shadow-primary hover:border-primary ${
                plan.popular ? "border-primary shadow-primary" : "border-gray-800"
              }`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              {plan.status === "Coming Soon" && (
                <div className="absolute top-4 right-4 bg-yellow-400 text-black text-xs font-bold uppercase px-2 py-1 rounded-full">
                  Coming Soon
                </div>
              )}
              <div className="flex-grow">
                <div className="flex items-center gap-4 mb-6">
                  <plan.icon className={`w-8 h-8 ${plan.popular ? "text-primary" : "text-gray-500"}`} />
                  <h3 className="text-2xl font-bold text-white font-mono">{plan.name}</h3>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  {plan.pricePeriod && <span className="text-lg text-gray-400">{plan.pricePeriod}</span>}
                </div>
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                <Link href={plan.href}>
                  <Button
                    className={`w-full cyberpunk-button font-bold text-lg py-4 ${
                      plan.popular
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-gray-800 text-white hover:bg-gray-700"
                    }`}
                    disabled={plan.status === "Coming Soon"}
                  >
                    {plan.buttonText}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
