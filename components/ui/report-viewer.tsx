import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ReportViewerProps {
  report?: string
}

export function ReportViewer({ report }: ReportViewerProps) {
  return (
    <div className='w-full h-full border rounded-lg p-8 bg-background overflow-auto break-words'>
      {report ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: (props) => (
              <h1 className='text-2xl font-bold mb-4' {...props} />
            ),
            h2: (props) => <h2 className='text-xl font-bold mb-3' {...props} />,
            h3: (props) => <h3 className='text-lg font-bold mb-2' {...props} />,
            p: (props) => <p className='mb-4' {...props} />,
            ul: (props) => <ul className='list-disc pl-6 mb-4' {...props} />,
            ol: (props) => <ol className='list-decimal pl-6 mb-4' {...props} />,
            li: (props) => <li className='mb-1' {...props} />,
            table: (props) => (
              <table className='min-w-full border-collapse mb-4' {...props} />
            ),
            th: (props) => (
              <th className='border px-4 py-2 text-left' {...props} />
            ),
            td: (props) => <td className='border px-4 py-2' {...props} />,
          }}
        >
          {report}
        </ReactMarkdown>
      ) : (
        <span className='text-muted-foreground'>
          No report generated yet. Please upload a PDF to view the report.
        </span>
      )}
    </div>
  )
}
