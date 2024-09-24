import { useState, useEffect } from 'react'
import { getMerchantMandate, getMerchantMandates,MerchantMandate } from '@/services/merchant.service'
export const useMerchant = (id?: string) => {
  const [merchant, setMerchant] = useState<MerchantMandate | null>(null)
  const [merchants, setMerchants] = useState<MerchantMandate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        if (id) {
          const data = await getMerchantMandate(id)
          setMerchant(data as MerchantMandate)
        } else {
          const data = await getMerchantMandates()
          setMerchants(data as MerchantMandate[])
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