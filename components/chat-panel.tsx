import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatInput } from '@/components/chat-input'
import { FileUploadZone } from '@/components/file-upload-zone'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  FileText,
  Loader2,
  User,
  AlertCircle,
  Image as ImageIcon,
  Microscope,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MarkdownContent } from './ui/report-viewer'

export interface Message {
  id: string
  role: 'user' | 'system'
  content: string
  type?: 'loading' | 'error' | 'system'
  attachment?: {
    name: string
    type: string
  }
}

interface ChatPanelProps {
  messages: Message[]
  isGenerating: boolean
  isReportGenerated: boolean
  onInitialGenerateReport: () => void
  onFollowUpSubmit: (data: { text: string; file: File | null }) => void
  selectedFile: File | null
  onFileSelect: (file: File | null) => void
}

export function ChatPanel({
  messages,
  isGenerating,
  isReportGenerated,
  onInitialGenerateReport,
  onFollowUpSubmit,
  selectedFile,
  onFileSelect,
}: ChatPanelProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'smooth',
        })
      }
    }
  }, [messages])

  return (
    <div className='flex flex-col h-full bg-background rounded-xl border'>
      {isReportGenerated ? (
        <>
          <ScrollArea className='flex-grow min-h-0' ref={scrollAreaRef}>
            <div className='flex flex-col gap-4 p-4'>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' && 'justify-end'
                  )}
                >
                  {message.role === 'system' && (
                    <Avatar className='h-8 w-8'>
                      <AvatarFallback>
                        <Microscope className='h-5 w-5' />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'rounded-lg px-3 py-2 max-w-[80%]',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted',
                      message.type === 'error' &&
                        'bg-destructive/10 text-destructive'
                    )}
                  >
                    {message.attachment && (
                      <div className='flex items-center gap-2 border-b border-primary/20 pb-2 mb-2'>
                        {message.attachment.type.startsWith('image/') ? (
                          <ImageIcon className='h-4 w-4' />
                        ) : (
                          <FileText className='h-4 w-4' />
                        )}
                        <span className='text-sm font-medium truncate'>
                          {message.attachment.name}
                        </span>
                      </div>
                    )}
                    <div className='flex items-start gap-2'>
                      {message.type === 'loading' && (
                        <Loader2 className='h-4 w-4 animate-spin mt-1' />
                      )}
                      {message.type === 'error' && (
                        <AlertCircle className='h-4 w-4 mt-1' />
                      )}
                      <div>
                        <MarkdownContent markdown={message.content} />
                      </div>
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <Avatar className='h-8 w-8'>
                      <AvatarFallback>
                        <User className='h-5 w-5' />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className='shrink-0 p-4 pt-0'>
            <ChatInput
              onSubmit={onFollowUpSubmit}
              isGenerating={isGenerating}
              isReportGenerated={isReportGenerated}
            />
          </div>
        </>
      ) : (
        <FileUploadZone
          selectedFile={selectedFile}
          onFileSelect={onFileSelect}
          onGenerateReport={onInitialGenerateReport}
          isGenerating={isGenerating}
        />
      )}
    </div>
  )
}
