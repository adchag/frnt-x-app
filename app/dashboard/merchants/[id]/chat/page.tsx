"use client"

import { useParams } from "next/navigation"

const ChatPage = () => {
  const { id } = useParams() as { id: string }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Chat</h2>
      <p>Implement chat functionality for merchant {id} here.</p>
    </div>
  )
}

export default ChatPage