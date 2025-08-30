"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  videoId: string
}

export default function VideoModal({ isOpen, onClose, videoId }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-4xl aspect-video bg-black border-2 border-primary/50 shadow-[0_0_50px_rgba(184,255,0,0.3)] cyberpunk-card"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute -top-4 -right-4 w-10 h-10 bg-primary text-black rounded-full flex items-center justify-center cyberpunk-button border-2 border-black"
            >
              <X />
            </button>

            {/* Video */}
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title="Demo video"
              frameBorder={0}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
