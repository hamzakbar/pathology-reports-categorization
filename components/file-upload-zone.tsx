'use client'
import { ChangeEvent, DragEvent, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { FileText, Loader2 } from 'lucide-react'
import type { Criteria } from '@/app/page'

interface FileUploadZoneProps {
  selectedFile: File | null
  onFileSelect: (file: File | null) => void
  onGenerateReport: () => void
  isGenerating?: boolean
  criteria: Criteria
  setCriteria: (c: Criteria) => void
}

export function FileUploadZone({
  selectedFile,
  onFileSelect,
  onGenerateReport,
  isGenerating,
  criteria,
  setCriteria,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const handleButtonClick = () => inputRef.current?.click()
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) =>
    onFileSelect(e.target.files?.[0] || null)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(true)
  }
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(false)
  }
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(false)
    onFileSelect(e.dataTransfer.files?.[0] || null)
  }

  return (
    <div className='flex flex-col items-center justify-center h-full w-full gap-8'>

      <div className='flex items-center gap-4'>
        <Label htmlFor='criteria-switch'>NCCN</Label>
        <Switch
          id='criteria-switch'
          checked={criteria === 'aua'}
          onCheckedChange={(v) => setCriteria(v ? 'aua' : 'nccn')}
        />
        <Label htmlFor='criteria-switch'>AUA</Label>
      </div>

      <div className='flex items-center gap-6'>
        <div
          className={`flex flex-col items-center justify-center rounded-full border-2 border-dashed transition-colors ${
            isDragActive
              ? 'border-primary bg-accent/30'
              : 'border-muted bg-muted/50'
          } w-48 h-48 cursor-pointer select-none text-center p-4`}
          onClick={handleButtonClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          tabIndex={0}
          role='button'
          aria-label='Select PDF file'
        >
          <input
            ref={inputRef}
            type='file'
            accept='application/pdf'
            className='hidden'
            onChange={handleFileChange}
          />
          <span className='text-sm text-muted-foreground'>
            Drag and Drop or <br /> Browse a PDF
          </span>
        </div>

        {selectedFile && (
          <div className='flex flex-col items-start gap-2'>
            <p className='text-sm text-muted-foreground'>Selected File:</p>
            <span
              className='text-lg text-primary font-medium truncate max-w-xs'
              title={selectedFile.name}
            >
              <FileText className='w-5 h-5 text-muted-foreground inline' />{' '}
              {selectedFile.name}
            </span>
          </div>
        )}
      </div>

      <Button
        className='w-1/2'
        onClick={onGenerateReport}
        disabled={!selectedFile || isGenerating}
      >
        {isGenerating && <Loader2 className='h-4 w-4 animate-spin' />}
        <div className='mt-1'>Generate Report</div>
      </Button>
    </div>
  )
}
