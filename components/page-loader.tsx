import { Loader2 } from 'lucide-react'
import React from 'react'

interface PageLoaderProps {
  children: React.ReactNode
  isLoading: boolean
  message?: string // New optional prop
}

const PageLoader: React.FC<PageLoaderProps> = ({ children, isLoading, message = '' }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        {message && <p className="text-sm text-gray-500">{message}</p>}
      </div>
    )
  }

  return <>{children}</>
}

export default PageLoader