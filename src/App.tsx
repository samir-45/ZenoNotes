import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import { Note, DB } from './lib/db'
import { 
  Menu, 
  Plus, 
  Search, 
  Moon, 
  Sun,
  Trash2,
  Archive,
  Star,
  MoreVertical
} from 'lucide-react'

function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    // Load notes from IndexedDB
    const loadNotes = async () => {
      const allNotes = await DB.getAllNotes()
      setNotes(allNotes)
      
      if (allNotes.length > 0 && !activeNote) {
        setActiveNote(allNotes[0])
      }
    }
    
    loadNotes()
    
    // Check system theme
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true)
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const createNewNote = async () => {
    const newNote = await DB.createNote({
      title: 'Untitled',
      content: '',
      tags: []
    })
    
    setNotes([newNote, ...notes])
    setActiveNote(newNote)
  }

  const updateNote = async (updatedNote: Note) => {
    await DB.updateNote(updatedNote)
    setNotes(notes.map(n => n.id === updatedNote.id ? updatedNote : n))
  }

  const deleteNote = async (noteId: string) => {
    await DB.deleteNote(noteId)
    const filteredNotes = notes.filter(n => n.id !== noteId)
    setNotes(filteredNotes)
    
    if (activeNote?.id === noteId && filteredNotes.length > 0) {
      setActiveNote(filteredNotes[0])
    } else if (filteredNotes.length === 0) {
      setActiveNote(null)
    }
  }

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
              className="w-64 border-r border-gray-200 dark:border-gray-800 flex flex-col"
            >
              <Sidebar
                notes={filteredNotes}
                activeNote={activeNote}
                onNoteSelect={setActiveNote}
                onNewNote={createNewNote}
                onDeleteNote={deleteNote}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onToggleTheme={() => setDarkMode(!darkMode)}
                darkMode={darkMode}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="h-14 border-b border-gray-200 dark:border-gray-800 flex items-center px-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex-1 flex justify-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {activeNote?.title || 'Select a note'}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={createNewNote}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 overflow-auto">
            {activeNote ? (
              <Editor
                note={activeNote}
                onUpdate={updateNote}
                darkMode={darkMode}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8">
                <div className="max-w-md text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h2 className="text-xl font-semibold">Create your first note</h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Start by creating a new note or select one from the sidebar
                  </p>
                  <button
                    onClick={createNewNote}
                    className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Create Note
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="h-8 border-t border-gray-200 dark:border-gray-800 px-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div>
              {notes.length} note{notes.length !== 1 ? 's' : ''}
            </div>
            <div>
              {activeNote?.updatedAt && 
                `Last edited ${new Date(activeNote.updatedAt).toLocaleDateString()}`
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App