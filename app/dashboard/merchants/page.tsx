'use client'

import Link from 'next/link'
import { useMerchant } from '@/app/hooks/use-merchant'
import { Button } from '@/components/ui/button'
import { MyTable } from '@/components/my-table'
import { ColumnDef } from '@tanstack/react-table'
import PageLoader from '@/components/page-loader'

interface MerchantMandate {
  id: string
  company_name: string
  description: string
}

const columns: ColumnDef<MerchantMandate>[] = [
  {
    accessorKey: 'company_name',
    header: 'Company Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Link href={`/dashboard/merchants/${row.original.id}`}>
        <Button variant="outline" size="sm">View</Button>
      </Link>
    ),
  },
]

const MerchantsPage = () => {
  const { merchants, isLoading, error } = useMerchant()

  if (isLoading) return <PageLoader />
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Merchant Mandates</h1>
        <Link href="/dashboard/merchants/new">
          <Button>Create New Mandate</Button>
        </Link>
      </div>
      <MyTable columns={columns} data={merchants} />
    </div>
  )
}

export default MerchantsPage