// Newsletter Components - All optimized for minimal space usage
export { default as NewsletterSection } from './NewsletterSection'
export { default as InlineNewsletterWidget } from './InlineNewsletterWidget'
export { default as EmailCaptureForm } from './EmailCaptureForm'
export { default as CompactNewsletterBanner } from './CompactNewsletterBanner'
export { default as StickyNewsletterBanner } from './StickyNewsletterBanner'
export { default as ExitIntentCapture } from './ExitIntentCapture'

// Recommended usage:
// - CompactNewsletterBanner: For minimal horizontal space usage (32px height)
// - InlineNewsletterWidget with variant="compact": For inline content sections 
// - NewsletterSection with variant="minimal": For dedicated newsletter sections but compact
// - NewsletterSection default: Only for landing pages where you want full newsletter focus
