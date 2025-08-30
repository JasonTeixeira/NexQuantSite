"use client"

import { motion } from "framer-motion"

export default function LoadingOverlay() {
  return (
    <motion.div
      className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        {/* Loading Spinner */}
        <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-8" />

        {/* Loading Text */}
        <motion.p
          className="text-xl text-gray-300 font-semibold mb-4"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          Initializing Quantum Trading Systems...
        </motion.p>

        {/* Progress Bar */}
        <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  )
}
