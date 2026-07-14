import fs from 'fs'
import path from 'path'

const [, , jsonPath, outPath] = process.argv
if (!jsonPath || !outPath) {
  console.error('Usage: node save-cdp-screenshot.mjs <cdp-json> <output.png>')
  process.exit(1)
}

const raw = fs.readFileSync(jsonPath, 'utf8')
const parsed = JSON.parse(raw)
const data = parsed.data || parsed.result?.data
if (!data) {
  console.error('No image data found in', jsonPath)
  process.exit(1)
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, Buffer.from(data, 'base64'))
console.log(`Saved ${outPath} (${Buffer.from(data, 'base64').length} bytes)`)
