import puppeteer from 'puppeteer-core'
import fs from 'node:fs'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const URL = 'http://localhost:5199/'
const OUT = 'C:/Users/yashp/AppData/Local/Temp/opencode/e2e'
fs.mkdirSync(OUT, { recursive: true })

const results = []
const check = (name, ok, extra = '') => {
  results.push(`${ok ? 'PASS' : 'FAIL'}: ${name}${extra ? ' — ' + extra : ''}`)
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}${extra ? ' — ' + extra : ''}`)
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
  defaultViewport: { width: 1440, height: 900 },
})

const page = await browser.newPage()
const consoleErrors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text())
})
page.on('pageerror', (err) => consoleErrors.push('PAGEERROR: ' + err.message))

const cdp = await page.createCDPSession()
await cdp.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: OUT })

await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForSelector('text=Quotation Studio', { timeout: 15000 })

const bodyText = await page.$eval('body', (b) => b.textContent)
check('App header renders', bodyText.includes('Quotation Studio'))
check('Starts blank (no demo client)', !bodyText.includes('Rahul Patel'))
check('No demo totals shown', !bodyText.includes('₹8,26,000'))
check('Empty functions state shown', bodyText.includes('No functions yet'))

const inputValues = await page.$$eval('input', (els) =>
  els.map((el) => el.value).filter((v) => v.length > 0),
)
check('Client fields are empty', inputValues.length === 0, inputValues.join(', '))

await new Promise((r) => setTimeout(r, 800))
const freshBody = await page.$eval('body', (b) => b.textContent)
check('No render loop (page stable)', freshBody === bodyText, bodyText.length + ' vs ' + freshBody.length)

// Open preview
const previewBtn = await page.evaluateHandle(() => {
  return [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Preview')
})
await previewBtn.asElement().click()
await page.waitForSelector('#preview-pages .pdf-page', { timeout: 15000 })
await new Promise((r) => setTimeout(r, 1500))

const pageCount = await page.$$eval('#preview-pages .pdf-page', (els) => els.length)
check('Preview opens with 3 blank pages', pageCount === 3, `found ${pageCount}`)

const modalText = await page.$eval('#preview-pages', (el) => el.textContent)
check('Blank cover has no client name', !modalText.includes('Rahul Patel'))
check('Summary page renders', modalText.includes('Quotation Summary'))
check('Terms page renders', modalText.includes('Terms'))
await page.screenshot({ path: `${OUT}/preview-blank.png`, fullPage: false })

// Export PDF — headless Chrome here never emits real downloads (no download
// events fire at all), so we re-run exportPagesToPdf in-page and validate the
// returned Blob (same code path as the Export button, minus pdf.save()).
const clickExport = await page.evaluateHandle(() => {
  const toolbar = document.querySelector('[data-testid="preview-toolbar"]')
  return [...toolbar.querySelectorAll('button')].find((b) => b.textContent.includes('Download PDF'))
})
await clickExport.asElement().click()
let successToast = false
for (let i = 0; i < 30; i++) {
  await new Promise((r) => setTimeout(r, 500))
  successToast = await page.evaluate(() =>
    [...document.querySelectorAll('[data-sonner-toast]')].some((t) =>
      t.textContent.includes('exported'),
    ),
  )
  if (successToast) break
}
check('Export button completes with success toast', successToast)

const pdfInfo = await page.evaluate(async () => {
  const container = document.getElementById('preview-pages')
  const mod = await import('/src/pdf/exportPdf.ts')
  const blob = await mod.exportPagesToPdf(container, 'e2e-quotation.pdf')
  const head = new Uint8Array(await blob.slice(0, 8).arrayBuffer())
  let text = ''
  for (let i = 0; i < head.length; i++) text += String.fromCharCode(head[i])
  return { size: blob.size, head }
})
check('PDF blob produced', pdfInfo.size > 50000, `${(pdfInfo.size / 1024).toFixed(0)} KB`)

const pdfHeadStr = await page.evaluate(async () => {
  const container = document.getElementById('preview-pages')
  const mod = await import('/src/pdf/exportPdf.ts')
  const blob = await mod.exportPagesToPdf(container, 'e2e-quotation.pdf')
  const text = await blob.text()
  return { head: text.slice(0, 8), pages: (text.match(/\/Type\s*\/Page[^s]/g) || []).length }
})
check('Valid PDF header', pdfHeadStr.head.startsWith('%PDF-'), pdfHeadStr.head)
check('PDF has 3 pages', pdfHeadStr.pages === 3, `found ${pdfHeadStr.pages}`)

console.log('--- CONSOLE ERRORS ---')
consoleErrors.forEach((e) => console.log('  ' + e.slice(0, 250)))
check('No console errors', consoleErrors.length === 0, consoleErrors.join(' | ').slice(0, 250))

await browser.close()
console.log('--- SUMMARY ---')
results.forEach((r) => console.log(r))