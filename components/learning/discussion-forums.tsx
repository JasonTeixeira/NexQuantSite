"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DiscussionForums({ courseId }: { courseId?: string }) {
  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                Community Forums
              </h1>
              <p className="text-blue-100">
                Connect with fellow traders, share strategies, and learn together
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              New Discussion
            </Button>
          </div>
        </div>
        
        <div className="mt-8 grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Discussion Forums Coming Soon</CardTitle>
              <CardDescription>
                We're building an amazing community forum experience for our traders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Real-time discussions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Expert trading insights</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Community-driven content</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Strategy sharing (coming soon)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
