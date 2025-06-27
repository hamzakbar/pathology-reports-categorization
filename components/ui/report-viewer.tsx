import React from "react";

interface ReportViewerProps {
  report?: string;
}

export function ReportViewer({ report }: ReportViewerProps) {
  return (
    <div className="w-full h-full border rounded-lg p-8 bg-background overflow-auto min-h-[300px]">
      {report ? (
        <pre className="whitespace-pre-wrap font-sans text-base">{report}</pre>
      ) : (
        <span className="text-muted-foreground">No report generated yet. Please upload a PDF to view the report.</span>
      )}
    </div>
  );
} 