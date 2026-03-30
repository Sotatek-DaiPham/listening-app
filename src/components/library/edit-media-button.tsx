"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Modal } from "@/components/ui/modal"

interface EditMediaButtonProps {
  mediaId: string
  currentTitle: string
}

export function EditMediaButton({ mediaId, currentTitle }: EditMediaButtonProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [newTitle, setNewTitle] = useState(currentTitle)
  const router = useRouter()

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setNewTitle(currentTitle)
    setShowModal(true)
  }

  const handleUpdate = async () => {
    if (!newTitle.trim() || newTitle === currentTitle) {
      setShowModal(false)
      return
    }

    setIsUpdating(true)

    try {
      const res = await fetch(`/api/library/${mediaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim() })
      })

      if (res.ok) {
        setShowModal(false)
        router.refresh()
      } else {
        const data = await res.json()
        alert(`Update failed: ${data.error || 'Unknown error'}`)
      }
    } catch (err: any) {
      alert(`Update failed: ${err.message}`)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <button
        onClick={handleEditClick}
        className="p-2 text-slate-500 hover:text-teal-400 hover:bg-teal-400/10 rounded-xl transition-all"
        title="Edit Title"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      <Modal
        isOpen={showModal}
        onClose={() => !isUpdating && setShowModal(false)}
        title="Edit Exercise Title"
        footer={(
          <>
            <button 
              onClick={() => setShowModal(false)}
              disabled={isUpdating}
              className="px-4 py-2 text-slate-400 hover:text-slate-100 font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpdate}
              disabled={isUpdating || !newTitle.trim() || newTitle === currentTitle}
              className="px-6 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-500/20"
            >
              {isUpdating ? "Updating..." : "Save Changes"}
            </button>
          </>
        )}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">New Title</label>
            <input 
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
              placeholder="Enter exercise title"
              onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
            />
          </div>
          <p className="text-sm text-slate-500 italic">This will update the title across your library and practice sessions.</p>
        </div>
      </Modal>
    </>
  )
}
