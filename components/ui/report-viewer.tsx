import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ImageTextMarkdown {
  file: string
  output: string
}

interface ReportViewerProps {
  report?: string
  imagesTextMarkdown?: ImageTextMarkdown[]
}

function MarkdownContent({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: (props) => (
          <h1 className='text-2xl font-semibold mb-4' {...props} />
        ),
        h2: (props) => <h2 className='text-xl font-semibold mb-3' {...props} />,
        h3: (props) => <h3 className='text-lg font-semibold mb-2' {...props} />,
        p: (props) => <p className='mb-4' {...props} />,
        ul: (props) => <ul className='list-disc pl-6 mb-4' {...props} />,
        ol: (props) => <ol className='list-decimal pl-6 mb-4' {...props} />,
        li: (props) => <li className='mb-1' {...props} />,
        table: (props) => (
          <table className='min-w-full border-collapse mb-4' {...props} />
        ),
        th: (props) => <th className='border px-4 py-2 text-left' {...props} />,
        td: (props) => <td className='border px-4 py-2' {...props} />,
      }}
    >
      {markdown}
    </ReactMarkdown>
  )
}

export function ReportViewer({
  report,
  imagesTextMarkdown,
}: ReportViewerProps) {
  const [tab, setTab] = React.useState('report')

  return (
    <div className='w-full h-full flex flex-col'>
      <div className='flex gap-1 mb-4'>
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors whitespace-nowrap ${
            tab === 'report'
              ? 'bg-background text-foreground shadow-sm'
              : 'bg-muted text-muted-foreground'
          } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
          onClick={() => setTab('report')}
        >
          Report
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors whitespace-nowrap ${
            tab === 'extracted'
              ? 'bg-background text-foreground shadow-sm'
              : 'bg-muted text-muted-foreground'
          } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
          onClick={() => setTab('extracted')}
        >
          Extracted Text
        </button>
      </div>
      <div className='w-full flex-1 border rounded-lg p-8 bg-background overflow-auto break-words'>
        {tab === 'report' ? (
          report ? (
            <MarkdownContent markdown={report} />
          ) : (
            <span className='text-muted-foreground'>
              No report generated yet. Please upload a PDF to view the report.
            </span>
          )
        ) : imagesTextMarkdown && imagesTextMarkdown.length > 0 ? (
          <div>
            {imagesTextMarkdown.map((img, idx) => (
              <div key={img.file} className='mb-8'>
                <div className='font-semibold mb-2'>{`Page ${idx + 1}`}</div>
                <MarkdownContent markdown={img.output} />
              </div>
            ))}
          </div>
        ) : (
          <span className='text-muted-foreground'>
            No extracted text yet. Please upload images to view extracted text.
          </span>
        )}
      </div>
    </div>
  )
}
