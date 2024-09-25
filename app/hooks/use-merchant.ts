import { useState, useEffect } from 'react'
import { getMerchant, getMerchants, Merchant } from '@/services/merchant.service'
export const useMerchant = (id?: string) => {
  const [merchant, setMerchant] = useState<Merchant | null>(null)
    const [merchants, setMerchants] = useState<Merchant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        if (id) {
          const data = await getMerchant(id)
          setMerchant(data as Merchant)
        } else {
          const data = await getMerchants()
          setMerchants(data as Merchant[])
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  return { merchant, merchants, isLoading, error }
}