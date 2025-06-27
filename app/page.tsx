'use client'

import{ useState } from "react";
import Header from "@/components/ui/header";
import { FileUpload } from "@/components/ui/file-upload";
import { ReportViewer } from "@/components/ui/report-viewer";


export default function Home() {
  const [report, setReport] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleGenerateReport = () => {
    if (selectedFile) {
      setReport(`# Pathology Report\n\n**File Name:** ${selectedFile.name}\n\nThis is a placeholder report. Replace this logic with PDF parsing and report generation.`);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />
      <main className="flex flex-col items-center p-8 pb-20 gap-16 sm:p-20">
        <div className="w-full max-w-6xl grid grid-cols-12 gap-8 items-start">
          <div className="col-span-12 md:col-span-2 flex justify-center">
            <div className="w-full max-w-xs">
              <FileUpload onFileSelect={handleFileSelect} onGenerateReport={handleGenerateReport} selectedFile={selectedFile} />
            </div>
          </div>
          <div className="col-span-12 md:col-span-10">
            <ReportViewer report={report} />
          </div>
        </div>
      </main>
    </div>
  );
}
