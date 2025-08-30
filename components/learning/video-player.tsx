"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, RotateCcw, RotateCw } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface VideoPlayerProps {
  src: string
  title: string
  chapters: Array<{
    id: string
    title: string
    startTime: number
    duration: number
  }>
  onProgress?: (currentTime: number, duration: number) => void
  onChapterComplete?: (chapterId: string) => void
  initialTime?: number
  autoPlay?: boolean
}

export default function VideoPlayer({
  src,
  title,
  chapters,
  onProgress,
  onChapterComplete,
  initialTime = 0,
  autoPlay = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(initialTime)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentChapter, setCurrentChapter] = useState<string | null>(null)
  const [completedChapters, setCompletedChapters] = useState<Set<string>>(new Set())
  const [showControls, setShowControls] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      if (initialTime > 0) {
        video.currentTime = initialTime
      }
    }

    const handleTimeUpdate = () => {
      const time = video.currentTime
      setCurrentTime(time)
      onProgress?.(time, video.duration)

      // Check for chapter completion
      const chapter = chapters.find((ch) => time >= ch.startTime && time < ch.startTime + ch.duration)

      if (chapter && chapter.id !== currentChapter) {
        setCurrentChapter(chapter.id)
      }

      // Mark chapter as complete when 90% watched
      chapters.forEach((chapter) => {
        const chapterEnd = chapter.startTime + chapter.duration
        const chapterProgress = (time - chapter.startTime) / chapter.duration

        if (chapterProgress >= 0.9 && !completedChapters.has(chapter.id)) {
          setCompletedChapters((prev) => new Set([...prev, chapter.id]))
          onChapterComplete?.(chapter.id)
        }
      })
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleWaiting = () => setIsBuffering(true)
    const handleCanPlay = () => setIsBuffering(false)

    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    video.addEventListener("waiting", handleWaiting)
    video.addEventListener("canplay", handleCanPlay)

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      video.removeEventListener("waiting", handleWaiting)
      video.removeEventListener("canplay", handleCanPlay)
    }
  }, [chapters, currentChapter, completedChapters, initialTime, onProgress, onChapterComplete])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newTime = (value[0] / 100) * duration
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = value[0] / 100
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.volume = volume
      setIsMuted(false)
    } else {
      video.volume = 0
      setIsMuted(true)
    }
  }

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = rate
    setPlaybackRate(rate)
  }

  const skipTime = (seconds: number) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(0, Math.min(duration, currentTime + seconds))
  }

  const jumpToChapter = (chapterId: string) => {
    const chapter = chapters.find((ch) => ch.id === chapterId)
    if (!chapter || !videoRef.current) return

    videoRef.current.currentTime = chapter.startTime
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const showControlsTemporarily = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  return (
    <div
      className="relative bg-black rounded-lg overflow-hidden group"
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video ref={videoRef} src={src} className="w-full h-full" autoPlay={autoPlay} playsInline onClick={togglePlay} />

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Chapter Markers */}
      <div className="absolute bottom-16 left-4 right-4">
        <div className="relative h-1 bg-gray-600 rounded">
          {chapters.map((chapter) => {
            const position = (chapter.startTime / duration) * 100
            return (
              <div
                key={chapter.id}
                className={`absolute top-0 w-1 h-1 rounded cursor-pointer ${
                  completedChapters.has(chapter.id) ? "bg-green-500" : "bg-yellow-500"
                }`}
                style={{ left: `${position}%` }}
                onClick={() => jumpToChapter(chapter.id)}
                title={chapter.title}
              />
            )
          })}
        </div>
      </div>

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => skipTime(-10)} className="text-white hover:bg-white/20">
              <RotateCcw className="w-4 h-4" />
            </Button>

            <Button variant="ghost" size="sm" onClick={togglePlay} className="text-white hover:bg-white/20">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>

            <Button variant="ghost" size="sm" onClick={() => skipTime(10)} className="text-white hover:bg-white/20">
              <RotateCw className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-2 ml-4">
              <Button variant="ghost" size="sm" onClick={toggleMute} className="text-white hover:bg-white/20">
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <div className="w-20">
                <Slider value={[isMuted ? 0 : volume * 100]} onValueChange={handleVolumeChange} max={100} step={1} />
              </div>
            </div>

            <span className="text-white text-sm ml-4">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentChapter && (
              <Badge variant="secondary" className="bg-white/20 text-white">
                {chapters.find((ch) => ch.id === currentChapter)?.title}
              </Badge>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => changePlaybackRate(0.5)}>0.5x Speed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => changePlaybackRate(0.75)}>0.75x Speed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => changePlaybackRate(1)}>Normal Speed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => changePlaybackRate(1.25)}>1.25x Speed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => changePlaybackRate(1.5)}>1.5x Speed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => changePlaybackRate(2)}>2x Speed</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
