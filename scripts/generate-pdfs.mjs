import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import PDFDocument from 'pdfkit'
import { en } from '../src/i18n/translations/en.js'
import { PROFILE } from '../src/data/profileConstants.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputDir = path.join(__dirname, '../public/downloads')

const COLORS = {
  text: '#1a1a1f',
  muted: '#5c5c66',
  accent: '#ff4520',
  line: '#e8e8ec',
}

function ensureOutputDir() {
  fs.mkdirSync(outputDir, { recursive: true })
}

function writePdf(filename, buildDoc) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 54, bottom: 54, left: 54, right: 54 },
      info: {
        Title: filename,
        Author: PROFILE.name,
      },
    })

    const outputPath = path.join(outputDir, filename)
    const stream = fs.createWriteStream(outputPath)
    doc.pipe(stream)
    buildDoc(doc)
    doc.end()

    stream.on('finish', () => {
      console.log(`Created ${outputPath}`)
      resolve(outputPath)
    })
    stream.on('error', reject)
  })
}

function pageBottom(doc) {
  return doc.page.height - doc.page.margins.bottom
}

function ensureSpace(doc, y, needed = 80) {
  if (y + needed > pageBottom(doc)) {
    doc.addPage()
    return doc.page.margins.top
  }
  return y
}

function drawRule(doc, y) {
  doc.strokeColor(COLORS.line).lineWidth(1)
  doc.moveTo(doc.page.margins.left, y).lineTo(doc.page.width - doc.page.margins.right, y).stroke()
  return y + 18
}

function drawSectionTitle(doc, title, y) {
  y = ensureSpace(doc, y, 40)
  doc.fillColor(COLORS.accent).font('Helvetica-Bold').fontSize(11).text(title.toUpperCase(), doc.page.margins.left, y, {
    characterSpacing: 0.8,
  })
  return y + 22
}

