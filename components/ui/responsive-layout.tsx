"use client"

import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

// 🎯 RESPONSIVE BREAKPOINTS
export const breakpoints = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

// 🎯 RESPONSIVE HOOK
export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  })

  const [currentBreakpoint, setCurrentBreakpoint] = useState<keyof typeof breakpoints>('lg')

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setWindowSize({ width, height })

      // Determine current breakpoint
      if (width >= breakpoints['2xl']) setCurrentBreakpoint('2xl')
      else if (width >= breakpoints.xl) setCurrentBreakpoint('xl')
      else if (width >= breakpoints.lg) setCurrentBreakpoint('lg')
      else if (width >= breakpoints.md) setCurrentBreakpoint('md')
      else if (width >= breakpoints.sm) setCurrentBreakpoint('sm')
      else setCurrentBreakpoint('xs')
    }

    handleResize() // Set initial values
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    windowSize,
    currentBreakpoint,
    isMobile: windowSize.width < breakpoints.md,
    isTablet: windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg,
    isDesktop: windowSize.width >= breakpoints.lg,
    isLargeDesktop: windowSize.width >= breakpoints.xl,
  }
}

// 🎯 RESPONSIVE CONTAINER
interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: boolean
  center?: boolean
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = 'full',
  padding = true,
  center = true,
  className,
  ...props
}) => {
  const maxWidths = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  }

  return (
    <div
      className={cn(
        'w-full',
        maxWidths[maxWidth],
        center && 'mx-auto',
        padding && 'px-4 sm:px-6 lg:px-8',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// 🎯 RESPONSIVE GRID
interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  autoFit?: boolean
  minItemWidth?: string
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
  autoFit = false,
  minItemWidth = '250px',
  className,
  ...props
}) => {
  const gaps = {
    xs: 'gap-2',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12'
  }

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    12: 'grid-cols-12'
  }

  const responsiveClasses = [
    cols.xs && `grid-cols-${cols.xs}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    cols['2xl'] && `2xl:grid-cols-${cols['2xl']}`
  ].filter(Boolean)

  return (
    <div
      className={cn(
        'grid',
        autoFit 
          ? `grid-cols-[repeat(auto-fit,minmax(${minItemWidth},1fr))]`
          : responsiveClasses,
        gaps[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// 🎯 RESPONSIVE STACK
interface ResponsiveStackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: {
    xs?: 'row' | 'col'
    sm?: 'row' | 'col'
    md?: 'row' | 'col'
    lg?: 'row' | 'col'
    xl?: 'row' | 'col'
  }
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
}

export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  direction = { xs: 'col', md: 'row' },
  gap = 'md',
  align = 'start',
  justify = 'start',
  className,
  ...props
}) => {
  const gaps = {
    xs: 'gap-2',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12'
  }

  const alignments = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  }

  const justifications = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  }

  const directionClasses = [
    direction.xs && `flex-${direction.xs}`,
    direction.sm && `sm:flex-${direction.sm}`,
    direction.md && `md:flex-${direction.md}`,
    direction.lg && `lg:flex-${direction.lg}`,
    direction.xl && `xl:flex-${direction.xl}`
  ].filter(Boolean)

  return (
    <div
      className={cn(
        'flex',
        directionClasses,
        gaps[gap],
        alignments[align],
        justifications[justify],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// 🎯 MOBILE-FIRST SIDEBAR
interface ResponsiveSidebarProps {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  side?: 'left' | 'right'
  width?: string
  overlay?: boolean
}

export const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({
  children,
  isOpen,
  onClose,
  side = 'left',
  width = '280px',
  overlay = true
}) => {
  const { isMobile } = useResponsive()
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Close on outside click (mobile only)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isMobile &&
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobile, isOpen, onClose])

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isMobile, isOpen])

  if (isMobile) {
    return (
      <>
        {/* Mobile overlay */}
        {overlay && isOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={onClose}
          />
        )}

        {/* Mobile sidebar */}
        <div
          ref={sidebarRef}
          className={cn(
            'fixed top-0 z-50 h-full bg-[#15151f] border-r border-[#2a2a3e] transition-transform duration-300 ease-out',
            side === 'left' ? 'left-0' : 'right-0',
            isOpen
              ? 'transform translate-x-0'
              : side === 'left'
                ? 'transform -translate-x-full'
                : 'transform translate-x-full'
          )}
          style={{ width }}
        >
          {children}
        </div>
      </>
    )
  }

  // Desktop sidebar (always visible)
  return (
    <div
      className={cn(
        'h-full bg-[#15151f] border-r border-[#2a2a3e] transition-all duration-300',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      style={{ width: isOpen ? width : '0px' }}
    >
      {isOpen && children}
    </div>
  )
}

// 🎯 RESPONSIVE MODAL
interface ResponsiveModalProps {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  fullScreenOnMobile?: boolean
}

export const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  children,
  isOpen,
  onClose,
  size = 'md',
  fullScreenOnMobile = true
}) => {
  const { isMobile } = useResponsive()
  const modalRef = useRef<HTMLDivElement>(null)

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full'
  }

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          'relative bg-[#15151f] border border-[#2a2a3e] shadow-2xl transition-all duration-300',
          // Desktop styles
          !isMobile && [
            'rounded-xl',
            'mx-4',
            sizes[size],
            'max-h-[90vh]',
            'overflow-auto'
          ],
          // Mobile styles
          isMobile && fullScreenOnMobile && [
            'w-full h-full',
            'rounded-none'
          ],
          // Mobile modal (not fullscreen)
          isMobile && !fullScreenOnMobile && [
            'mx-4 my-8',
            'rounded-xl',
            'max-w-full',
            'max-h-[80vh]',
            'overflow-auto'
          ]
        )}
      >
        {children}
      </div>
    </div>
  )
}

// 🎯 RESPONSIVE TABS
interface ResponsiveTabsProps {
  tabs: Array<{
    id: string
    label: string
    icon?: React.ReactNode
    content: React.ReactNode
  }>
  activeTab: string
  onTabChange: (tabId: string) => void
  variant?: 'default' | 'pills' | 'underline'
  scrollable?: boolean
}

export const ResponsiveTabs: React.FC<ResponsiveTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  scrollable = true
}) => {
  const { isMobile } = useResponsive()
  const tabsRef = useRef<HTMLDivElement>(null)

  const variants = {
    default: {
      container: 'border-b border-[#2a2a3e]',
      tab: 'px-4 py-2 text-sm font-medium transition-colors duration-200',
      active: 'text-[#00bbff] border-b-2 border-[#00bbff]',
      inactive: 'text-[#a0a0b8] hover:text-white'
    },
    pills: {
      container: 'bg-[#2a2a3e] rounded-lg p-1',
      tab: 'px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
      active: 'bg-[#00bbff] text-white',
      inactive: 'text-[#a0a0b8] hover:text-white hover:bg-[#3a3a52]'
    },
    underline: {
      container: '',
      tab: 'px-4 py-2 text-sm font-medium transition-colors duration-200 relative',
      active: 'text-[#00bbff] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#00bbff]',
      inactive: 'text-[#a0a0b8] hover:text-white'
    }
  }

  const currentVariant = variants[variant]

  return (
    <div className="w-full">
      {/* Tab navigation */}
      <div
        ref={tabsRef}
        className={cn(
          'flex',
          currentVariant.container,
          scrollable && isMobile && 'overflow-x-auto scrollbar-hide',
          !scrollable && 'flex-wrap'
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              currentVariant.tab,
              activeTab === tab.id
                ? currentVariant.active
                : currentVariant.inactive,
              isMobile && scrollable && 'flex-shrink-0'
            )}
          >
            <div className="flex items-center gap-2">
              {tab.icon}
              <span className={isMobile ? 'whitespace-nowrap' : ''}>
                {tab.label}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  )
}

// Components are already exported above
