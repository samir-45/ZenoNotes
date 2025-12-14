import React, { useState, useEffect, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Note } from '../lib/db'
import { debounce } from 'lodash'
// import debounce from 'lodash/debounce'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Code,
  Palette,
  Type
} from 'lucide-react'

interface EditorProps {
  note: Note
  onUpdate: (note: Note) => void
  darkMode: boolean
}

const Editor: React.FC<EditorProps> = ({ note, onUpdate, darkMode }) => {
  const [title, setTitle] = useState(note.title)
  const [tags, setTags] = useState<string[]>(note.tags || [])
  const [newTag, setNewTag] = useState('')

  // Debounced update
  const debouncedUpdate = useCallback(
    debounce((updatedNote: Note) => {
      onUpdate(updatedNote)
    }, 1000),
    []
  )

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
    ],
    content: note.content,
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[calc(100vh-10rem)] p-8',
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getHTML()
      debouncedUpdate({
        ...note,
        content,
        updatedAt: new Date().toISOString()
      })
    },
  })

  useEffect(() => {
    if (editor && note.content !== editor.getHTML()) {
      editor.commands.setContent(note.content)
    }
  }, [note.id])

  useEffect(() => {
    setTitle(note.title)
    setTags(note.tags || [])
  }, [note.id])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    debouncedUpdate({
      ...note,
      title: newTitle,
      updatedAt: new Date().toISOString()
    })
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const newTags = [...tags, newTag.trim()]
      setTags(newTags)
      setNewTag('')
      debouncedUpdate({
        ...note,
        tags: newTags,
        updatedAt: new Date().toISOString()
      })
    }
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove)
    setTags(newTags)
    debouncedUpdate({
      ...note,
      tags: newTags,
      updatedAt: new Date().toISOString()
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-2 flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${editor?.isActive('bold') ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${editor?.isActive('italic') ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1" />
        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${editor?.isActive('bulletList') ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${editor?.isActive('orderedList') ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${editor?.isActive('blockquote') ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${editor?.isActive('codeBlock') ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
        >
          <Code className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Note Title"
            className="w-full text-4xl font-bold p-8 pb-4 focus:outline-none bg-transparent"
          />

          {/* Tags */}
          <div className="px-8 pb-4 flex flex-wrap gap-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm flex items-center gap-1"
              >
                #{tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="opacity-50 hover:opacity-100"
                >
                  ×
                </button>
              </span>
            ))}
            <div className="flex items-center">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add tag..."
                className="text-sm bg-transparent focus:outline-none w-24"
              />
            </div>
          </div>

          {/* Editor */}
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}

export default Editor