function drawParagraph(doc, text, y, options = {}) {
  const width = options.width || doc.page.width - doc.page.margins.left - doc.page.margins.right
  const fontSize = options.fontSize || 10.5
  const color = options.color || COLORS.text
  const lineGap = options.lineGap ?? 3

  doc.fillColor(color).font(options.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(fontSize)
  const height = doc.heightOfString(text, { width, lineGap })
  y = ensureSpace(doc, y, height + 10)
  doc.text(text, doc.page.margins.left, y, { width, lineGap })
  return y + height + (options.after ?? 14)
}

function drawBullets(doc, items, y) {
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right - 16

  for (const item of items) {
    y = ensureSpace(doc, y, 24)
    doc.fillColor(COLORS.accent).font('Helvetica-Bold').fontSize(10).text('•', doc.page.margins.left, y)
    doc.fillColor(COLORS.text).font('Helvetica').fontSize(10.5)
    const height = doc.heightOfString(item, { width, lineGap: 2 })
    y = ensureSpace(doc, y, height + 8)
    doc.text(item, doc.page.margins.left + 14, y, { width, lineGap: 2 })
    y += height + 8
  }

  return y + 4
}

function drawHeader(doc) {
  let y = doc.page.margins.top

  doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(28).text(PROFILE.name, doc.page.margins.left, y)
  y += 34

  doc.fillColor(COLORS.muted).font('Helvetica').fontSize(11.5).text(
    'Bridging Enterprise Strategy, Global Sourcing, and AI-Driven Product Prototyping',
    doc.page.margins.left,
    y,
    { width: doc.page.width - doc.page.margins.left - doc.page.margins.right },
  )
  y += 28

  doc.fontSize(10).text(
    `${en.home.hero.location}  |  ${PROFILE.email}  |  ${PROFILE.linkedinHandle}  |  ${PROFILE.website.replace('https://', '')}`,
    doc.page.margins.left,
    y,
    { width: doc.page.width - doc.page.margins.left - doc.page.margins.right, lineGap: 2 },
  )
  y += 28

  return drawRule(doc, y)
}

function buildResume(doc) {
  let y = drawHeader(doc)

  y = drawSectionTitle(doc, 'Professional Summary', y)
  y = drawParagraph(doc, en.home.hero.subtitle, y)
  y = drawParagraph(doc, en.home.about.body, y, { after: 8 })

  y = drawSectionTitle(doc, 'Core Skills', y)
  for (const group of en.home.skills.groups) {
    y = ensureSpace(doc, y, 30)
    doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(10.5).text(group.title, doc.page.margins.left, y)
    y += 16
    y = drawParagraph(doc, group.skills.join(' · '), y, { color: COLORS.muted, after: 10 })
  }

  y = drawSectionTitle(doc, 'Professional Experience', y)
  for (const role of en.home.experience.items) {
    y = ensureSpace(doc, y, 60)
    doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(12).text(role.role, doc.page.margins.left, y)
    doc.fillColor(COLORS.muted).font('Helvetica').fontSize(10).text(`${role.company}  |  ${role.period}`, doc.page.margins.left, y + 16)
    y += 34
    y = drawBullets(doc, role.highlights, y)
    y += 6
  }

  y = drawSectionTitle(doc, 'Selected Projects', y)
  for (const project of en.home.projects.items) {
    y = ensureSpace(doc, y, 40)
    doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(11).text(project.title, doc.page.margins.left, y)
    y += 16
    y = drawParagraph(doc, project.description, y, { color: COLORS.muted, after: 8 })
    y = drawParagraph(doc, project.tags.join(' · '), y, { fontSize: 9.5, color: COLORS.accent, after: 12 })
  }

  y = drawSectionTitle(doc, 'Marketing & Sourcing Highlight', y)
  y = drawParagraph(doc, en.home.experience.highlightCard.body, y)
  y = drawParagraph(doc, en.home.experience.highlightCard.companies, y, { bold: true, after: 8 })
  y = drawBullets(doc, en.home.experience.highlightCard.tags, y)

  doc.fillColor(COLORS.muted).font('Helvetica').fontSize(9).text(
    `Generated from ray-wong.com  ·  ${new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`,
    doc.page.margins.left,
    pageBottom(doc) - 10,
    { align: 'center', width: doc.page.width - doc.page.margins.left - doc.page.margins.right },
  )
}

function drawPortfolioCover(doc) {
  let y = doc.page.height * 0.28

  doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(34).text('Ray Wong', doc.page.margins.left, y, {
    align: 'center',
    width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
  })
  y += 48

  doc.fillColor(COLORS.accent).font('Helvetica-Bold').fontSize(16).text('Portfolio & Case Studies', doc.page.margins.left, y, {
    align: 'center',
    width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
  })
  y += 36

  doc.fillColor(COLORS.muted).font('Helvetica').fontSize(12).text(
    'Enterprise Strategy · Global Sourcing · AI-Driven Product Prototyping',
    doc.page.margins.left,
    y,
    { align: 'center', width: doc.page.width - doc.page.margins.left - doc.page.margins.right },
  )
  y += 52

  doc.fontSize(10.5).text(
    `${PROFILE.email}\n${PROFILE.website}\n${PROFILE.linkedin}`,
    doc.page.margins.left,
    y,
    { align: 'center', width: doc.page.width - doc.page.margins.left - doc.page.margins.right, lineGap: 4 },
  )
}

function drawProjectCase(doc, title, subtitle, sections, yStart) {
  doc.addPage()
  let y = doc.page.margins.top

  doc.fillColor(COLORS.accent).font('Helvetica-Bold').fontSize(10).text('CASE STUDY', doc.page.margins.left, y)
  y += 18
  doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(22).text(title, doc.page.margins.left, y, {
    width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
  })
  y += doc.heightOfString(title, { width: doc.page.width - doc.page.margins.left - doc.page.margins.right }) + 8
  y = drawParagraph(doc, subtitle, y, { color: COLORS.muted, fontSize: 11, after: 16 })
  y = drawRule(doc, y)

  for (const section of sections) {
    y = drawSectionTitle(doc, section.title, y)
    if (section.body) y = drawParagraph(doc, section.body, y)
    if (section.bullets) y = drawBullets(doc, section.bullets, y)
    if (section.items) {
      for (const item of section.items) {
        y = ensureSpace(doc, y, 40)
        doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(10.5).text(item.title, doc.page.margins.left, y)
        y += 14
        y = drawParagraph(doc, item.description || item.text, y, { color: COLORS.muted, after: 10 })
      }
    }
  }

  return y
}

function buildPortfolio(doc) {
  drawPortfolioCover(doc)

  doc.addPage()
  let y = doc.page.margins.top
  y = drawSectionTitle(doc, 'About Ray Wong', y)
  for (const paragraph of en.aboutPage.story.paragraphs) {
    y = drawParagraph(doc, paragraph, y)
  }

  y = drawSectionTitle(doc, 'Core Strengths', y)
  for (const value of en.aboutPage.values.items) {
    y = ensureSpace(doc, y, 40)
    doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(11).text(value.title, doc.page.margins.left, y)
    y += 16
    y = drawParagraph(doc, value.text, y, { color: COLORS.muted, after: 12 })
  }

  drawProjectCase(doc, 'Custom FPL Engagement Platform — Faleague', en.fpl.hero.description, [
    { title: 'Overview', body: en.fpl.overview.body },
    { title: 'Impact', bullets: en.fpl.metrics.items.map((item) => `${item.value} — ${item.label}`) },
    { title: 'Product Modules', items: en.fpl.modules.items },
    { title: 'Build Approach', bullets: en.fpl.build.highlights },
  ])

  drawProjectCase(doc, 'Amateur Football Club Management Tool — FPL United', en.club.hero.description, [
    { title: 'Overview', body: en.club.overview.subtitle },
    { title: 'Impact', bullets: en.club.metrics.items.map((item) => `${item.value} — ${item.label}`) },
    { title: 'Modules', items: en.club.modules.items },
    { title: 'Build Journey', bullets: [en.club.build.prototype.body, en.club.build.production.body, en.club.build.tech.join(' · ')] },
  ])

  drawProjectCase(doc, 'Sternespieler 3D Mascot', en.sternespieler.hero.description, [
    { title: 'Overview', body: en.sternespieler.overview.body },
    { title: 'Highlights', bullets: en.sternespieler.metrics.items.map((item) => `${item.value} — ${item.label}`) },
    { title: 'Render Studies', items: en.sternespieler.screenshots.items.map((item) => ({ title: item.title, text: item.caption })) },
  ])

  doc.addPage()
  y = doc.page.margins.top
  y = drawSectionTitle(doc, 'Content Creator · FPL China', y)
  y = drawParagraph(doc, en.content.hero.description, y)
  y = drawSectionTitle(doc, 'Platforms', y)
  for (const item of en.home.content.items) {
    y = ensureSpace(doc, y, 40)
    doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(11).text(item.title, doc.page.margins.left, y)
    y += 16
    y = drawParagraph(doc, item.description, y, { color: COLORS.muted, after: 10 })
  }

  y = drawSectionTitle(doc, 'Enterprise Experience', y)
  y = drawParagraph(doc, en.home.experience.subtitle, y)
  for (const role of en.home.experience.items) {
    y = ensureSpace(doc, y, 34)
    doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(10.5).text(`${role.role} — ${role.company}`, doc.page.margins.left, y)
    y += 14
    doc.fillColor(COLORS.muted).font('Helvetica').fontSize(9.5).text(role.period, doc.page.margins.left, y)
    y += 16
  }

  y = drawSectionTitle(doc, 'Contact', y)
  y = drawParagraph(doc, en.home.contact.body, y)
  y = drawParagraph(
    doc,
    `${PROFILE.email}  ·  ${PROFILE.linkedin}  ·  WeChat: ${PROFILE.wechat}  ·  ${PROFILE.website}`,
    y,
    { color: COLORS.muted },
  )
}

ensureOutputDir()
await writePdf('ray-wong-resume.pdf', buildResume)
await writePdf('ray-wong-portfolio.pdf', buildPortfolio)
