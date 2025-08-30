"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, Clock, Award, RotateCcw } from "lucide-react"

interface QuizQuestion {
  id: string
  type: "multiple-choice" | "multiple-select" | "true-false" | "short-answer"
  question: string
  options?: string[]
  correctAnswers: string[]
  explanation?: string
  points: number
  timeLimit?: number
}

interface Quiz {
  id: string
  title: string
  description: string
  questions: QuizQuestion[]
  timeLimit?: number
  passingScore: number
  maxAttempts: number
  showCorrectAnswers: boolean
  shuffleQuestions: boolean
}

interface QuizAttempt {
  id: string
  quizId: string
  userId: string
  answers: Record<string, string[]>
  score: number
  passed: boolean
  startedAt: string
  completedAt?: string
  timeSpent: number
}

interface QuizSystemProps {
  quiz: Quiz
  onComplete: (attempt: QuizAttempt) => void
  previousAttempts?: QuizAttempt[]
  userId: string
}

export default function QuizSystem({ quiz, onComplete, previousAttempts = [], userId }: QuizSystemProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit || 0)
  const [isStarted, setIsStarted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null)
  const [questions, setQuestions] = useState(quiz.questions)

  const attemptsUsed = previousAttempts.length
  const canRetake = attemptsUsed < quiz.maxAttempts
  const bestScore = Math.max(...previousAttempts.map((a) => a.score), 0)

  useEffect(() => {
    if (quiz.shuffleQuestions) {
      setQuestions([...quiz.questions].sort(() => Math.random() - 0.5))
    }
  }, [quiz.questions, quiz.shuffleQuestions])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isStarted && !isCompleted && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isStarted, isCompleted, timeRemaining])

  const startQuiz = () => {
    setIsStarted(true)
    setStartTime(new Date())
    setCurrentQuestionIndex(0)
    setAnswers({})
    setIsCompleted(false)
    setShowResults(false)
    setTimeRemaining(quiz.timeLimit || 0)
  }

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: Array.isArray(answer) ? answer : [answer],
    }))
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const calculateScore = () => {
    let totalPoints = 0
    let earnedPoints = 0

    questions.forEach((question) => {
      totalPoints += question.points
      const userAnswers = answers[question.id] || []
      const correctAnswers = question.correctAnswers

      if (question.type === "multiple-select") {
        const correctCount = userAnswers.filter((a) => correctAnswers.includes(a)).length
        const incorrectCount = userAnswers.filter((a) => !correctAnswers.includes(a)).length
        const missedCount = correctAnswers.filter((a) => !userAnswers.includes(a)).length

        if (incorrectCount === 0 && missedCount === 0) {
          earnedPoints += question.points
        } else {
          const partialCredit = Math.max(0, (correctCount - incorrectCount) / correctAnswers.length)
          earnedPoints += question.points * partialCredit
        }
      } else {
        if (userAnswers.length === 1 && correctAnswers.includes(userAnswers[0])) {
          earnedPoints += question.points
        }
      }
    })

    return Math.round((earnedPoints / totalPoints) * 100)
  }

  const handleSubmit = () => {
    if (!startTime) return

    const score = calculateScore()
    const endTime = new Date()
    const timeSpent = Math.round((endTime.getTime() - startTime.getTime()) / 1000)

    const attempt: QuizAttempt = {
      id: `attempt_${Date.now()}`,
      quizId: quiz.id,
      userId,
      answers,
      score,
      passed: score >= quiz.passingScore,
      startedAt: startTime.toISOString(),
      completedAt: endTime.toISOString(),
      timeSpent,
    }

    setCurrentAttempt(attempt)
    setIsCompleted(true)
    setShowResults(true)
    onComplete(attempt)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const getQuestionResult = (question: QuizQuestion) => {
    if (!currentAttempt) return null

    const userAnswers = currentAttempt.answers[question.id] || []
    const correctAnswers = question.correctAnswers

    if (question.type === "multiple-select") {
      const correctCount = userAnswers.filter((a) => correctAnswers.includes(a)).length
      const incorrectCount = userAnswers.filter((a) => !correctAnswers.includes(a)).length
      const missedCount = correctAnswers.filter((a) => !userAnswers.includes(a)).length

      return {
        isCorrect: incorrectCount === 0 && missedCount === 0,
        isPartial: correctCount > 0 && (incorrectCount > 0 || missedCount > 0),
        userAnswers,
        correctAnswers,
      }
    } else {
      const isCorrect = userAnswers.length === 1 && correctAnswers.includes(userAnswers[0])
      return {
        isCorrect,
        isPartial: false,
        userAnswers,
        correctAnswers,
      }
    }
  }

  if (!isStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            {quiz.title}
          </CardTitle>
          <CardDescription>{quiz.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Questions:</strong> {quiz.questions.length}
            </div>
            <div>
              <strong>Time Limit:</strong> {quiz.timeLimit ? formatTime(quiz.timeLimit) : "No limit"}
            </div>
            <div>
              <strong>Passing Score:</strong> {quiz.passingScore}%
            </div>
            <div>
              <strong>Attempts:</strong> {attemptsUsed}/{quiz.maxAttempts}
            </div>
          </div>

          {previousAttempts.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Previous Attempts</h4>
              <div className="space-y-2">
                {previousAttempts.map((attempt, index) => (
                  <div key={attempt.id} className="flex items-center justify-between text-sm">
                    <span>Attempt {index + 1}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={attempt.passed ? "default" : "destructive"}>{attempt.score}%</Badge>
                      {attempt.passed && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </div>
                  </div>
                ))}
              </div>
              {bestScore > 0 && (
                <div className="mt-2 text-sm">
                  <strong>Best Score:</strong> {bestScore}%
                </div>
              )}
            </div>
          )}

          <Button onClick={startQuiz} disabled={!canRetake} className="w-full">
            {previousAttempts.length > 0 ? "Retake Quiz" : "Start Quiz"}
          </Button>

          {!canRetake && (
            <p className="text-sm text-muted-foreground text-center">
              You have used all {quiz.maxAttempts} attempts for this quiz.
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  if (showResults && currentAttempt) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentAttempt.passed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            Quiz Results
          </CardTitle>
          <CardDescription>
            {currentAttempt.passed
              ? "Congratulations! You passed the quiz."
              : "You didn't pass this time. Keep studying!"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{currentAttempt.score}%</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{formatTime(currentAttempt.timeSpent)}</div>
              <div className="text-sm text-muted-foreground">Time Spent</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {questions.filter((q) => getQuestionResult(q)?.isCorrect).length}/{questions.length}
              </div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
          </div>

          {quiz.showCorrectAnswers && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Question Review</h3>
              {questions.map((question, index) => {
                const result = getQuestionResult(question)
                if (!result) return null

                return (
                  <Card key={question.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {result.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : result.isPartial ? (
                          <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                            <span className="text-xs text-white">½</span>
                          </div>
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">
                          Question {index + 1}: {question.question}
                        </h4>

                        {question.options && (
                          <div className="space-y-1 mb-3">
                            {question.options.map((option, optionIndex) => {
                              const isUserAnswer = result.userAnswers.includes(option)
                              const isCorrect = result.correctAnswers.includes(option)

                              return (
                                <div
                                  key={optionIndex}
                                  className={`p-2 rounded text-sm ${
                                    isCorrect
                                      ? "bg-green-100 text-green-800 border border-green-200"
                                      : isUserAnswer
                                        ? "bg-red-100 text-red-800 border border-red-200"
                                        : "bg-gray-50"
                                  }`}
                                >
                                  {option}
                                  {isCorrect && " ✓"}
                                  {isUserAnswer && !isCorrect && " ✗"}
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {question.explanation && (
                          <div className="bg-blue-50 p-3 rounded text-sm">
                            <strong>Explanation:</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}

          <div className="flex gap-2">
            {canRetake && (
              <Button onClick={startQuiz} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake Quiz
              </Button>
            )}
            <Button onClick={() => setShowResults(false)}>Continue Learning</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Question {currentQuestionIndex + 1} of {questions.length}
          </CardTitle>
          {quiz.timeLimit && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>

          {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
            <RadioGroup
              value={answers[currentQuestion.id]?.[0] || ""}
              onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQuestion.type === "multiple-select" && currentQuestion.options && (
            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`option-${index}`}
                    checked={answers[currentQuestion.id]?.includes(option) || false}
                    onCheckedChange={(checked) => {
                      const currentAnswers = answers[currentQuestion.id] || []
                      if (checked) {
                        handleAnswer(currentQuestion.id, [...currentAnswers, option])
                      } else {
                        handleAnswer(
                          currentQuestion.id,
                          currentAnswers.filter((a) => a !== option),
                        )
                      }
                    }}
                  />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          )}

          {currentQuestion.type === "true-false" && (
            <RadioGroup
              value={answers[currentQuestion.id]?.[0] || ""}
              onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="true" />
                <Label htmlFor="true" className="cursor-pointer">
                  True
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="false" />
                <Label htmlFor="false" className="cursor-pointer">
                  False
                </Label>
              </div>
            </RadioGroup>
          )}

          {currentQuestion.type === "short-answer" && (
            <Textarea
              placeholder="Enter your answer..."
              value={answers[currentQuestion.id]?.[0] || ""}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              className="min-h-[100px]"
            />
          )}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={previousQuestion} disabled={currentQuestionIndex === 0}>
            Previous
          </Button>

          <div className="flex gap-2">
            {currentQuestionIndex === questions.length - 1 ? (
              <Button onClick={handleSubmit}>Submit Quiz</Button>
            ) : (
              <Button onClick={nextQuestion}>Next</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
