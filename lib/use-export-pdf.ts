import { useState } from 'react'
import { PDFDocument, rgb, PDFFont } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

export function useExportPdf() {
  const [isExporting, setIsExporting] = useState(false)

  const exportPdf = async (selectedFile: File | null, report: string) => {
    if (!selectedFile || !report) {
      alert('No report available to export.')
      return
    }

    setIsExporting(true)
    try {
      const fontUrl = '/fonts/NotoSans-Regular.ttf'
      const boldFontUrl = '/fonts/NotoSans-Bold.ttf'

      const [fontBytes, boldFontBytes] = await Promise.all([
        fetch(fontUrl).then((res) => res.arrayBuffer()),
        fetch(boldFontUrl).then((res) => res.arrayBuffer()),
      ])

      const originalPdfBytes = await selectedFile.arrayBuffer()
      const pdfDoc = await PDFDocument.load(originalPdfBytes)

      pdfDoc.registerFontkit(fontkit)

      const geistFont = await pdfDoc.embedFont(fontBytes)
      const geistBoldFont = await pdfDoc.embedFont(boldFontBytes)

      const originalPages = pdfDoc.getPages()
      const pageSize =
        originalPages.length > 0
          ? originalPages[0].getSize()
          : { width: 595, height: 842 }

      let page = pdfDoc.addPage([pageSize.width, pageSize.height])
      const { width, height } = page.getSize()
      const margin = 50
      let y = height - margin
      let currentX = margin

      const drawWord = (word: string, font: PDFFont, size: number) => {
        const wordWidth = font.widthOfTextAtSize(word, size)
        if (currentX + wordWidth > width - margin) {
          y -= size * 1.5
          currentX = margin
          if (y < margin) {
            page = pdfDoc.addPage([width, height])
            y = height - margin
          }
        }
        page.drawText(word, { x: currentX, y, font, size, color: rgb(0, 0, 0) })
        currentX += font.widthOfTextAtSize(word, size)
      }

      page.drawText('Report Summary', {
        x: margin,
        y,
        font: geistBoldFont,
        size: 18,
        color: rgb(0, 0, 0),
      })
      y -= 18 * 1.5 + 15

      const reportLines = report.split('\n')
      for (let i = 0; i < reportLines.length; i++) {
        const line = reportLines[i];
        currentX = margin;
        if (y < margin) {
          page = pdfDoc.addPage([width, height]);
          y = height - margin;
        }
        if (line.trim().length === 0) {
          y -= 11 * 0.5;
          continue;
        }

        let baseFont = geistFont;
        let baseSize = 11;
        let content = line;

        if (content.startsWith('### ')) {
          baseFont = geistBoldFont;
          baseSize = 14;
          content = content.substring(4);
        } else if (content.startsWith('- ')) {
          page.drawText('•', {
            x: currentX,
            y,
            font: geistFont,
            size: baseSize,
          });
          currentX += 15;
          content = content.substring(2);
        }

        const segments = content.split(/(\*\*.*?\*\*)/g).filter(Boolean);
        for (const segment of segments) {
          const isBold = segment.startsWith('**') && segment.endsWith('**');
          const text = isBold ? segment.slice(2, -2) : segment;
          const font = isBold ? geistBoldFont : baseFont;

          const words = text.split(' ').filter(Boolean);
          for (const word of words) {
            drawWord(word + ' ', font, baseSize);
          }
        }
        if (!content.startsWith('- ') && !content.startsWith('### ')) {
          y -= baseSize * 2.2;
        } else {
          y -= baseSize * 1.5;
        }
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${selectedFile.name.replace('.pdf', '')}-updated.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    } catch (err) {
      console.error('Failed to export PDF:', err)
      alert('An error occurred while exporting the PDF.')
    } finally {
      setIsExporting(false)
    }
  }

  return { exportPdf, isExporting }
}
