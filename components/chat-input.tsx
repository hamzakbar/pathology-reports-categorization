'use client'
import { useState, FormEvent, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowUp } from 'lucide-react'

interface ChatInputProps {
  onSubmit: (data: { text: string; file: File | null }) => void
  isGenerating: boolean
  isReportGenerated: boolean
}

export function ChatInput({
  onSubmit,
  isGenerating,
}: ChatInputProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [text])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!text || isGenerating) return

    onSubmit({ text, file: null })

    setText('')
  }

  return (
    <form onSubmit={handleSubmit} className='relative'>
      <div className='flex items-end w-full p-3 gap-3 rounded-xl border bg-background'>
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Ask a follow-up question about the report...'
          className='flex-grow resize-none border-0 bg-transparent shadow-none p-0 px-2 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm max-h-36'
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
        />
        <Button
          type='submit'
          size='icon'
          disabled={!text || isGenerating}
          aria-label='Submit question'
          className='rounded-full h-8 w-8 flex-shrink-0'
        >
          <ArrowUp className='h-5 w-5' />
        </Button>
      </div>
    </form>
  )
}
