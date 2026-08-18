import React from 'react'
import * as Icons from 'lucide-react'

export default function CategoryIcon({ name, size = 18, color, className = '' }) {
  const IconComponent = Icons[name] || Icons.Tag
  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{ color: color || 'currentColor' }}
    >
      <IconComponent size={size} />
    </span>
  )
}
