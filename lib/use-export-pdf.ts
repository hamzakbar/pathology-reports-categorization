'use client'

import { useState } from 'react'
import { PDFDocument, rgb, PDFFont } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false)

  const exportPdf = async (selectedFile: File | null, report: string) => {
    if (!selectedFile || !report) {
      alert('No report available to export.')
      return
    }

    setIsExporting(true)
    try {
      const sanitizedReport = report
        .replace(/≤/g, '<=')
        .replace(/≥/g, '>=');

      const fontBytes = await fetch('/fonts/NotoSans-Regular.ttf').then((res) => res.arrayBuffer())
      const boldFontBytes = await fetch('/fonts/NotoSans-Bold.ttf').then((res) => res.arrayBuffer())
      const originalPdfBytes = await selectedFile.arrayBuffer()

      const pdfDoc = await PDFDocument.load(originalPdfBytes)
      pdfDoc.registerFontkit(fontkit)

      const regularFont = await pdfDoc.embedFont(fontBytes)
      const boldFont = await pdfDoc.embedFont(boldFontBytes)

      const originalPages = pdfDoc.getPages()
      const pageSize = originalPages.length > 0 ? originalPages[0].getSize() : { width: 595, height: 842 }

      let page = pdfDoc.addPage([pageSize.width, pageSize.height])
      const { width, height } = page.getSize()
      const margin = 50
      const bottomMargin = 50
      let y = height - margin

      const drawFormattedLine = (line: string) => {
        if (y < bottomMargin) {
          page = pdfDoc.addPage([pageSize.width, pageSize.height]);
          y = height - margin;
        }

        let baseFont = regularFont;
        let baseSize = 11;
        let content = line;
        let startingX = margin;

        if (content.startsWith('---')) { y -= 10; return; }

        const listMatch = content.match(/^(\s*)-\s(.*)/);

        if (listMatch) {
          const indentSpaces = listMatch[1].length;
          const indentLevel = Math.floor(indentSpaces / 2);
          const indentWidth = indentLevel * 20;

          startingX += indentWidth;
          page.drawText('•', { x: startingX, y, font: regularFont, size: baseSize, color: rgb(0, 0, 0) });
          startingX += 15;
          content = listMatch[2];
        } else if (content.startsWith('# ')) {
          baseFont = boldFont; baseSize = 16; content = content.substring(2);
        } else if (content.startsWith('## ')) {
          baseFont = boldFont; baseSize = 14; content = content.substring(3);
        } else if (content.startsWith('### ')) {
          baseFont = boldFont; baseSize = 12; content = content.substring(4);
        }

        const segments = content.split(/(\*\*.*?\*\*)/g).filter(Boolean);
        let currentX = startingX;

        for (const segment of segments) {
          const isBold = segment.startsWith('**') && segment.endsWith('**');
          const text = isBold ? segment.slice(2, -2) : segment;
          const font = isBold ? boldFont : baseFont;

          const words = text.split(' ');
          for (const word of words) {
            if (word.length === 0) continue;

            const wordWithSpace = word + ' ';
            const wordWidth = font.widthOfTextAtSize(wordWithSpace, baseSize);

            if (currentX + wordWidth > width - margin) {
              y -= baseSize * 1.5;
              currentX = startingX;
              if (y < bottomMargin) {
                page = pdfDoc.addPage([pageSize.width, pageSize.height]);
                y = height - margin;
              }
            }

            page.drawText(wordWithSpace, { x: currentX, y, font, size: baseSize, color: rgb(0, 0, 0) });
            currentX += wordWidth;
          }
        }
        y -= baseSize * 1.5;
      };

      y -= 20; 

      const reportLines = sanitizedReport.split('\n');
      for (const line of reportLines) {
        if (line.startsWith('# ')) {
          y -= 15; 
        }

        if (line.trim().length > 0) {
          drawFormattedLine(line);
        } else {
          y -= 11 * 0.5; 
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${selectedFile.name.replace('.pdf', '')}-updated.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('An error occurred while exporting the PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  return { exportPdf, isExporting };
}