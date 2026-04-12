import type { Metadata } from "next"
import GuestAuthorPortalClient from "@/components/GuestAuthorPortalClient"

export const metadata: Metadata = {
  title: "Guest Author Portal - Nexural Trading Blog",
  description: "Sign in to create and manage your blog posts on Nexural Trading's blog platform",
  keywords: "guest author, blog writing, trading content, nexural blog",
}

export default function GuestAuthorPortalPage() {
  return <GuestAuthorPortalClient />
}


