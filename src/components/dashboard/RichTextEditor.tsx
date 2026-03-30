'use client'

import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  // PENTING: Gunakan SSR false agar tidak terjadi error document/window object di Next.js
  const ReactQuill = useMemo(() => dynamic(() => import('react-quill-new'), { 
    ssr: false,
    loading: () => <div className="h-64 bg-slate-50 animate-pulse border border-slate-200 rounded-lg flex items-center justify-center text-slate-400">Memuat Editor Premium...</div>
  }), [])

  const modules = {
    toolbar: [
      [{ 'header': [2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }],
      ['link'],
      ['clean'] // Tombol hapus format
    ],
  }

  return (
    <div className="bg-white rounded-lg border border-slate-300 transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 hover:border-blue-400">
      <style jsx global>{`
        .quill {
          display: flex;
          flex-direction: column;
        }
        .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid #e2e8f0;
          background-color: #f8fafc;
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
        }
        .ql-container.ql-snow {
          border: none;
          font-family: inherit;
          font-size: 1rem;
        }
        .ql-editor {
          min-height: 300px;
          padding: 1rem;
          color: #1e293b;
          line-height: 1.6;
        }
        .ql-editor p {
          margin-bottom: 1rem;
        }
      `}</style>
      <ReactQuill 
        theme="snow" 
        value={value} 
        onChange={onChange}
        modules={modules}
        placeholder={placeholder || 'Tulis isi memukau siaran pers Anda di sini...'}
      />
    </div>
  )
}
