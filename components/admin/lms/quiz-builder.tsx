"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { 
  FileQuestion,
  Plus,
  Edit3,
  Trash2,
  Save,
  Eye,
  Clock,
  Settings,
  Users,
  Star,
  Target,
  BookOpen,
  Award,
  BarChart3,
  PieChart,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  Copy,
  Shuffle,
  CheckCircle,
  X,
  AlertCircle,
  Info,
  Lightbulb,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Database,
  Upload,
  Download,
  Grid,
  List,
  Type,
  ToggleLeft,
  Hash,
  AlignLeft,
  Image,
  Video,
  Mic,
  Link2,
  Calendar,
  Timer,
  RefreshCw,
  Brain,
  Cpu,
  Layers
} from "lucide-react"
import { toast } from "sonner"
import { Quiz, QuizQuestion, QuizOption, QuizFormData } from "@/lib/lms/models"

interface QuizBuilderProps {
  quizId?: string
  courseId?: string
  moduleId?: string
  onSave?: (quiz: Quiz) => void
  onPublish?: (quiz: Quiz) => void
}

const QUESTION_TYPES = [
  { 
    value: 'multiple_choice', 
    label: '🔘 Multiple Choice', 
    icon: CheckCircle,
    description: 'Single correct answer from multiple options',
    maxPoints: 5
  },
  { 
    value: 'multiple_select', 
    label: '☑️ Multiple Select', 
    icon: Grid,
    description: 'Multiple correct answers from options',
    maxPoints: 10
  },
  { 
    value: 'true_false', 
    label: '✅ True/False', 
    icon: ToggleLeft,
    description: 'Simple true or false question',
    maxPoints: 2
  },
  { 
    value: 'fill_blank', 
    label: '📝 Fill in the Blank', 
    icon: Type,
    description: 'Type the correct answer',
    maxPoints: 5
  },
  { 
    value: 'essay', 
    label: '📄 Essay/Long Answer', 
    icon: AlignLeft,
    description: 'Extended written response',
    maxPoints: 20
  },
  { 
    value: 'matching', 
    label: '🔗 Matching', 
    icon: Link2,
    description: 'Match items from two columns',
    maxPoints: 10
  },
  { 
    value: 'ordering', 
    label: '📋 Ordering', 
    icon: List,
    description: 'Put items in correct sequence',
    maxPoints: 8
  }
]

const QUIZ_TEMPLATES = [
  {
    id: 'quick-check',
    name: '⚡ Quick Check',
    description: '5 questions, 5 minutes, basic understanding',
    settings: {
      timeLimit: 5,
      maxAttempts: 3,
      passingScore: 70,
      shuffleQuestions: false,
      showCorrectAnswers: true,
      instantFeedback: true
    },
    questionCount: 5
  },
  {
    id: 'comprehensive',
    name: '📚 Comprehensive Assessment',
    description: '20 questions, 30 minutes, thorough evaluation',
    settings: {
      timeLimit: 30,
      maxAttempts: 2,
      passingScore: 80,
      shuffleQuestions: true,
      showCorrectAnswers: false,
      instantFeedback: false
    },
    questionCount: 20
  },
  {
    id: 'certification',
    name: '🏆 Certification Exam',
    description: '50 questions, 90 minutes, proctored assessment',
    settings: {
      timeLimit: 90,
      maxAttempts: 1,
      passingScore: 85,
      shuffleQuestions: true,
      showCorrectAnswers: false,
      instantFeedback: false
    },
    questionCount: 50
  },
  {
    id: 'practice',
    name: '🎯 Practice Quiz',
    description: '10 questions, unlimited time, learning focused',
    settings: {
      timeLimit: 0,
      maxAttempts: 999,
      passingScore: 60,
      shuffleQuestions: false,
      showCorrectAnswers: true,
      instantFeedback: true
    },
    questionCount: 10
  }
]

