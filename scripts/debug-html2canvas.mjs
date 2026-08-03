import puppeteer from 'puppeteer-core'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const URL = 'http://localhost:5199/'

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
  defaultViewport: { width: 1440, height: 900 },
})
const page = await browser.newPage()
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForSelector('text=Quotation Studio', { timeout: 15000 })
const previewBtn = await page.evaluateHandle(() => {
  return [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Preview')
})
await previewBtn.asElement().click()
await page.waitForSelector('#preview-pages .pdf-page', { timeout: 20000 })
await new Promise((r) => setTimeout(r, 1500))

// load html2canvas into page via dynamic import of the module URL from the app bundle
const result = await page.evaluate(async () => {
  const out = []
  const mod = await import('/node_modules/html2canvas-pro/dist/html2canvas-pro.esm.js')
  const h2c = mod.default

  const tryCapture = async (name, sel, mutate) => {
    const el = document.querySelector(sel)
    if (!el) { out.push({ name, status: 'NO ELEMENT' }); return }
    if (mutate) mutate(el)
    try {
      await h2c(el, { scale: 1, backgroundColor: '#fff', logging: false })
      out.push({ name, status: 'OK' })
    } catch (e) {
      out.push({ name, status: 'ERR: ' + String(e).slice(0, 120) })
    }
  }

  await tryCapture('body', 'body')
  await tryCapture('preview-pages container', '#preview-pages')
  const first = document.querySelector('.pdf-page')
  await tryCapture('first pdf-page (pristine)', '.pdf-page')

  const el = first.cloneNode(true)
  el.style.position = 'absolute'
  el.style.left = '-10000px'
  el.style.top = '0'
  document.body.appendChild(el)
  try {
    await h2c(el, { scale: 1, backgroundColor: '#fff', logging: false })
    out.push({ name: 'detached clone of pdf-page', status: 'OK' })
  } catch (e) {
    out.push({ name: 'detached clone of pdf-page', status: 'ERR: ' + String(e).slice(0, 120) })
  }

  // strip decorations
  const el2 = first.cloneNode(true)
  el2.id = 'strip-test'
  el2.querySelectorAll('svg').forEach((s) => s.remove())
  el2.querySelectorAll('[class*="pointer-events-none"]').forEach((s) => s.remove())
  el2.style.position = 'absolute'
  el2.style.left = '-10000px'
  el2.style.top = '0'
  document.body.appendChild(el2)
  try {
    await h2c(el2, { scale: 1, backgroundColor: '#fff', logging: false })
    out.push({ name: 'stripped clone (no svg, no decorations)', status: 'OK' })
  } catch (e) {
    out.push({ name: 'stripped clone (no svg, no decorations)', status: 'ERR: ' + String(e).slice(0, 120) })
  }

  return out
})

result.forEach((r) => console.log(r.status.padEnd(70) + ' <- ' + r.name))
await browser.close()
