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
import { PDFDocument, rgb, PDFFont } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

export type ViewMode = 'report' | 'extracted'

export default function Home() {
  const [report, setReport] = useState<string>('')
  const [results, setResults] = useState<any[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [converting, setConverting] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('report')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isExporting, setIsExporting] = useState(false)

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

  
  const handleExport = async () => {
    if (!selectedFile || !report) {
      alert('No report available to export.')
      return
    }

    setIsExporting(true)
    try {
      
      const fontUrl = '/fonts/NotoSans-Regular.ttf'
      const boldFontUrl = '/fonts/NotoSans-Bold.ttf'

      const [fontBytes, boldFontBytes] = await Promise.all([
        fetch(fontUrl).then((res) => res.arrayBuffer()),
        fetch(boldFontUrl).then((res) => res.arrayBuffer()),
      ])

      const originalPdfBytes = await selectedFile.arrayBuffer()
      const pdfDoc = await PDFDocument.load(originalPdfBytes)

      
      pdfDoc.registerFontkit(fontkit)

      
      const geistFont = await pdfDoc.embedFont(fontBytes)
      const geistBoldFont = await pdfDoc.embedFont(boldFontBytes)

      const originalPages = pdfDoc.getPages()
      const pageSize =
        originalPages.length > 0
          ? originalPages[0].getSize()
          : { width: 595, height: 842 } 

      let page = pdfDoc.addPage([pageSize.width, pageSize.height])
      const { width, height } = page.getSize()
      const margin = 50
      let y = height - margin
      let currentX = margin

      const drawWord = (word: string, font: PDFFont, size: number) => {
        const wordWidth = font.widthOfTextAtSize(word, size)
        if (currentX + wordWidth > width - margin) {
          y -= size * 1.5
          currentX = margin
          if (y < margin) {
            page = pdfDoc.addPage([width, height])
            y = height - margin
          }
        }
        page.drawText(word, { x: currentX, y, font, size, color: rgb(0, 0, 0) })
        currentX += font.widthOfTextAtSize(word, size)
      }

      page.drawText('Report Summary', {
        x: margin,
        y,
        font: geistBoldFont,
        size: 18,
        color: rgb(0, 0, 0),
      })
      y -= 18 * 1.5 + 15

      const reportLines = report.split('\n')
      for (const line of reportLines) {
        currentX = margin
        if (y < margin) {
          page = pdfDoc.addPage([width, height])
          y = height - margin
        }
        if (line.trim().length === 0) {
          y -= 11 * 0.5
          continue
        }

        let baseFont = geistFont
        let baseSize = 11
        let content = line

        if (content.startsWith('### ')) {
          baseFont = geistBoldFont
          baseSize = 14
          content = content.substring(4)
        } else if (content.startsWith('- ')) {
          page.drawText('•', {
            x: currentX,
            y,
            font: geistFont,
            size: baseSize,
          })
          currentX += 15
          content = content.substring(2)
        }

        const segments = content.split(/(\*\*.*?\*\*)/g).filter(Boolean)
        for (const segment of segments) {
          const isBold = segment.startsWith('**') && segment.endsWith('**')
          const text = isBold ? segment.slice(2, -2) : segment
          const font = isBold ? geistBoldFont : baseFont

          const words = text.split(' ').filter(Boolean)
          for (const word of words) {
            drawWord(word + ' ', font, baseSize)
          }
        }
        y -= baseSize * 1.5
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${selectedFile.name.replace('.pdf', '')}-updated.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    } catch (err) {
      console.error('Failed to export PDF:', err)
      alert('An error occurred while exporting the PDF.')
    } finally {
      setIsExporting(false)
    }
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
