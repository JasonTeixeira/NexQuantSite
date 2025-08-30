import { NextRequest, NextResponse } from "next/server"
import { performSecurityCheck, sanitizeInput } from "@/lib/security-utils"

// File upload settings
const UPLOAD_SETTINGS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  allowedDocumentTypes: ['pdf', 'doc', 'docx', 'txt', 'md'],
  allowedCodeTypes: ['js', 'ts', 'jsx', 'tsx', 'py', 'cpp', 'c', 'java', 'html', 'css', 'json', 'xml'],
  allowedArchiveTypes: ['zip'],
  uploadPath: '/uploads/blog/', // In production, use cloud storage
  virusScanEnabled: true,
  contentScanEnabled: true
}

// Mock virus/malware signatures for scanning
const MALICIOUS_PATTERNS = {
  // Common malware signatures
  virus: [
    /EICAR-STANDARD-ANTIVIRUS-TEST-FILE/gi,
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:.*?/gi,
    /vbscript:.*?/gi,
    /data:.*?base64/gi,
  ],
  
  // Code injection patterns
  injection: [
    /eval\s*\(/gi,
    /exec\s*\(/gi,
    /system\s*\(/gi,
    /shell_exec\s*\(/gi,
    /passthru\s*\(/gi,
    /file_get_contents\s*\(/gi,
    /readfile\s*\(/gi,
    /fopen\s*\(/gi,
    /include\s*\(/gi,
    /require\s*\(/gi,
  ],
  
  // Suspicious patterns
  suspicious: [
    /\$_GET\[/gi,
    /\$_POST\[/gi,
    /\$_REQUEST\[/gi,
    /\$_COOKIE\[/gi,
    /\$_SERVER\[/gi,
    /rm\s+-rf/gi,
    /wget\s+http/gi,
    /curl\s+.*?http/gi,
  ]
}

interface UploadedFile {
  id: string
  originalName: string
  fileName: string
  fileType: string
  fileSize: number
  uploadPath: string
  authorId: string
  authorType: 'master' | 'guest'
  scanResults: {
    virusScan: 'clean' | 'infected' | 'suspicious'
    contentScan: 'safe' | 'dangerous' | 'warning'
    threats: string[]
  }
  uploadedAt: string
  approved: boolean
}

// Mock file storage - In production, use cloud storage or database
let uploadedFiles: UploadedFile[] = []

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const authorId = formData.get('authorId') as string
    const authorType = formData.get('authorType') as string || 'guest'
    const postId = formData.get('postId') as string
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }
    
    if (!authorId) {
      return NextResponse.json(
        { success: false, error: 'Author ID is required' },
        { status: 400 }
      )
    }
    
    // Validate file size
    if (file.size > UPLOAD_SETTINGS.maxFileSize) {
      return NextResponse.json(
        { success: false, error: `File size exceeds limit of ${UPLOAD_SETTINGS.maxFileSize / 1024 / 1024}MB` },
        { status: 400 }
      )
    }
    
    // Get file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''
    const allAllowedTypes = [
      ...UPLOAD_SETTINGS.allowedImageTypes,
      ...UPLOAD_SETTINGS.allowedDocumentTypes,
      ...UPLOAD_SETTINGS.allowedCodeTypes,
      ...UPLOAD_SETTINGS.allowedArchiveTypes
    ]
    
    if (!allAllowedTypes.includes(fileExtension)) {
      return NextResponse.json(
        { success: false, error: `File type .${fileExtension} is not allowed` },
        { status: 400 }
      )
    }
    
    // Read file content for scanning
    const fileBuffer = await file.arrayBuffer()
    const fileContent = new TextDecoder().decode(fileBuffer)
    const fileName = sanitizeInput(file.name)
    
    // Perform security scanning
    const scanResults = await performComprehensiveScan(fileContent, fileName, fileExtension)
    
    // Determine if file should be auto-approved
    const autoApprove = authorType === 'master' || 
                      (scanResults.virusScan === 'clean' && scanResults.contentScan === 'safe')
    
    // Generate unique file ID and path
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2)}`
    const uniqueFileName = `${fileId}.${fileExtension}`
    const uploadPath = `${UPLOAD_SETTINGS.uploadPath}${uniqueFileName}`
    
    // Create file record
    const uploadedFile: UploadedFile = {
      id: fileId,
      originalName: fileName,
      fileName: uniqueFileName,
      fileType: fileExtension,
      fileSize: file.size,
      uploadPath,
      authorId,
      authorType: authorType as 'master' | 'guest',
      scanResults,
      uploadedAt: new Date().toISOString(),
      approved: autoApprove
    }
    
    // Store file record
    uploadedFiles.push(uploadedFile)
    
    // In production, you would:
    // 1. Save the actual file to cloud storage (AWS S3, Google Cloud, etc.)
    // 2. Run real virus scanning (ClamAV, VirusTotal API, etc.)
    // 3. Store file metadata in database
    // 4. Generate secure download URLs
    
    const response = {
      success: true,
      file: {
        id: uploadedFile.id,
        originalName: uploadedFile.originalName,
        fileName: uploadedFile.fileName,
        fileType: uploadedFile.fileType,
        fileSize: uploadedFile.fileSize,
        uploadPath: uploadedFile.uploadPath,
        approved: uploadedFile.approved,
        scanResults: uploadedFile.scanResults,
        downloadUrl: `/api/blog/upload/${fileId}`, // Secure download endpoint
        embedUrl: UPLOAD_SETTINGS.allowedImageTypes.includes(fileExtension) 
          ? `/api/blog/upload/${fileId}` 
          : null
      },
      message: uploadedFile.approved 
        ? 'File uploaded and approved successfully'
        : 'File uploaded and is pending approval'
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { success: false, error: 'File upload failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const authorId = searchParams.get('authorId')
    const approved = searchParams.get('approved')
    const fileType = searchParams.get('fileType')
    
    let filteredFiles = [...uploadedFiles]
    
    // Apply filters
    if (authorId) {
      filteredFiles = filteredFiles.filter(file => file.authorId === authorId)
    }
    
    if (approved !== null) {
      filteredFiles = filteredFiles.filter(file => 
        file.approved === (approved === 'true')
      )
    }
    
    if (fileType) {
      const typeCategory = getFileTypeCategory(fileType)
      filteredFiles = filteredFiles.filter(file => 
        getFileTypeCategory(file.fileType) === typeCategory
      )
    }
    
    // Sort by upload date (newest first)
    filteredFiles.sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )
    
    return NextResponse.json({
      success: true,
      files: filteredFiles,
      total: filteredFiles.length,
      stats: {
        totalFiles: uploadedFiles.length,
        approvedFiles: uploadedFiles.filter(f => f.approved).length,
        pendingFiles: uploadedFiles.filter(f => !f.approved).length,
        infectedFiles: uploadedFiles.filter(f => f.scanResults.virusScan !== 'clean').length
      }
    })
  } catch (error) {
    console.error('Failed to fetch files:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch files' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileId, action, approved } = body
    
    const fileIndex = uploadedFiles.findIndex(file => file.id === fileId)
    
    if (fileIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      )
    }
    
    const file = uploadedFiles[fileIndex]
    
    if (action === 'approve') {
      file.approved = true
    } else if (action === 'reject') {
      file.approved = false
    } else if (approved !== undefined) {
      file.approved = approved
    }
    
    return NextResponse.json({
      success: true,
      file,
      message: `File ${file.approved ? 'approved' : 'rejected'} successfully`
    })
  } catch (error) {
    console.error('Failed to update file:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update file' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fileId = searchParams.get('fileId')
    
    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'File ID is required' },
        { status: 400 }
      )
    }
    
    const fileIndex = uploadedFiles.findIndex(file => file.id === fileId)
    
    if (fileIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      )
    }
    
    const deletedFile = uploadedFiles.splice(fileIndex, 1)[0]
    
    // In production, also delete the actual file from storage
    
    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
      deletedFile
    })
  } catch (error) {
    console.error('Failed to delete file:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}

// Comprehensive security scanning function
async function performComprehensiveScan(
  content: string, 
  fileName: string, 
  fileExtension: string
): Promise<{
  virusScan: 'clean' | 'infected' | 'suspicious'
  contentScan: 'safe' | 'dangerous' | 'warning' 
  threats: string[]
}> {
  const threats: string[] = []
  let virusScan: 'clean' | 'infected' | 'suspicious' = 'clean'
  let contentScan: 'safe' | 'dangerous' | 'warning' = 'safe'
  
  // Virus signature scanning
  for (const [category, patterns] of Object.entries(MALICIOUS_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(content) || pattern.test(fileName)) {
        threats.push(`${category.toUpperCase()}: Malicious pattern detected`)
        
        if (category === 'virus') {
          virusScan = 'infected'
          contentScan = 'dangerous'
        } else if (category === 'injection') {
          virusScan = 'suspicious'
          contentScan = 'dangerous'
        } else {
          virusScan = 'suspicious'
          contentScan = 'warning'
        }
      }
    }
  }
  
  // File-specific checks
  if (UPLOAD_SETTINGS.allowedCodeTypes.includes(fileExtension)) {
    // Additional checks for code files
    const codeSecurityCheck = performSecurityCheck(content)
    if (!codeSecurityCheck.isSafe) {
      threats.push(...codeSecurityCheck.threats)
      contentScan = 'warning'
    }
  }
  
  // Check for suspicious file names
  const suspiciousNames = [
    /malware/gi,
    /virus/gi,
    /trojan/gi,
    /backdoor/gi,
    /keylogger/gi,
    /rootkit/gi
  ]
  
  for (const pattern of suspiciousNames) {
    if (pattern.test(fileName)) {
      threats.push('FILENAME: Suspicious file name detected')
      virusScan = 'suspicious'
      contentScan = 'warning'
    }
  }
  
  return { virusScan, contentScan, threats }
}

function getFileTypeCategory(extension: string): string {
  if (UPLOAD_SETTINGS.allowedImageTypes.includes(extension)) return 'image'
  if (UPLOAD_SETTINGS.allowedDocumentTypes.includes(extension)) return 'document'
  if (UPLOAD_SETTINGS.allowedCodeTypes.includes(extension)) return 'code'
  if (UPLOAD_SETTINGS.allowedArchiveTypes.includes(extension)) return 'archive'
  return 'other'
}

