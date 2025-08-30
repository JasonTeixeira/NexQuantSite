import { NextRequest, NextResponse } from 'next/server'

// GET - Get group members with filtering and search
export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const { groupId } = params
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') // Search by username or display name
    const role = searchParams.get('role') // 'owner', 'moderator', 'member'
    const sortBy = searchParams.get('sortBy') || 'joinedAt' // 'joinedAt', 'activity', 'contribution'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Mock group members data
    const mockMembers = [
      {
        id: 'user-owner-1',
        username: 'options_wizard',
        displayName: 'Options Wizard',
        avatar: '/api/placeholder/50/50',
        verified: true,
        level: 'Professional',
        reputation: 8950,
        
        // Group-specific info
        role: 'owner',
        joinedAt: '2023-06-12T00:00:00Z',
        lastActiveInGroup: '2024-01-20T15:30:00Z',
        contributionScore: 2847, // Points from posts, helpful comments, etc.
        postsCount: 156,
        commentsCount: 489,
        reactionsReceived: 2456,
        warningsCount: 0,
        
        // Member status
        isOnline: true,
        notificationsEnabled: true,
        canPost: true,
        canInvite: true,
        canModerate: true,
        
        // Badges earned in this group
        groupBadges: [
          { name: 'Group Creator', icon: '👑', earnedAt: '2023-06-12T00:00:00Z' },
          { name: 'Top Educator', icon: '🎓', earnedAt: '2023-08-15T00:00:00Z' },
          { name: 'Super Contributor', icon: '🌟', earnedAt: '2023-12-01T00:00:00Z' }
        ],
        
        bio: 'Professional options trader with 12+ years experience. Former market maker.',
        specialization: 'Options Strategy Development'
      },
      {
        id: 'user-mod-1',
        username: 'volatility_king',
        displayName: 'Volatility King',
        avatar: '/api/placeholder/50/50',
        verified: true,
        level: 'Expert',
        reputation: 6750,
        
        role: 'moderator',
        joinedAt: '2023-07-01T00:00:00Z',
        moderatorSince: '2023-08-15T00:00:00Z',
        lastActiveInGroup: '2024-01-20T14:45:00Z',
        contributionScore: 1567,
        postsCount: 89,
        commentsCount: 234,
        reactionsReceived: 1234,
        warningsCount: 0,
        
        isOnline: false,
        notificationsEnabled: true,
        canPost: true,
        canInvite: true,
        canModerate: true,
        
        groupBadges: [
          { name: 'Volatility Expert', icon: '⚡', earnedAt: '2023-09-10T00:00:00Z' },
          { name: 'Helpful Moderator', icon: '🛡️', earnedAt: '2023-11-20T00:00:00Z' }
        ],
        
        bio: 'Volatility trading specialist. Love helping others understand the Greeks.',
        specialization: 'Volatility & IV Analysis'
      },
      {
        id: 'user-member-1',
        username: 'swing_trader_pro',
        displayName: 'Swing Trader Pro',
        avatar: '/api/placeholder/50/50',
        verified: false,
        level: 'Expert',
        reputation: 4530,
        
        role: 'member',
        joinedAt: '2023-09-20T00:00:00Z',
        lastActiveInGroup: '2024-01-20T14:30:00Z',
        contributionScore: 789,
        postsCount: 45,
        commentsCount: 156,
        reactionsReceived: 567,
        warningsCount: 0,
        
        isOnline: true,
        notificationsEnabled: true,
        canPost: true,
        canInvite: true,
        canModerate: false,
        
        groupBadges: [
          { name: 'Quality Contributor', icon: '✨', earnedAt: '2023-12-05T00:00:00Z' },
          { name: 'Earnings Expert', icon: '📊', earnedAt: '2024-01-10T00:00:00Z' }
        ],
        
        bio: 'Swing trader focused on earnings plays and technical setups.',
        specialization: 'Earnings Strategies'
      },
      {
        id: 'user-member-2',
        username: 'options_newbie_learning',
        displayName: 'Options Newbie',
        avatar: '/api/placeholder/50/50',
        verified: false,
        level: 'Beginner',
        reputation: 156,
        
        role: 'member',
        joinedAt: '2024-01-10T00:00:00Z',
        lastActiveInGroup: '2024-01-20T12:15:00Z',
        contributionScore: 23,
        postsCount: 3,
        commentsCount: 18,
        reactionsReceived: 15,
        warningsCount: 0,
        
        isOnline: false,
        notificationsEnabled: true,
        canPost: true,
        canInvite: false, // New members need to earn invite privileges
        canModerate: false,
        
        groupBadges: [
          { name: 'New Member', icon: '🌱', earnedAt: '2024-01-10T00:00:00Z' },
          { name: 'Good Questions', icon: '❓', earnedAt: '2024-01-18T00:00:00Z' }
        ],
        
        bio: 'New to options trading, excited to learn from the community!',
        specialization: 'Learning the Basics'
      },
      {
        id: 'user-member-3',
        username: 'quantitative_trader',
        displayName: 'Quantitative Trader',
        avatar: '/api/placeholder/50/50',
        verified: true,
        level: 'Professional',
        reputation: 7890,
        
        role: 'member',
        joinedAt: '2023-10-15T00:00:00Z',
        lastActiveInGroup: '2024-01-19T18:20:00Z',
        contributionScore: 1245,
        postsCount: 67,
        commentsCount: 201,
        reactionsReceived: 987,
        warningsCount: 0,
        
        isOnline: false,
        notificationsEnabled: false, // Reduced notifications
        canPost: true,
        canInvite: true,
        canModerate: false,
        
        groupBadges: [
          { name: 'Math Wizard', icon: '🔢', earnedAt: '2023-11-30T00:00:00Z' },
          { name: 'Strategy Developer', icon: '🧠', earnedAt: '2024-01-05T00:00:00Z' }
        ],
        
        bio: 'Quantitative trader developing systematic options strategies.',
        specialization: 'Quantitative Analysis'
      }
    ]

    // Apply filters
    let filteredMembers = [...mockMembers]

    if (search) {
      const searchLower = search.toLowerCase()
      filteredMembers = filteredMembers.filter(member =>
        member.username.toLowerCase().includes(searchLower) ||
        member.displayName.toLowerCase().includes(searchLower) ||
        member.bio.toLowerCase().includes(searchLower)
      )
    }

    if (role) {
      filteredMembers = filteredMembers.filter(member => member.role === role)
    }

    // Sort members
    filteredMembers.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'activity':
          aValue = new Date(a.lastActiveInGroup).getTime()
          bValue = new Date(b.lastActiveInGroup).getTime()
          break
        case 'contribution':
          aValue = a.contributionScore
          bValue = b.contributionScore
          break
        case 'joinedAt':
        default:
          aValue = new Date(a.joinedAt).getTime()
          bValue = new Date(b.joinedAt).getTime()
      }

      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
    })

    // Pagination
    const offset = (page - 1) * limit
    const paginatedMembers = filteredMembers.slice(offset, offset + limit)

    // Calculate member statistics
    const memberStats = {
      totalMembers: mockMembers.length,
      onlineMembers: mockMembers.filter(m => m.isOnline).length,
      byRole: {
        owner: mockMembers.filter(m => m.role === 'owner').length,
        moderator: mockMembers.filter(m => m.role === 'moderator').length,
        member: mockMembers.filter(m => m.role === 'member').length
      },
      byLevel: {
        'Beginner': mockMembers.filter(m => m.level === 'Beginner').length,
        'Intermediate': mockMembers.filter(m => m.level === 'Intermediate').length,
        'Expert': mockMembers.filter(m => m.level === 'Expert').length,
        'Professional': mockMembers.filter(m => m.level === 'Professional').length,
        'Elite': mockMembers.filter(m => m.level === 'Elite').length
      },
      avgContributionScore: Math.round(
        mockMembers.reduce((sum, m) => sum + m.contributionScore, 0) / mockMembers.length
      ),
      verifiedMembers: mockMembers.filter(m => m.verified).length,
      newMembersThisWeek: mockMembers.filter(m => {
        const joinDate = new Date(m.joinedAt)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return joinDate > weekAgo
      }).length
    }

    return NextResponse.json({
      success: true,
      members: paginatedMembers,
      pagination: {
        page,
        limit,
        total: filteredMembers.length,
        pages: Math.ceil(filteredMembers.length / limit)
      },
      stats: memberStats,
      filters: {
        roles: [
          { value: 'owner', label: 'Owner', count: memberStats.byRole.owner },
          { value: 'moderator', label: 'Moderators', count: memberStats.byRole.moderator },
          { value: 'member', label: 'Members', count: memberStats.byRole.member }
        ],
        sortOptions: [
          { value: 'joinedAt', label: 'Join Date' },
          { value: 'activity', label: 'Last Active' },
          { value: 'contribution', label: 'Contribution Score' }
        ]
      }
    })

  } catch (error: any) {
    console.error('Group Members API GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch group members', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Join group or invite member
export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const userId = 'current-user-id' // Mock - from auth
    const { groupId } = params
    const body = await request.json()
    const {
      action, // 'join', 'invite', 'remove', 'promote', 'demote'
      targetUserId, // For invite/remove/promote/demote actions
      role, // For promote action ('moderator', 'member')
      reason // For remove action
    } = body

    // Validation
    const validActions = ['join', 'invite', 'remove', 'promote', 'demote']
    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      )
    }

    if (['invite', 'remove', 'promote', 'demote'].includes(action) && !targetUserId) {
      return NextResponse.json(
        { error: 'targetUserId is required for this action' },
        { status: 400 }
      )
    }

    // Process the membership action
    const membershipAction = {
      id: `membership-${Date.now()}`,
      groupId,
      action,
      actorId: userId,
      targetUserId: action === 'join' ? userId : targetUserId,
      role: role || null,
      reason: reason || null,
      timestamp: new Date().toISOString()
    }

    let result = {}

    switch (action) {
      case 'join':
        // In production: check group privacy, approval requirements, etc.
        result = {
          membershipStatus: 'active',
          role: 'member',
          joinedAt: new Date().toISOString(),
          canPost: true,
          canInvite: false, // Usually requires earning privileges
          notificationsEnabled: true,
          message: 'Successfully joined the group!'
        }
        break

      case 'invite':
        // In production: check inviter permissions, send notification to invitee
        result = {
          inviteStatus: 'sent',
          invitedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          message: 'Invite sent successfully!'
        }
        break

      case 'remove':
        // In production: check moderator/owner permissions, log reason
        result = {
          membershipStatus: 'removed',
          removedAt: new Date().toISOString(),
          reason: reason || 'Removed by moderator',
          canRejoin: false, // Usually requires approval after removal
          message: 'Member removed from group'
        }
        break

      case 'promote':
        // In production: check owner permissions for promoting to moderator
        result = {
          newRole: role,
          promotedAt: new Date().toISOString(),
          previousRole: 'member',
          permissions: role === 'moderator' ? ['moderate_content', 'manage_members'] : [],
          message: `Member promoted to ${role}`
        }
        break

      case 'demote':
        // In production: check owner permissions
        result = {
          newRole: 'member',
          demotedAt: new Date().toISOString(),
          previousRole: role || 'moderator',
          message: 'Member demoted to regular member'
        }
        break
    }

    // In production:
    // 1. Verify user permissions for the action
    // 2. Update membership in database
    // 3. Send notifications as appropriate
    // 4. Update group member count
    // 5. Log action for audit trail

    console.log('Processing membership action:', membershipAction, 'Result:', result)

    return NextResponse.json({
      success: true,
      action: membershipAction,
      result,
      groupId
    }, { status: 201 })

  } catch (error: any) {
    console.error('Group Membership API POST error:', error)
    return NextResponse.json(
      { error: 'Failed to process membership action', details: error.message },
      { status: 500 }
    )
  }
}

