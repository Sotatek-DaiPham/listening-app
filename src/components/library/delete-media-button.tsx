"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Modal } from "@/components/ui/modal"

interface DeleteMediaButtonProps {
  mediaId: string
  mediaTitle: string
}

export function DeleteMediaButton({ mediaId, mediaTitle }: DeleteMediaButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowConfirm(true)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    setShowConfirm(false)

    try {
      const res = await fetch(`/api/library/${mediaId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(`Delete failed: ${data.error || 'Unknown error'}`)
        setIsDeleting(false)
      }
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`)
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button
        onClick={handleDeleteClick}
        disabled={isDeleting}
        className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
        title="Delete Media"
      >
        {isDeleting ? (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        )}
      </button>

      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Deletion"
        variant="danger"
        footer={(
          <>
            <button 
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 text-slate-400 hover:text-slate-100 font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirmDelete}
              className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-600/20"
            >
              Delete Permanently
            </button>
          </>
        )}
      >
        <p>Are you sure you want to delete <span className="text-slate-100 font-bold">"{mediaTitle}"</span>?</p>
        <p className="mt-2 text-sm text-slate-500 italic">This will permanently remove the audio files, metadata, and all your practice progress. This action cannot be undone.</p>
      </Modal>
    </>
  )
}
