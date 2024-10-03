import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="font-medium">{row.original.id.slice(-4)}</div>,
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => formatDistanceToNow(new Date(row.original.created_at * 1000), { addSuffix: true }),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/assistants/${row.original.assistant_id}/chat/${row.original.id}`} passHref>
            <Button variant="outline" size="sm">
              Open Chat
            </Button>
          </Link>
        </div>
      )
    },
  },
]