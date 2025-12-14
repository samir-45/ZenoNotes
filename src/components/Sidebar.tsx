import React, { useState } from 'react'
import { Note } from '../lib/db'
import { 
  Search, 
  Plus, 
  Moon, 
  Sun, 
  Star, 
  Archive, 
  Trash2, 
  MoreVertical,
  Calendar,
  Tag
} from 'lucide-react'
import { format } from 'date-fns'

interface SidebarProps {
  notes: Note[]
  activeNote: Note | null
  onNoteSelect: (note: Note) => void
  onNewNote: () => void
  onDeleteNote: (noteId: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onToggleTheme: () => void
  darkMode: boolean
}

const Sidebar: React.FC<SidebarProps> = ({
  notes,
  activeNote,
  onNoteSelect,
  onNewNote,
  onDeleteNote,
  searchQuery,
  onSearchChange,
  onToggleTheme,
  darkMode
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const handleDelete = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (showDeleteConfirm === noteId) {
      onDeleteNote(noteId)
      setShowDeleteConfirm(null)
    } else {
      setShowDeleteConfirm(noteId)
    }
  }

  return (
    <>
      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          />
        </div>
      </div>

      {/* New Note Button */}
      <div className="p-4">
        <button
          onClick={onNewNote}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          New Note
        </button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <p>No notes yet</p>
            <p className="text-sm mt-1">Create your first note</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {notes.map(note => (
              <div
                key={note.id}
                onClick={() => onNoteSelect(note)}
                className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                  activeNote?.id === note.id
                    ? 'bg-gray-100 dark:bg-gray-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">
                      {note.title || 'Untitled'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(note.updatedAt), 'MMM d')}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {showDeleteConfirm === note.id ? (
                      <>
                        <button
                          onClick={(e) => handleDelete(note.id, e)}
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowDeleteConfirm(null)
                          }}
                          className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={(e) => handleDelete(note.id, e)}
                        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {note.tags.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                    {note.tags.length > 2 && (
                      <span className="px-2 py-0.5 text-xs text-gray-500">
                        +{note.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <button
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="text-sm">Theme</span>
          {darkMode ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
      </div>
    </>
  )
}

export default Sidebar