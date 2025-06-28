'use client'

import { useState } from 'react'
import Header from '@/components/ui/header'
import { FileUpload } from '@/components/ui/file-upload'
import { ReportViewer } from '@/components/ui/report-viewer'
import { Button } from '@/components/ui/button'

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
      const pdfjsLib: any = await new Promise((res, rej) => {
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
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed')
    } finally {
      setConverting(false)
    }
  }

  return (
    <div className='min-h-screen bg-background font-sans'>
      <Header />
      <main className='flex flex-col items-center p-8 pb-20 gap-16 sm:p-20'>
        <div className='w-full max-w-6xl grid grid-cols-12 gap-8 items-start'>
          <div className='col-span-12 md:col-span-2 flex flex-col items-center space-y-6'>
            <FileUpload
              onFileSelect={handleFileSelect}
              onGenerateReport={handleGenerateReport}
              selectedFile={selectedFile}
            />

            {error && (
              <p className='text-xs text-red-600 text-center'>{error}</p>
            )}

            {images.length > 0 && (
              <div className='w-full space-y-4 overflow-y-auto'>
                {images.map((img) => (
                  <img
                    key={img.page}
                    src={img.url}
                    alt={`Page ${img.page}`}
                    className='w-full max-h-40 object-contain border rounded'
                  />
                ))}
              </div>
            )}
          </div>

          <div className='col-span-12 md:col-span-10'>
            <ReportViewer report={report} />
          </div>
        </div>
      </main>
    </div>
  )
}
