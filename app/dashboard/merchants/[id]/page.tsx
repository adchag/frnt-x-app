'use client'

import { useParams } from 'next/navigation'
import Image from 'next/image'
import { useMerchant } from '@/app/hooks/use-merchant'
import { Button } from '@/components/ui/button'
import { deleteMerchantMandate } from '@/app/services/merchant.service'

const MerchantMandatePage = () => {
  const { id } = useParams()
  const { merchant, isLoading, error } = useMerchant(id as string)

  const handleDelete = async () => {
    if (id) {
      await deleteMerchantMandate(id as string)
      // Redirect to the merchants list page after deletion
      // You might want to use a routing library or Next.js router for this
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!merchant) return <div>Merchant not found</div>

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">{merchant.company_name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Logo</h2>
          {merchant.logo_url ? (
            <Image
              src={merchant.logo_url}
              alt={`${merchant.company_name} logo`}
              width={200}
              height={200}
              className="rounded-lg"
            />
          ) : (
            <p>No logo available</p>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p>{merchant.description || 'No description available'}</p>
        </div>
      </div>
      <div className="mt-6">
        <Button onClick={handleDelete} variant="destructive">Delete Mandate</Button>
      </div>
    </div>
  )
}

export default MerchantMandatePage