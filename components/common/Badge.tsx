import { cn } from '@/lib/utils'

const colorMap = {
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  gray: 'bg-gray-100 text-gray-600',
  blue: 'bg-blue-100 text-blue-800',
  pink: 'bg-pink-100 text-pink-700',
} as const

interface BadgeProps {
  label: string
  color?: keyof typeof colorMap
  className?: string
}

export function Badge({ label, color = 'gray', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', colorMap[color], className)}>
      {label}
    </span>
  )
}
