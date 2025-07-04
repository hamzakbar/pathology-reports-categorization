import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ScrollArea } from './scroll-area'
import { Microscope } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { ViewMode } from '@/app/page'

interface ReportViewerProps {
  isGenerating?: boolean
  view: ViewMode
  report?: string
  imagesTextMarkdown?: { file: string; output: string }[]
}

function SkeletonLoader() {
  return (
    <div className='p-6 max-w-[900px] mx-auto w-full space-y-8'>
      <Skeleton className='h-8 w-1/2 rounded-lg' />

      <div className='space-y-4'>
        <Skeleton className='h-6 w-1/3 rounded-lg' />
        <div className='space-y-2'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-5/6' />
        </div>
      </div>

      <div className='space-y-4'>
        <Skeleton className='h-6 w-1/4 rounded-lg' />
        <div className='space-y-3'>
          <div className='flex items-center gap-3'>
            <Skeleton className='h-2 w-2 rounded-full' />
            <Skeleton className='h-4 w-full' />
          </div>
          <div className='flex items-center gap-3'>
            <Skeleton className='h-2 w-2 rounded-full' />
            <Skeleton className='h-4 w-[90%]' />
          </div>
          <div className='flex items-center gap-3'>
            <Skeleton className='h-2 w-2 rounded-full' />
            <Skeleton className='h-4 w-full' />
          </div>
          <div className='flex items-center gap-3'>
            <Skeleton className='h-2 w-2 rounded-full' />
            <Skeleton className='h-4 w-[95%]' />
          </div>
        </div>
      </div>
    </div>
  )
}

function MarkdownContent({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: (props) => (
          <h1 className='text-3xl font-bold mb-6 border-b pb-2' {...props} />
        ),
        h2: (props) => (
          <h2
            className='text-2xl font-semibold mb-4 mt-6 border-b pb-2'
            {...props}
          />
        ),
        h3: (props) => (
          <h3 className='text-xl font-semibold mb-3 mt-4' {...props} />
        ),
        p: (props) => <p className='mb-4 leading-relaxed' {...props} />,
        ul: (props) => (
          <ul className='list-disc pl-6 mb-4 space-y-2' {...props} />
        ),
        ol: (props) => (
          <ol className='list-decimal pl-6 mb-4 space-y-2' {...props} />
        ),
        li: (props) => <li className='mb-1' {...props} />,
        table: (props) => (
          <div className='overflow-x-auto mb-4'>
            <table className='min-w-full border-collapse' {...props} />
          </div>
        ),
        thead: (props) => <thead className='bg-muted' {...props} />,
        th: (props) => (
          <th className='border px-4 py-2 text-left font-medium' {...props} />
        ),
        td: (props) => <td className='border px-4 py-2' {...props} />,
        blockquote: (props) => (
          <blockquote className='mt-6 border-l-2 pl-6 italic' {...props} />
        ),
        code: (props) => (
          <code
            className='relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold'
            {...props}
          />
        ),
      }}
    >
      {markdown}
    </ReactMarkdown>
  )
}

function EmptyState() {
  return (
    <div className='flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8'>
      <Microscope className='h-16 w-16 mb-4' />
      <h3 className='text-xl font-semibold'>Report Appears Here</h3>
      <p className='mt-2 max-w-md'>
        Attach a PDF in the chat panel to the left. The generated summary and
        extracted text will be displayed in this window.
      </p>
    </div>
  )
}

// The main export component with the final rendering logic
export function ReportViewer({
  isGenerating,
  view,
  report,
  imagesTextMarkdown,
}: ReportViewerProps) {
  const hasContent =
    report || (imagesTextMarkdown && imagesTextMarkdown.length > 0)

  return (
    <div className='w-full h-full flex flex-col bg-background rounded-xl overflow-hidden border'>
      {isGenerating ? (
        <SkeletonLoader />
      ) : !hasContent ? (
        <EmptyState />
      ) : (
        <ScrollArea className='flex-grow min-h-0'>
          <div className='p-6 break-words max-w-[900px] mx-auto'>
            {view === 'report' ? (
              report ? (
                <MarkdownContent markdown={report} />
              ) : (
                <span className='text-muted-foreground'>
                  No report was generated for this view.
                </span>
              )
            ) : imagesTextMarkdown && imagesTextMarkdown.length > 0 ? (
              <div>
                {imagesTextMarkdown.map((img, index) => (
                  <div key={img.file + index} className='mb-8'>
                    <MarkdownContent markdown={img.output} />
                  </div>
                ))}
              </div>
            ) : (
              <span className='text-muted-foreground'>
                No text could be extracted from the document.
              </span>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