export default function QuizBuilder({ quizId, courseId, moduleId, onSave, onPublish }: QuizBuilderProps) {
  // ===== STATE MANAGEMENT =====
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('builder')
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Form states
  const [quizForm, setQuizForm] = useState<QuizFormData>({
    title: '',
    description: '',
    timeLimit: 30,
    maxAttempts: 3,
    passingScore: 70,
    shuffleQuestions: false,
    shuffleAnswers: false,
    showCorrectAnswers: true,
    allowReview: true,
    instantFeedback: true
  })

  const [newQuestion, setNewQuestion] = useState<Partial<QuizQuestion>>({
    type: 'multiple_choice',
    question: '',
    explanation: '',
    points: 5,
    options: [
      { id: '1', text: '', isCorrect: true, orderIndex: 0 },
      { id: '2', text: '', isCorrect: false, orderIndex: 1 },
      { id: '3', text: '', isCorrect: false, orderIndex: 2 },
      { id: '4', text: '', isCorrect: false, orderIndex: 3 }
    ]
  })

  // ===== MOCK DATA =====
  const mockQuiz: Quiz = {
    id: quizId || 'new-quiz',
    moduleId: moduleId,
    courseId: courseId,
    title: 'Trading Fundamentals Assessment',
    description: 'Test your understanding of basic trading concepts and risk management principles.',
    
    questions: [
      {
        id: 'q1',
        quizId: 'new-quiz',
        type: 'multiple_choice',
        orderIndex: 0,
        question: 'What is the primary purpose of a stop-loss order?',
        explanation: 'Stop-loss orders are designed to limit potential losses by automatically selling a position when it reaches a predetermined price level.',
        points: 5,
        options: [
          { id: 'o1', text: 'To guarantee profits', isCorrect: false, orderIndex: 0 },
          { id: 'o2', text: 'To limit potential losses', isCorrect: true, orderIndex: 1 },
          { id: 'o3', text: 'To increase position size', isCorrect: false, orderIndex: 2 },
          { id: 'o4', text: 'To delay order execution', isCorrect: false, orderIndex: 3 }
        ],
        difficulty: 0.75,
        discriminationIndex: 0.45,
        responseDistribution: { 'o1': 15, 'o2': 70, 'o3': 10, 'o4': 5 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'q2',
        quizId: 'new-quiz',
        type: 'true_false',
        orderIndex: 1,
        question: 'Diversification can eliminate all investment risk.',
        explanation: 'Diversification can reduce unsystematic risk but cannot eliminate systematic risk that affects the entire market.',
        points: 3,
        correctAnswer: 'false',
        difficulty: 0.65,
        discriminationIndex: 0.38,
        responseDistribution: { 'true': 35, 'false': 65 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    
    settings: {
      timeLimit: 30,
      maxAttempts: 3,
      passingScore: 70,
      shuffleQuestions: false,
      shuffleAnswers: false,
      showCorrectAnswers: true,
      allowReview: true,
      instantFeedback: true
    },
    
    totalPoints: 8,
    weightedGrading: false,
    attemptCount: 245,
    averageScore: 73.5,
    completionRate: 89.2,
    averageTime: 18.7,
    
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  useEffect(() => {
    if (quizId) {
      setIsLoading(true)
      // Simulate API call
      setTimeout(() => {
        setQuiz(mockQuiz)
        setQuizForm({
          title: mockQuiz.title,
          description: mockQuiz.description,
          timeLimit: mockQuiz.settings.timeLimit,
          maxAttempts: mockQuiz.settings.maxAttempts,
          passingScore: mockQuiz.settings.passingScore,
          shuffleQuestions: mockQuiz.settings.shuffleQuestions,
          shuffleAnswers: mockQuiz.settings.shuffleAnswers,
          showCorrectAnswers: mockQuiz.settings.showCorrectAnswers,
          allowReview: mockQuiz.settings.allowReview,
          instantFeedback: mockQuiz.settings.instantFeedback
        })
        setIsLoading(false)
      }, 1000)
    } else {
      setQuiz(mockQuiz)
    }
  }, [quizId])

  // ===== EVENT HANDLERS =====
  
  const handleSaveQuiz = async () => {
    setIsSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success("Quiz saved successfully!")
      onSave?.(quiz!)
    } catch (error) {
      toast.error("Failed to save quiz")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublishQuiz = async () => {
    if (!quiz) return
    
    setIsSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success("Quiz published successfully!")
      onPublish?.(quiz)
    } catch (error) {
      toast.error("Failed to publish quiz")
    } finally {
      setIsSaving(false)
    }
  }

  const addQuestion = () => {
    if (!quiz) return

    const question: QuizQuestion = {
      id: `q${Date.now()}`,
      quizId: quiz.id,
      type: newQuestion.type || 'multiple_choice',
      orderIndex: quiz.questions.length,
      question: newQuestion.question || 'New question',
      explanation: newQuestion.explanation,
      points: newQuestion.points || 5,
      options: newQuestion.options,
      difficulty: 0,
      discriminationIndex: 0,
      responseDistribution: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setQuiz(prev => prev ? {
      ...prev,
      questions: [...prev.questions, question],
      totalPoints: prev.totalPoints + question.points
    } : prev)

    // Reset new question form
    setNewQuestion({
      type: 'multiple_choice',
      question: '',
      explanation: '',
      points: 5,
      options: [
        { id: '1', text: '', isCorrect: true, orderIndex: 0 },
        { id: '2', text: '', isCorrect: false, orderIndex: 1 },
        { id: '3', text: '', isCorrect: false, orderIndex: 2 },
        { id: '4', text: '', isCorrect: false, orderIndex: 3 }
      ]
    })

    toast.success("New question added!")
  }

  const deleteQuestion = (questionId: string) => {
    if (!quiz) return

    const question = quiz.questions.find(q => q.id === questionId)
    if (!question) return

    setQuiz(prev => prev ? {
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId),
      totalPoints: prev.totalPoints - question.points
    } : prev)

    toast.success("Question deleted")
  }

  const duplicateQuestion = (questionId: string) => {
    if (!quiz) return

    const question = quiz.questions.find(q => q.id === questionId)
    if (!question) return

    const duplicatedQuestion: QuizQuestion = {
      ...question,
      id: `q${Date.now()}`,
      orderIndex: quiz.questions.length,
      question: `${question.question} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setQuiz(prev => prev ? {
      ...prev,
      questions: [...prev.questions, duplicatedQuestion],
      totalPoints: prev.totalPoints + duplicatedQuestion.points
    } : prev)

    toast.success("Question duplicated!")
  }

  const reorderQuestions = (newOrder: QuizQuestion[]) => {
    const reorderedQuestions = newOrder.map((question, index) => ({
      ...question,
      orderIndex: index
    }))
    
    setQuiz(prev => prev ? {
      ...prev,
      questions: reorderedQuestions
    } : prev)
  }

  const applyTemplate = (templateId: string) => {
    const template = QUIZ_TEMPLATES.find(t => t.id === templateId)
    if (!template) return

    setQuizForm(prev => ({
      ...prev,
      timeLimit: template.settings.timeLimit,
      maxAttempts: template.settings.maxAttempts,
      passingScore: template.settings.passingScore,
      shuffleQuestions: template.settings.shuffleQuestions,
      showCorrectAnswers: template.settings.showCorrectAnswers,
      instantFeedback: template.settings.instantFeedback
    }))

    toast.success(`Applied ${template.name} template!`)
  }

  const addOption = () => {
    if (!newQuestion.options) {
      setNewQuestion(prev => ({ ...prev, options: [] }))
      return
    }

    const newOption: QuizOption = {
      id: `option-${Date.now()}`,
      text: '',
      isCorrect: false,
      orderIndex: newQuestion.options.length
    }

    setNewQuestion(prev => ({
      ...prev,
      options: [...(prev.options || []), newOption]
    }))
  }

  const removeOption = (optionIndex: number) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options?.filter((_, index) => index !== optionIndex)
    }))
  }

  // ===== COMPUTED VALUES =====
  const quizStats = useMemo(() => {
    if (!quiz) return { totalQuestions: 0, totalPoints: 0, averagePoints: 0 }
    
    return {
      totalQuestions: quiz.questions.length,
      totalPoints: quiz.totalPoints,
      averagePoints: quiz.questions.length > 0 ? quiz.totalPoints / quiz.questions.length : 0
    }
  }, [quiz])

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-purple-500 mb-4" />
            <p className="text-gray-400">Loading quiz builder...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <FileQuestion className="w-8 h-8 mr-3 text-purple-400" />
            {quizId ? 'Edit Quiz' : 'Create New Quiz'}
          </h1>
          <p className="text-gray-400">
            Build engaging assessments with professional quiz builder tools
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setShowPreview(!showPreview)}
            className="bg-gray-800 border-gray-700 hover:bg-gray-700"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          
          <Button 
            onClick={handleSaveQuiz} 
            disabled={isSaving}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Quiz'}
          </Button>
          
          <Button 
            onClick={handlePublishQuiz} 
            disabled={isSaving || !quiz?.title}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Publish Quiz
          </Button>
        </div>
      </div>

      {/* ===== QUIZ STATUS BANNER ===== */}
      {quiz && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-4 border border-purple-800/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <FileQuestion className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">{quiz.title || 'Untitled Quiz'}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">{quizStats.totalQuestions} questions</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">{quizStats.totalPoints} points</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">{quizForm.timeLimit || 'No'} time limit</span>
              </div>

              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">{quiz.attemptCount} attempts</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Progress value={quiz.averageScore} className="w-24 h-2" />
              <span className="text-sm text-gray-300">{quiz.averageScore}% avg score</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== MAIN TABS ===== */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-gray-900 border border-gray-800">
          <TabsTrigger value="builder" className="data-[state=active]:bg-purple-600">
            🔧 Builder
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">
            ⚙️ Settings
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-purple-600">
            📋 Templates
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">
            📊 Analytics
          </TabsTrigger>
          <TabsTrigger value="preview" className="data-[state=active]:bg-purple-600">
            👁️ Preview
          </TabsTrigger>
          <TabsTrigger value="bank" className="data-[state=active]:bg-purple-600">
            🏦 Question Bank
          </TabsTrigger>
        </TabsList>

        {/* ===== BUILDER TAB ===== */}
        <TabsContent value="builder" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quiz Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Info className="w-5 h-5 mr-2" />
                    Quiz Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="quiz-title" className="text-white">Quiz Title *</Label>
                    <Input
                      id="quiz-title"
                      value={quizForm.title}
                      onChange={(e) => setQuizForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter quiz title..."
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="quiz-description" className="text-white">Description</Label>
                    <Textarea
                      id="quiz-description"
                      value={quizForm.description}
                      onChange={(e) => setQuizForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the quiz purpose and content..."
                      rows={3}
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Questions List */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-white flex items-center">
                      <List className="w-5 h-5 mr-2" />
                      Questions ({quizStats.totalQuestions})
                    </CardTitle>
                    <Button onClick={addQuestion} size="sm" className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {quiz?.questions && quiz.questions.length > 0 ? (
                      <Reorder.Group values={quiz.questions} onReorder={reorderQuestions}>
                        {quiz.questions.map((question, index) => (
                          <Reorder.Item key={question.id} value={question}>
                            <motion.div
                              layout
                              className="p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-3"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <Badge className="bg-purple-600">Q{index + 1}</Badge>
                                    <Badge variant="outline" className="text-gray-300">
                                      {QUESTION_TYPES.find(t => t.value === question.type)?.label}
                                    </Badge>
                                    <Badge className="bg-yellow-600">{question.points} pts</Badge>
                                  </div>
                                  <p className="text-white font-medium mb-2">{question.question}</p>
                                  {question.explanation && (
                                    <p className="text-gray-400 text-sm">{question.explanation}</p>
                                  )}
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => duplicateQuestion(question.id)}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Edit3 className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-red-400"
                                    onClick={() => deleteQuestion(question.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              {/* Question Options Preview */}
                              {question.options && question.options.length > 0 && (
                                <div className="space-y-1">
                                  {question.options.map((option) => (
                                    <div 
                                      key={option.id} 
                                      className={`flex items-center space-x-2 text-sm p-2 rounded ${
                                        option.isCorrect ? 'bg-green-900/30 text-green-300' : 'text-gray-400'
                                      }`}
                                    >
                                      <div className={`w-2 h-2 rounded-full ${
                                        option.isCorrect ? 'bg-green-400' : 'bg-gray-500'
                                      }`} />
                                      <span>{option.text || 'Empty option'}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    ) : (
                      <div className="text-center py-12">
                        <FileQuestion className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400 mb-4">No questions added yet</p>
                        <Button onClick={addQuestion} className="bg-purple-600 hover:bg-purple-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Question
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - New Question Form */}
            <div className="space-y-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Add New Question</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Question Type */}
                  <div>
                    <Label className="text-white">Question Type</Label>
                    <Select
                      value={newQuestion.type}
                      onValueChange={(value) => setNewQuestion(prev => ({ ...prev, type: value as any }))}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {QUESTION_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="space-y-1">
                              <div>{type.label}</div>
                              <div className="text-xs text-gray-400">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Question Text */}
                  <div>
                    <Label className="text-white">Question</Label>
                    <Textarea
                      value={newQuestion.question}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                      placeholder="Enter your question..."
                      rows={3}
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                    />
                  </div>

                  {/* Points */}
                  <div>
                    <Label className="text-white">Points: {newQuestion.points}</Label>
                    <Slider
                      value={[newQuestion.points || 5]}
                      onValueChange={([value]) => setNewQuestion(prev => ({ ...prev, points: value }))}
                      max={20}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  {/* Options for Multiple Choice/Select */}
                  {(newQuestion.type === 'multiple_choice' || newQuestion.type === 'multiple_select') && (
                    <div>
                      <div className="flex justify-between items-center">
                        <Label className="text-white">Answer Options</Label>
                        <Button size="sm" variant="outline" onClick={addOption}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2 mt-2">
                        {newQuestion.options?.map((option, index) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <Switch
                              checked={option.isCorrect}
                              onCheckedChange={(checked) => {
                                const updatedOptions = [...(newQuestion.options || [])]
                                if (newQuestion.type === 'multiple_choice') {
                                  // Single correct answer
                                  updatedOptions.forEach((opt, i) => {
                                    opt.isCorrect = i === index && checked
                                  })
                                } else {
                                  // Multiple correct answers
                                  updatedOptions[index].isCorrect = checked
                                }
                                setNewQuestion(prev => ({ ...prev, options: updatedOptions }))
                              }}
                            />
                            <Input
                              value={option.text}
                              onChange={(e) => {
                                const updatedOptions = [...(newQuestion.options || [])]
                                updatedOptions[index].text = e.target.value
                                setNewQuestion(prev => ({ ...prev, options: updatedOptions }))
                              }}
                              placeholder={`Option ${index + 1}`}
                              className="bg-gray-800 border-gray-700 text-white"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeOption(index)}
                              className="text-red-400"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Explanation */}
                  <div>
                    <Label className="text-white">Explanation (Optional)</Label>
                    <Textarea
                      value={newQuestion.explanation}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                      placeholder="Explain why this is the correct answer..."
                      rows={2}
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                    />
                  </div>

                  <Button onClick={addQuestion} className="w-full bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </CardContent>
              </Card>

              {/* Quiz Stats */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Quiz Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Questions:</span>
                      <Badge className="bg-purple-600">{quizStats.totalQuestions}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Points:</span>
                      <Badge className="bg-yellow-600">{quizStats.totalPoints}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg Points:</span>
                      <Badge className="bg-blue-600">{quizStats.averagePoints.toFixed(1)}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Time Limit:</span>
                      <Badge className="bg-green-600">{quizForm.timeLimit || 'None'}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ===== SETTINGS TAB ===== */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quiz Configuration */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Quiz Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Time Limit */}
                <div>
                  <Label className="text-white">Time Limit (minutes): {quizForm.timeLimit || 'No limit'}</Label>
                  <Slider
                    value={[quizForm.timeLimit || 0]}
                    onValueChange={([value]) => setQuizForm(prev => ({ ...prev, timeLimit: value }))}
                    max={120}
                    min={0}
                    step={5}
                    className="mt-2"
                  />
                  <p className="text-gray-400 text-sm mt-1">Set to 0 for no time limit</p>
                </div>

                {/* Max Attempts */}
                <div>
                  <Label className="text-white">Maximum Attempts: {quizForm.maxAttempts}</Label>
                  <Slider
                    value={[quizForm.maxAttempts]}
                    onValueChange={([value]) => setQuizForm(prev => ({ ...prev, maxAttempts: value }))}
                    max={10}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>

                {/* Passing Score */}
                <div>
                  <Label className="text-white">Passing Score: {quizForm.passingScore}%</Label>
                  <Slider
                    value={[quizForm.passingScore]}
                    onValueChange={([value]) => setQuizForm(prev => ({ ...prev, passingScore: value }))}
                    max={100}
                    min={50}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quiz Behavior */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  Quiz Behavior
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div>
                      <Label className="text-white">Shuffle Questions</Label>
                      <p className="text-gray-400 text-sm">Randomize question order</p>
                    </div>
                    <Switch
                      checked={quizForm.shuffleQuestions}
                      onCheckedChange={(checked) => setQuizForm(prev => ({ ...prev, shuffleQuestions: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div>
                      <Label className="text-white">Shuffle Answers</Label>
                      <p className="text-gray-400 text-sm">Randomize answer options</p>
                    </div>
                    <Switch
                      checked={quizForm.shuffleAnswers}
                      onCheckedChange={(checked) => setQuizForm(prev => ({ ...prev, shuffleAnswers: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div>
                      <Label className="text-white">Show Correct Answers</Label>
                      <p className="text-gray-400 text-sm">Display correct answers after submission</p>
                    </div>
                    <Switch
                      checked={quizForm.showCorrectAnswers}
                      onCheckedChange={(checked) => setQuizForm(prev => ({ ...prev, showCorrectAnswers: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div>
                      <Label className="text-white">Allow Review</Label>
                      <p className="text-gray-400 text-sm">Let students review answers before submitting</p>
                    </div>
                    <Switch
                      checked={quizForm.allowReview}
                      onCheckedChange={(checked) => setQuizForm(prev => ({ ...prev, allowReview: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div>
                      <Label className="text-white">Instant Feedback</Label>
                      <p className="text-gray-400 text-sm">Show results immediately after each question</p>
                    </div>
                    <Switch
                      checked={quizForm.instantFeedback}
                      onCheckedChange={(checked) => setQuizForm(prev => ({ ...prev, instantFeedback: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== TEMPLATES TAB ===== */}
        <TabsContent value="templates" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Quiz Templates</h2>
            <p className="text-gray-400 mb-6">Quick start with pre-configured quiz templates</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {QUIZ_TEMPLATES.map(template => (
              <Card key={template.id} className="bg-gray-900 border-gray-800 hover:border-purple-600 transition-colors">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>{template.name}</span>
                    <Badge className="bg-purple-600">{template.questionCount}Q</Badge>
                  </CardTitle>
                  <p className="text-gray-400">{template.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">
                        {template.settings.timeLimit ? `${template.settings.timeLimit}m` : 'No limit'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RotateCcw className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{template.settings.maxAttempts} attempts</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{template.settings.passingScore}% to pass</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shuffle className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">
                        {template.settings.shuffleQuestions ? 'Shuffled' : 'Fixed order'}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => applyTemplate(template.id)} 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Apply Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ===== ANALYTICS TAB ===== */}
        <TabsContent value="analytics" className="space-y-6">
          {quiz && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400">Total Attempts</p>
                      <p className="text-2xl font-bold text-white">{quiz.attemptCount}</p>
                    </div>
                    <Users className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400">Average Score</p>
                      <p className="text-2xl font-bold text-white">{quiz.averageScore}%</p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400">Completion Rate</p>
                      <p className="text-2xl font-bold text-white">{quiz.completionRate}%</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400">Average Time</p>
                      <p className="text-2xl font-bold text-white">{quiz.averageTime}m</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Question Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <PieChart className="w-12 h-12 mx-auto mb-4" />
                  <p>Question analytics charts will be implemented here</p>
                  <p className="text-sm">Individual question difficulty, discrimination index, and response patterns</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== PREVIEW TAB ===== */}
        <TabsContent value="preview" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Quiz Preview</CardTitle>
              <p className="text-gray-400">See how your quiz will appear to students</p>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-800 rounded-lg p-8">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-white mb-4">{quizForm.title || 'Quiz Title'}</h1>
                  <p className="text-gray-300 text-lg mb-6">{quizForm.description || 'Quiz description'}</p>
                  
                  <div className="flex items-center justify-center space-x-6 mb-6">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{quizStats.totalQuestions} questions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-300">{quizStats.totalPoints} points</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">
                        {quizForm.timeLimit ? `${quizForm.timeLimit} minutes` : 'No time limit'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-4 mb-8">
                    <Badge className="bg-purple-600">Passing Score: {quizForm.passingScore}%</Badge>
                    <Badge className="bg-blue-600">Max Attempts: {quizForm.maxAttempts}</Badge>
                  </div>
                </div>

                {/* Sample Questions Preview */}
                {quiz?.questions && quiz.questions.length > 0 && (
                  <div className="space-y-6">
                    <h3 className="text-white font-semibold">Sample Questions:</h3>
                    {quiz.questions.slice(0, 2).map((question, index) => (
                      <div key={question.id} className="p-4 bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-2 mb-3">
                          <Badge className="bg-purple-600">Q{index + 1}</Badge>
                          <Badge className="bg-yellow-600">{question.points} pts</Badge>
                        </div>
                        <p className="text-white font-medium mb-4">{question.question}</p>
                        
                        {question.options && question.options.length > 0 && (
                          <div className="space-y-2">
                            {question.options.map((option) => (
                              <div key={option.id} className="flex items-center space-x-3 p-2 bg-gray-600 rounded">
                                <div className="w-4 h-4 border border-gray-400 rounded" />
                                <span className="text-gray-300">{option.text}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {quiz.questions.length > 2 && (
                      <div className="text-center">
                        <p className="text-gray-400">... and {quiz.questions.length - 2} more questions</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== QUESTION BANK TAB ===== */}
        <TabsContent value="bank" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Question Bank
              </CardTitle>
              <p className="text-gray-400">Browse and reuse questions from your question bank</p>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Database className="w-12 h-12 mx-auto mb-4" />
                  <p>Question bank will be implemented here</p>
                  <p className="text-sm">Save, categorize, and reuse questions across multiple quizzes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

