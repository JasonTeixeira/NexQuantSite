import type { Metadata } from "next"
import MediaEditorClient from "@/components/admin/media-editor-client"

export const metadata: Metadata = {
  title: "Media Editor - Nexural Trading Admin",
  description: "Advanced media editing capabilities",
}

export default function MediaEditorPage() {
  return <MediaEditorClient />
}
