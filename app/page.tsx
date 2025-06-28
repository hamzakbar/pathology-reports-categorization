'use client'

import { useState } from 'react'
import Header from '@/components/ui/header'
import { FileUpload } from '@/components/ui/file-upload'
import { ReportViewer } from '@/components/ui/report-viewer'

interface ConvertedImage {
  name: string
  url: string
  page: number
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [report, setReport] = useState<string>('')
  const [images, setImages] = useState<ConvertedImage[]>([])
  const [converting, setConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file)
    setImages([])
    setProgress(0)
    setError(null)
    setReport('')
  }

  const handleGenerateReport = async () => {
    if (!selectedFile) return
    if (selectedFile.type !== 'application/pdf') {
      setError('Please choose a PDF')
      return
    }

    setConverting(true)
    setImages([])
    setProgress(0)
    setError(null)

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfjsLib = await new Promise<any>((res, rej) => {
        if ((window as any).pdfjsLib) return res((window as any).pdfjsLib)
        const s = document.createElement('script')
        s.src = '/pdf.min.js'
        s.onload = () => res((window as any).pdfjsLib)
        s.onerror = () => rej(new Error('Failed to load pdf.js'))
        document.head.appendChild(s)
      })
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

      const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(await selectedFile.arrayBuffer()),
      }).promise

      const total = pdf.numPages
      const tmp: ConvertedImage[] = []

      for (let n = 1; n <= total; n++) {
        setProgress(Math.round(((n - 1) / total) * 100))
        const page = await pdf.getPage(n)
        const v = page.getViewport({ scale: 2 })
        const canvas = document.createElement('canvas')
        canvas.width = v.width
        canvas.height = v.height
        await page.render({
          canvasContext: canvas.getContext('2d')!,
          viewport: v,
        }).promise
        const blob = await new Promise<Blob>((r) =>
          canvas.toBlob((b) => r(b!), 'image/png', 0.95)
        )
        tmp.push({
          name: `${selectedFile.name.replace(/\.pdf$/i, '')}_page_${n}.png`,
          url: URL.createObjectURL(blob),
          page: n,
        })
        setImages([...tmp])
        page.cleanup()
      }

      setProgress(100)

      const formData = new FormData()
      for (const img of tmp) {
        const blob = await fetch(img.url).then((r) => r.blob())
        formData.append(
          'images',
          new File([blob], img.name, { type: 'image/png' })
        )
      }

      const res = await fetch('/api/generate-report', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Failed to generate report')

      const data = await res.json()
      setReport(data.markdownReport ?? '')
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'Conversion or report failed')
    } finally {
      setConverting(false)
    }
  }  

  return (
    <div className='min-h-screen bg-background font-sans'>
      <Header />
      <main className='flex flex-col items-center p-8 pb-20 gap-16 sm:p-20'>
        <div className='w-full max-w-6xl grid grid-cols-12 gap-8 items-start' style={{ height: '70vh' }}>
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
            <ReportViewer report={report} />
          </div>
        </div>
      </main>
    </div>
  )
}
