import { NextRequest, NextResponse } from "next/server"

// Blog settings - In production, this would be stored in your database
let blogSettings = {
  autoApprove: false, // Toggle for auto-approval of guest posts
  revenueShareEnabled: true,
  guestAuthorRevenueShare: 60, // Percentage for guest authors (60% to guest, 40% to platform)
  moderationRequired: true,
  allowGuestTagCreation: true,
  allowGuestFileUploads: true,
  maxFileSize: 10 * 1024 * 1024, // 10MB in bytes
  allowedFileTypes: [
    // Images
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
    // Documents
    'pdf', 'doc', 'docx', 'txt', 'md',
    // Code files
    'js', 'ts', 'jsx', 'tsx', 'py', 'cpp', 'c', 'java', 'html', 'css', 'json', 'xml',
    // Archives
    'zip', 'rar'
  ],
  maxPostsPerDay: 5, // Maximum posts per guest author per day
  requireEmailVerification: true,
  enableComments: true,
  enableSocialSharing: true,
  seoOptimization: true,
  analyticsEnabled: true,
  
  // Content guidelines (flexible as requested)
  contentGuidelines: {
    minWordCount: 300,
    maxWordCount: 10000,
    requireFeaturedImage: false,
    allowExternalLinks: true,
    requireCategories: true,
    requireTags: true
  },
  
  // Revenue sharing details
  revenueModel: {
    viewsThreshold: 100, // Minimum views before revenue sharing kicks in
    baseRatePerView: 0.01, // $0.01 per view after threshold
    premiumRatePerView: 0.02, // $0.02 per view for featured posts
    bonusForHighEngagement: 0.005, // Additional bonus for high likes/comments
    paymentSchedule: 'monthly', // monthly | weekly | daily
    minimumPayout: 10.00 // Minimum amount before payout
  }
}

export async function GET(request: NextRequest) {
  try {
    // Only allow admin access to settings
    const authHeader = request.headers.get('authorization')
    const isAdmin = authHeader?.includes('admin') // In production, verify admin JWT
    
    if (!isAdmin) {
      // Return limited settings for guest authors
      return NextResponse.json({
        success: true,
        settings: {
          allowGuestTagCreation: blogSettings.allowGuestTagCreation,
          allowGuestFileUploads: blogSettings.allowGuestFileUploads,
          maxFileSize: blogSettings.maxFileSize,
          allowedFileTypes: blogSettings.allowedFileTypes,
          maxPostsPerDay: blogSettings.maxPostsPerDay,
          contentGuidelines: blogSettings.contentGuidelines,
          revenueShareEnabled: blogSettings.revenueShareEnabled,
          guestAuthorRevenueShare: blogSettings.guestAuthorRevenueShare
        }
      })
    }
    
    // Return full settings for admin
    return NextResponse.json({
      success: true,
      settings: blogSettings
    })
  } catch (error) {
    console.error('Failed to fetch blog settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Only allow admin to update settings
    const authHeader = request.headers.get('authorization')
    const isAdmin = authHeader?.includes('admin') // In production, verify admin JWT
    
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const { setting, value, settings: bulkSettings } = body
    
    if (bulkSettings) {
      // Bulk update of multiple settings
      Object.assign(blogSettings, bulkSettings)
    } else if (setting && value !== undefined) {
      // Update single setting
      if (setting.includes('.')) {
        // Handle nested settings like 'revenueModel.baseRatePerView'
        const keys = setting.split('.')
        let target = blogSettings
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!(keys[i] in target)) {
            target[keys[i]] = {}
          }
          target = target[keys[i]]
        }
        
        target[keys[keys.length - 1]] = value
      } else {
        // Direct setting update
        blogSettings[setting] = value
      }
    }
    
    return NextResponse.json({
      success: true,
      settings: blogSettings,
      message: 'Settings updated successfully'
    })
  } catch (error) {
    console.error('Failed to update blog settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body
    
    switch (action) {
      case 'toggle_auto_approve':
        blogSettings.autoApprove = !blogSettings.autoApprove
        return NextResponse.json({
          success: true,
          autoApprove: blogSettings.autoApprove,
          message: `Auto-approval ${blogSettings.autoApprove ? 'enabled' : 'disabled'}`
        })
        
      case 'update_revenue_share':
        if (data.percentage >= 0 && data.percentage <= 100) {
          blogSettings.guestAuthorRevenueShare = data.percentage
          return NextResponse.json({
            success: true,
            revenueShare: blogSettings.guestAuthorRevenueShare,
            message: 'Revenue share updated successfully'
          })
        } else {
          return NextResponse.json(
            { success: false, error: 'Invalid percentage. Must be between 0 and 100.' },
            { status: 400 }
          )
        }
        
      case 'add_allowed_file_type':
        if (data.fileType && !blogSettings.allowedFileTypes.includes(data.fileType)) {
          blogSettings.allowedFileTypes.push(data.fileType)
          return NextResponse.json({
            success: true,
            allowedFileTypes: blogSettings.allowedFileTypes,
            message: 'File type added successfully'
          })
        }
        break
        
      case 'remove_allowed_file_type':
        if (data.fileType) {
          blogSettings.allowedFileTypes = blogSettings.allowedFileTypes.filter(
            type => type !== data.fileType
          )
          return NextResponse.json({
            success: true,
            allowedFileTypes: blogSettings.allowedFileTypes,
            message: 'File type removed successfully'
          })
        }
        break
        
      case 'reset_to_defaults':
        blogSettings = {
          autoApprove: false,
          revenueShareEnabled: true,
          guestAuthorRevenueShare: 60,
          moderationRequired: true,
          allowGuestTagCreation: true,
          allowGuestFileUploads: true,
          maxFileSize: 10 * 1024 * 1024,
          allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt', 'js', 'py', 'cpp', 'html', 'css'],
          maxPostsPerDay: 5,
          requireEmailVerification: true,
          enableComments: true,
          enableSocialSharing: true,
          seoOptimization: true,
          analyticsEnabled: true,
          contentGuidelines: {
            minWordCount: 300,
            maxWordCount: 10000,
            requireFeaturedImage: false,
            allowExternalLinks: true,
            requireCategories: true,
            requireTags: true
          },
          revenueModel: {
            viewsThreshold: 100,
            baseRatePerView: 0.01,
            premiumRatePerView: 0.02,
            bonusForHighEngagement: 0.005,
            paymentSchedule: 'monthly',
            minimumPayout: 10.00
          }
        }
        return NextResponse.json({
          success: true,
          settings: blogSettings,
          message: 'Settings reset to defaults'
        })
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Failed to process blog settings action:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

