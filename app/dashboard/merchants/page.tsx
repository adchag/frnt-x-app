'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMerchant } from '@/hooks/use-merchant'
import { Button } from '@/components/ui/button'
import { MyTable } from '@/components/my-table'
import { ColumnDef } from '@tanstack/react-table'
import PageLoader from '@/components/page-loader'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Merchant {
  id: string
  company_name: string
  description: string
  logo_url: string
}

const columns: ColumnDef<Merchant>[] = [
  {
    id: 'avatar',
    cell: ({ row }) => (
      <Avatar>
        <AvatarImage src={row.original.logo_url} alt={row.original.company_name} />
        <AvatarFallback>{row.original.company_name.charAt(0)}</AvatarFallback>
      </Avatar>
    ),
  },
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
      <div className="space-x-2">
        <Link href={`/dashboard/merchants/${row.original.id}`}>
          <Button variant="outline" size="sm">View</Button>
        </Link>
        <Link href={`/dashboard/merchants/${row.original.id}/edit`}>
          <Button variant="outline" size="sm">Edit</Button>
        </Link>
      </div>
    ),
  },
]

const MerchantsPage = () => {
  const { merchants, isLoading, error } = useMerchant()


  return (
    <PageLoader isLoading={isLoading}>
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Merchant Mandates</h1>
        <Link href="/dashboard/merchants/new">
          <Button>Create New Mandate</Button>
        </Link>
      </div>
      <MyTable columns={columns} data={merchants as any} />
      </div>
    </PageLoader>
  )
}

export default MerchantsPage