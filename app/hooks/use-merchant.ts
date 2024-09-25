import { useState, useEffect } from 'react'
import { getMerchant, getMerchants, Merchant, MerchantFile } from '@/services/merchant.service'

export const useMerchant = (id?: string) => {
  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [merchantFiles, setMerchantFiles] = useState<MerchantFile[]>([])
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        if (id) {
          const { merchant, files } = await getMerchant(id)
          setMerchant(merchant)
          setMerchantFiles(files)
        } else {
          const data = await getMerchants()
          setMerchants(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  return { merchant, merchantFiles, merchants, isLoading, error }
}