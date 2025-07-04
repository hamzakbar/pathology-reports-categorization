'use client'

import { useState } from 'react'
import Header from '@/components/ui/header'
import { ReportViewer } from '@/components/ui/report-viewer'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { ChatPanel, Message } from '@/components/chat-panel'

export type ViewMode = 'report' | 'extracted'

export default function Home() {
  const [report, setReport] = useState<string>('')
  const [results, setResults] = useState<any[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [converting, setConverting] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('report')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const isReportGenerated = report.length > 0

  const handleFileSelect = (file: File | null) => {
    if (file && file.type !== 'application/pdf') {
      alert('Please select a PDF file.')
      return
    }
    setSelectedFile(file)
  }

  const handleInitialGenerateReport = async () => {
    if (!selectedFile) return

    setConverting(true)
    setReport('')
    setResults([])

    setMessages([
      {
        id: Date.now().toString(),
        role: 'user',
        content: `Analyzed: ${selectedFile.name}`,
        attachment: { name: selectedFile.name, type: selectedFile.type },
      },
      {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: 'Generating the report...',
        type: 'loading',
      },
    ])

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const res = await fetch('/api/generate-report', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(
          errorData?.error || 'Failed to generate report from server.'
        )
      }

      const responseData = await res.json()

      setMessages((prev) =>
        prev.map((msg) =>
          msg.type === 'loading'
            ? {
                ...msg,
                content: 'Report generated successfully!',
                type: 'system',
              }
            : msg
        )
      )

      setReport(responseData.markdownReport ?? '')
      setResults(responseData.results ?? [])
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : 'An unknown error occurred.'
      console.error(e)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.type === 'loading'
            ? { ...msg, content: `Error: ${errorMessage}`, type: 'error' }
            : msg
        )
      )
    } finally {
      setConverting(false)
    }
  }

  const handleFollowUpSubmit = (data: { text: string; file: File | null }) => {
    console.log('Follow-up question:', data.text)
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: data.text,
    }
    const placeholderResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: 'system',
      content: 'Follow-up question functionality is not yet implemented.',
    }

    setMessages((prev) => [...prev, newUserMessage, placeholderResponse])
  }

  const handleStartNewReport = () => {
    setReport('')
    setResults([])
    setMessages([])
    setSelectedFile(null)
    setConverting(false)
  }

  return (
    <div className='flex flex-col h-screen bg-background font-sans'>
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        onStartNewReport={handleStartNewReport}
        isReportGenerated={isReportGenerated}
      />

      <main className='flex-grow min-h-0'>
        <ResizablePanelGroup direction='horizontal' className='h-full'>
          <ResizablePanel defaultSize={30} minSize={0} className='p-4'>
            <ChatPanel
              messages={messages}
              isGenerating={converting}
              onInitialGenerateReport={handleInitialGenerateReport}
              onFollowUpSubmit={handleFollowUpSubmit}
              isReportGenerated={isReportGenerated}
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={70} minSize={50} className='p-4'>
            <ReportViewer
              isGenerating={converting}
              view={viewMode}
              report={report}
              imagesTextMarkdown={results}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  )
}
