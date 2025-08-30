import { NextRequest, NextResponse } from "next/server"

// Mock database - In production, this would be your actual database
let jobsDatabase = [
  {
    id: 1,
    title: "Senior Quantitative Developer",
    department: "Engineering",
    location: "New York, NY",
    type: "Full-time",
    salary: "$180k - $280k",
    experience: "5+ years",
    featured: true,
    status: "active",
    description: "Build and optimize high-frequency trading algorithms using cutting-edge AI and machine learning techniques.",
    requirements: [
      "Master's degree in Computer Science, Mathematics, Physics, or related quantitative field",
      "5+ years of experience in quantitative finance, algorithmic trading, or high-performance computing",
      "Expert-level proficiency in Python and C++ with experience in performance optimization"
    ],
    responsibilities: [
      "Design and implement trading algorithms for multiple asset classes",
      "Optimize code for ultra-low latency execution (microsecond level)",
      "Collaborate with researchers to productionize ML models"
    ],
    skills: ["Python", "C++", "Machine Learning", "Statistics", "Finance", "HFT", "Linux"],
    benefits: ["Equity package", "Performance bonuses", "Health insurance", "Remote flexibility"],
    applications: 45,
    views: 1247,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    createdBy: "admin@nexural.com"
  },
  {
    id: 2,
    title: "AI Research Scientist",
    department: "Research",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$200k - $320k",
    experience: "PhD + 3 years",
    featured: true,
    status: "active",
    description: "Lead cutting-edge AI research to develop next-generation trading algorithms and predictive models.",
    requirements: [
      "PhD in Machine Learning, Computer Science, Statistics, or related field",
      "3+ years of experience in AI/ML research with published papers",
      "Experience with deep learning, reinforcement learning, and time-series forecasting"
    ],
    responsibilities: [
      "Research and develop novel ML algorithms for financial markets",
      "Publish research in top-tier conferences and journals", 
      "Mentor junior researchers and collaborate with engineering teams"
    ],
    skills: ["Python", "TensorFlow", "PyTorch", "Research", "Deep Learning", "Statistics"],
    benefits: ["Research budget", "Conference travel", "Publication bonuses", "Flexible hours"],
    applications: 32,
    views: 892,
    createdAt: "2024-01-20T14:30:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
    createdBy: "admin@nexural.com"
  }
]

let nextId = jobsDatabase.length + 1

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const department = searchParams.get('department')
    const featured = searchParams.get('featured')
    
    let filteredJobs = [...jobsDatabase]
    
    // Apply filters
    if (status && status !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.status === status)
    }
    
    if (department && department !== 'all') {
      filteredJobs = filteredJobs.filter(job => 
        job.department.toLowerCase() === department.toLowerCase()
      )
    }
    
    if (featured === 'true') {
      filteredJobs = filteredJobs.filter(job => job.featured)
    }
    
    // Sort by created date (newest first)
    filteredJobs.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    
    return NextResponse.json({
      success: true,
      jobs: filteredJobs,
      total: filteredJobs.length,
      stats: {
        active: jobsDatabase.filter(j => j.status === 'active').length,
        draft: jobsDatabase.filter(j => j.status === 'draft').length,
        closed: jobsDatabase.filter(j => j.status === 'closed').length,
        totalApplications: jobsDatabase.reduce((sum, job) => sum + job.applications, 0),
        totalViews: jobsDatabase.reduce((sum, job) => sum + job.views, 0)
      }
    })
  } catch (error) {
    console.error('Failed to fetch jobs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newJob = {
      id: nextId++,
      ...body,
      applications: 0,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "admin@nexural.com" // In production, get from auth
    }
    
    jobsDatabase.push(newJob)
    
    return NextResponse.json({
      success: true,
      job: newJob,
      message: 'Job created successfully'
    })
  } catch (error) {
    console.error('Failed to create job:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create job' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    
    const jobIndex = jobsDatabase.findIndex(job => job.id === id)
    
    if (jobIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }
    
    jobsDatabase[jobIndex] = {
      ...jobsDatabase[jobIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    }
    
    return NextResponse.json({
      success: true,
      job: jobsDatabase[jobIndex],
      message: 'Job updated successfully'
    })
  } catch (error) {
    console.error('Failed to update job:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update job' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      )
    }
    
    const jobIndex = jobsDatabase.findIndex(job => job.id === parseInt(id))
    
    if (jobIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }
    
    jobsDatabase.splice(jobIndex, 1)
    
    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete job:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete job' },
      { status: 500 }
    )
  }
}

