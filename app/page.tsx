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
import { useExportPdf } from '../lib/use-export-pdf'

export type ViewMode = 'report' | 'extracted'

export default function Home() {
  const [report, setReport] = useState<string>('')
  const [results, setResults] = useState<{ file: string; output: string }[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [converting, setConverting] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('report')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { exportPdf, isExporting } = useExportPdf()

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
      if (!res.ok)
        throw new Error(
          (await res.json().catch(() => ({}))).error ||
            'Failed to generate report from server.'
        )

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

  const handleFollowUpSubmit = async (data: {
    text: string
    file: File | null
  }) => {
    const userPrompt = data.text

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userPrompt,
    }
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'system',
      content: 'Thinking...',
      type: 'loading',
    }
    setMessages((prev) => [...prev, newUserMessage, loadingMessage])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          reportContext: report,
          redactedTextContext: results.map((r) => r.output).join('\n\n'),
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to get a response from the server.')
      }

      const responseData = await res.json()

      setMessages((prev) =>
        prev.map((msg) =>
          msg.type === 'loading'
            ? { id: msg.id, role: 'system', content: responseData.response }
            : msg
        )
      )
    } catch (error) {
      console.error('Follow-up error:', error)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.type === 'loading'
            ? {
                id: msg.id,
                role: 'system',
                content: 'Sorry, I encountered an error. Please try again.',
                type: 'error',
              }
            : msg
        )
      )
    }
  }

  const handleStartNewReport = () => {
    setReport('')
    setResults([])
    setMessages([])
    setSelectedFile(null)
    setConverting(false)
  }

  const handleExport = async () => {
    await exportPdf(selectedFile, report)
  }

  return (
    <div className='flex flex-col h-screen bg-background font-sans'>
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        onStartNewReport={handleStartNewReport}
        isReportGenerated={isReportGenerated}
        onExport={handleExport}
        isExporting={isExporting}
      />
      <main className='flex-grow min-h-0'>
        <ResizablePanelGroup direction='horizontal' className='h-full'>
          <ResizablePanel defaultSize={35} minSize={30} className='p-4 pt-0'>
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
          <ResizablePanel defaultSize={65} minSize={40} className='p-4 pt-0'>
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
