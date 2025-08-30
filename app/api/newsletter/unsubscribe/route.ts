import { NextRequest, NextResponse } from 'next/server'
import { resendService } from '@/lib/services/resend-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, reason } = body

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Unsubscribe user via Resend
    const result = await resendService.unsubscribe(email.toLowerCase().trim(), reason)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Successfully unsubscribed from newsletter'
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Newsletter unsubscription error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get('email')
    const token = url.searchParams.get('token')

    if (!email) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Unsubscribe Link</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background: #000; color: #fff; text-align: center; }
            .container { max-width: 500px; margin: 0 auto; }
            .error { color: #ef4444; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">Invalid Unsubscribe Link</h1>
            <p>This unsubscribe link is invalid or expired.</p>
            <p>If you need help unsubscribing, please contact us at <a href="mailto:support@nexural.com">support@nexural.com</a></p>
          </div>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      })
    }

    // In production, validate token here
    const result = await resendService.unsubscribe(email, 'Web unsubscribe')

    if (result.success) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Successfully Unsubscribed</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background: #000; color: #fff; text-align: center; }
            .container { max-width: 500px; margin: 0 auto; }
            .success { color: #10b981; }
            .logo { font-size: 32px; font-weight: bold; color: #06B6D4; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">NEXURAL</div>
            <h1 class="success">Successfully Unsubscribed</h1>
            <p>You have been successfully unsubscribed from our newsletter.</p>
            <p>You will no longer receive trading insights and updates from Nexural Trading.</p>
            <p>We're sorry to see you go! If you change your mind, you can always re-subscribe on our <a href="/" style="color: #06B6D4;">website</a>.</p>
            
            <div style="margin-top: 40px; padding: 20px; background: #1F2937; border-radius: 8px; border-left: 4px solid #06B6D4;">
              <h3>Feedback</h3>
              <p>Help us improve! Let us know why you unsubscribed:</p>
              <a href="mailto:feedback@nexural.com?subject=Unsubscribe Feedback" style="color: #06B6D4;">Send Feedback</a>
            </div>
          </div>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      })
    } else {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Unsubscribe Failed</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background: #000; color: #fff; text-align: center; }
            .container { max-width: 500px; margin: 0 auto; }
            .error { color: #ef4444; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">Unsubscribe Failed</h1>
            <p>There was an error processing your unsubscribe request.</p>
            <p>Please try again or contact us at <a href="mailto:support@nexural.com">support@nexural.com</a></p>
          </div>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      })
    }

  } catch (error) {
    console.error('Newsletter unsubscription page error:', error)
    
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Server Error</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background: #000; color: #fff; text-align: center; }
          .container { max-width: 500px; margin: 0 auto; }
          .error { color: #ef4444; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="error">Server Error</h1>
          <p>An unexpected error occurred. Please try again later.</p>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
}


