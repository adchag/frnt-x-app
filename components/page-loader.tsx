import { Loader2 } from 'lucide-react'
import React from 'react'

interface PageLoaderProps {
  children: React.ReactNode
  isLoading: boolean
}

const PageLoader: React.FC<PageLoaderProps> = ({ children, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}

export default PageLoader