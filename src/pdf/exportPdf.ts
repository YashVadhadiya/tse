import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas-pro'

const PAGE_W_MM = 210
const PAGE_H_MM = 297

export async function exportPagesToPdf(
  container: HTMLElement,
  filename: string,
): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })

  const pageElements = Array.from(
    container.querySelectorAll<HTMLElement>('.pdf-page'),
  )

  for (let i = 0; i < pageElements.length; i++) {
    const el = container.querySelectorAll<HTMLElement>('.pdf-page')[i]
    if (!el || !el.isConnected) {
      throw new Error(`Page ${i + 1} is not attached to the document`)
    }
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })
    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    if (i > 0) pdf.addPage()
    pdf.addImage(
      imgData,
      'JPEG',
      0,
      0,
      PAGE_W_MM,
      PAGE_H_MM,
      undefined,
      'FAST',
    )
  }

  pdf.save(filename)
  return pdf.output('blob')
}
