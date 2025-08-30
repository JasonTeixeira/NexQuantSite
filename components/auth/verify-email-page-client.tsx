'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Mail, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function VerifyEmailPageClient() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [isResending, setIsResending] = useState(false)
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      // Simulate email verification
      const timer = setTimeout(() => {
        // Random success/failure for demo
        const isValid = Math.random() > 0.3
        setStatus(isValid ? 'success' : 'expired')
      }, 2000)

      return () => clearTimeout(timer)
    } else {
      setStatus('error')
    }
  }, [token])

  const handleResendEmail = async () => {
    setIsResending(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsResending(false)
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#B8FF00] to-[#00D4FF] bg-clip-text text-transparent mb-4">
            Email Verification
          </h1>
        </div>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardContent className="p-8">
            {status === 'loading' && (
              <div className="text-center space-y-6">
                <RefreshCw className="w-12 h-12 text-[#B8FF00] mx-auto animate-spin" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Verifying Your Email</h3>
                  <p className="text-gray-400">Please wait while we verify your email address...</p>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center space-y-6">
                <CheckCircle className="w-16 h-16 text-[#B8FF00] mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Email Verified!</h3>
                  <p className="text-gray-400 mb-4">
                    Your email has been successfully verified. You can now access all platform features.
                  </p>
                </div>

                <Alert className="bg-green-900/20 border-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-green-300">
                    Welcome to NEXURAL Trading! Your account is now fully activated.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <Button 
                    asChild
                    className="w-full bg-gradient-to-r from-[#B8FF00] to-[#00D4FF] text-black"
                  >
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                  
                  <Button 
                    asChild
                    variant="outline"
                    className="w-full border-gray-700"
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                </div>
              </div>
            )}

            {status === 'expired' && (
              <div className="text-center space-y-6">
                <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Link Expired</h3>
                  <p className="text-gray-400 mb-4">
                    This verification link has expired or is invalid. Please request a new one.
                  </p>
                </div>

                <Alert className="bg-red-900/20 border-red-700">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-300">
                    Verification links expire after 24 hours for security reasons.
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={handleResendEmail}
                  className="w-full bg-gradient-to-r from-[#B8FF00] to-[#00D4FF] text-black"
                  disabled={isResending}
                >
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center space-y-6">
                <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Verification Error</h3>
                  <p className="text-gray-400 mb-4">
                    There was an error verifying your email. Please try again or contact support.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handleResendEmail}
                    className="w-full bg-gradient-to-r from-[#B8FF00] to-[#00D4FF] text-black"
                    disabled={isResending}
                  >
                    {isResending ? 'Sending...' : 'Resend Verification Email'}
                  </Button>
                  
                  <Button 
                    asChild
                    variant="outline"
                    className="w-full border-gray-700"
                  >
                    <Link href="/contact">Contact Support</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link 
            href="/login" 
            className="text-[#B8FF00] hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
