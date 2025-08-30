import type { Metadata } from "next"
import { notFound } from "next/navigation"
import MemberProfileClient from "@/components/community/MemberProfileClient"

interface MemberProfilePageProps {
  params: Promise<{
    username: string
  }>
}

// Mock data - in real app, this would come from your database
const mockUsers = [
  { username: 'alex_trader', name: 'Alex Thompson', verified: true },
  { username: 'sarah_crypto', name: 'Sarah Chen', verified: true },
  { username: 'mike_quant', name: 'Michael Rodriguez', verified: false },
  { username: 'emma_algo', name: 'Emma Johnson', verified: true },
  { username: 'david_fx', name: 'David Kim', verified: false },
]

export async function generateMetadata({ params }: MemberProfilePageProps): Promise<Metadata> {
  const resolvedParams = await params
  const user = mockUsers.find(u => u.username === resolvedParams.username)
  
  if (!user) {
    return {
      title: 'Member Not Found - Nexural Trading',
      description: 'This member profile could not be found.',
    }
  }

  return {
    title: `${user.name} (@${user.username}) - Nexural Trading`,
    description: `View ${user.name}'s trading profile, performance stats, achievements, and shared strategies on Nexural Trading.`,
    keywords: ['trader profile', 'trading performance', 'social trading', user.username, user.name],
  }
}

export default async function MemberProfilePage({ params }: MemberProfilePageProps) {
  const resolvedParams = await params
  const user = mockUsers.find(u => u.username === resolvedParams.username)
  
  if (!user) {
    notFound()
  }

  return <MemberProfileClient username={resolvedParams.username} />
}
