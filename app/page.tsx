'use client'

import { useState } from 'react'
import Header from '@/components/ui/header'
import { FileUpload } from '@/components/ui/file-upload'
import { ReportViewer } from '@/components/ui/report-viewer'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [report, setReport] = useState<string>('')
  const [results, setResults] = useState<any[]>([])
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file)
    setError(null)
    setReport('')
    setResults([])
  }

  const handleGenerateReport = async () => {
    if (!selectedFile) return
    if (selectedFile.type !== 'application/pdf') {
      setError('Please choose a PDF')
      return
    }

    setConverting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const res = await fetch('/api/generate-report', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Failed to generate report')

      const data = await res.json()
      setReport(data.markdownReport ?? '')
      setResults(data.results ?? [])
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'Report generation failed')
    } finally {
      setConverting(false)
    }
  }

  return (
    <div className='min-h-screen bg-background font-sans'>
      <Header />
      <main className='flex flex-col items-center p-8 pb-20 gap-16 sm:p-10'>
        <div
          className='w-full max-w-6xl grid grid-cols-12 gap-8 items-start'
          style={{ height: '80vh' }}
        >
          <div className='col-span-12 md:col-span-2 flex flex-col items-center space-y-6'>
            <FileUpload
              onFileSelect={handleFileSelect}
              onGenerateReport={handleGenerateReport}
              selectedFile={selectedFile}
              converting={converting}
            />

            {error && (
              <p className='text-xs text-red-600 text-center'>{error}</p>
            )}
          </div>

          <div className='col-span-12 md:col-span-10 h-full overflow-auto'>
            <ReportViewer report={report} imagesTextMarkdown={results} />
          </div>
        </div>
      </main>
    </div>
  )
}
