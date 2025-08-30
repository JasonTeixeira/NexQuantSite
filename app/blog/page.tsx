"use client"

import { useState, useEffect } from 'react'
import BlogPageClient from "@/components/BlogPageClient"
import type { Post } from "@/lib/blog-data"

import { getAllPosts } from "@/lib/blog-data"

export default function BlogPage() {
  const posts = getAllPosts()

  return <BlogPageClient posts={posts} />
}