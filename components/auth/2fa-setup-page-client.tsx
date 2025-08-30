'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, Smartphone, Key, Copy, CheckCircle, QrCode } from 'lucide-react'
import Link from 'next/link'

export default function TwoFactorSetupPageClient() {
  const [step, setStep] = useState(1)
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState([
    'A1B2-C3D4-E5F6',
    'G7H8-I9J0-K1L2',
    'M3N4-O5P6-Q7R8',
    'S9T0-U1V2-W3X4',
    'Y5Z6-A7B8-C9D0',
    'E1F2-G3H4-I5J6',
    'K7L8-M9N0-O1P2',
    'Q3R4-S5T6-U7V8'
  ])
  const [isEnabled, setIsEnabled] = useState(false)

  const secretKey = 'JBSWY3DPEHPK3PXP'
  const qrCodeUrl = `otpauth://totp/NEXURAL%20Trading:user@example.com?secret=${secretKey}&issuer=NEXURAL%20Trading`

  const handleVerify = () => {
    if (verificationCode.length === 6) {
      setIsEnabled(true)
      setStep(3)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#B8FF00] to-[#00D4FF] bg-clip-text text-transparent mb-4">
            Two-Factor Authentication
          </h1>
          <p className="text-gray-400">Add an extra layer of security to your account</p>
        </div>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardContent className="p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Shield className="w-12 h-12 text-[#B8FF00] mx-auto mb-4" />
                  <h2 className="text-2xl font-bold">Setup Authenticator App</h2>
                  <p className="text-gray-400">Choose your preferred authentication method</p>
                </div>

                <Tabs defaultValue="app" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                    <TabsTrigger value="app">Authenticator App</TabsTrigger>
                    <TabsTrigger value="sms">SMS (Coming Soon)</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="app" className="space-y-6">
                    <Alert className="bg-blue-900/20 border-blue-700">
                      <Smartphone className="h-4 w-4" />
                      <AlertDescription className="text-blue-300">
                        Download an authenticator app like Google Authenticator, Authy, or 1Password to get started.
                      </AlertDescription>
                    </Alert>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold">Step 1: Scan QR Code</h3>
                        <div className="bg-white p-4 rounded-lg">
                          <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center mx-auto">
                            <QrCode className="w-24 h-24 text-gray-600" />
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 text-center">
                          Scan this QR code with your authenticator app
                        </p>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold">Step 2: Manual Entry</h3>
                        <p className="text-sm text-gray-400">
                          Can't scan? Enter this key manually:
                        </p>
                        <div className="bg-gray-800 p-3 rounded-lg flex items-center justify-between">
                          <code className="text-[#B8FF00] font-mono text-sm">{secretKey}</code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(secretKey)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-400">
                          <p><strong>Account:</strong> user@example.com</p>
                          <p><strong>Issuer:</strong> NEXURAL Trading</p>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => setStep(2)}
                      className="w-full bg-gradient-to-r from-[#B8FF00] to-[#00D4FF] text-black"
                    >
                      I've Added the Account
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="sms" className="space-y-6">
                    <Alert className="bg-yellow-900/20 border-yellow-700">
                      <AlertDescription className="text-yellow-300">
                        SMS authentication is coming soon. Please use an authenticator app for now.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Key className="w-12 h-12 text-[#B8FF00] mx-auto mb-4" />
                  <h2 className="text-2xl font-bold">Verify Setup</h2>
                  <p className="text-gray-400">Enter the 6-digit code from your authenticator app</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="code">Verification Code</Label>
                    <Input
                      id="code"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-center text-2xl tracking-widest"
                      maxLength={6}
                    />
                  </div>

                  <Alert className="bg-gray-800/50 border-gray-700">
                    <AlertDescription className="text-gray-300">
                      The code changes every 30 seconds. Make sure to enter the current code.
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="flex-1 border-gray-700"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleVerify}
                    disabled={verificationCode.length !== 6}
                    className="flex-1 bg-gradient-to-r from-[#B8FF00] to-[#00D4FF] text-black"
                  >
                    Verify & Enable
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <CheckCircle className="w-16 h-16 text-[#B8FF00] mx-auto mb-4" />
                  <h2 className="text-2xl font-bold">2FA Enabled Successfully!</h2>
                  <p className="text-gray-400">Your account is now more secure</p>
                </div>

                <Alert className="bg-green-900/20 border-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-green-300">
                    Two-factor authentication has been enabled for your account.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <h3 className="font-semibold">Backup Recovery Codes</h3>
                  <p className="text-sm text-gray-400">
                    Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                  </p>
                  
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="text-[#B8FF00]">{code}</div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(backupCodes.join('\n'))}
                      className="border-gray-700"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Codes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-700"
                    >
                      Download Codes
                    </Button>
                  </div>
                </div>

                <Alert className="bg-red-900/20 border-red-700">
                  <AlertDescription className="text-red-300">
                    <strong>Important:</strong> Each backup code can only be used once. Generate new codes if you run out.
                  </AlertDescription>
                </Alert>

                <Button 
                  asChild
                  className="w-full bg-gradient-to-r from-[#B8FF00] to-[#00D4FF] text-black"
                >
                  <Link href="/profile/security">Go to Security Settings</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link 
            href="/dashboard" 
            className="text-[#B8FF00] hover:underline"
          >
            Skip for now (Not recommended)
          </Link>
        </div>
      </div>
    </div>
  )
}
