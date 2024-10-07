"use client"

import { useParams } from "next/navigation"

const TrelloPage = () => {
  const { id } = useParams() as { id: string }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Trello Board</h2>
      <p>Implement Trello board for merchant {id} here.</p>
    </div>
  )
}

export default TrelloPage