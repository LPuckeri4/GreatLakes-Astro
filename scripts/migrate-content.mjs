/**
 * Migration script: reads old React source files and generates clean Astro pages.
 * Run from the greatlakes-astro directory: node scripts/migrate-content.mjs
 */

import fs from 'fs';
import path from 'path';

const OLD_SRC = '/Users/lukepuck/Desktop/dev/Greatlakes/frontend/src';
const NEW_SRC = '/Users/lukepuck/Desktop/dev/greatlakes-astro/src';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readFile(p) {
  return fs.readFileSync(p, 'utf8');
}

function writeFile(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, 'utf8');
  console.log('✓ wrote', p.replace(NEW_SRC, 'src'));
}

/** Extract the text/JSX body of a named prop, e.g. text={`...`} or text="..." */
function extractPropText(source, propName) {
  // text={`...`}
  const backtick = new RegExp(propName + '=\\{`([\\s\\S]*?)`\\}');
  const m1 = source.match(backtick);
  if (m1) return m1[1].trim();
  // text="..."
  const quote = new RegExp(`${propName}="([^"]*)"`);
  const m2 = source.match(quote);
  if (m2) return m2[1].trim();
  return '';
}

/**
 * Parse all QuestionAccordion usages from a JSX source string.
 * Returns array of { title, text } where text may be empty (children-based).
 */
function parseAccordions(source) {
  const accordions = [];
  // Match <QuestionAccordion ... > ... </QuestionAccordion>
  const blockRe = /<QuestionAccordion([\s\S]*?)>([\s\S]*?)<\/QuestionAccordion>/g;
  let m;
  while ((m = blockRe.exec(source)) !== null) {
    const attrs = m[1];
    const children = m[2].trim();

    // Extract title
    const titleMatch = attrs.match(/title="([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : '';

    // Extract text prop if present
    const textMatch = attrs.match(/text=\{`([\s\S]*?)`\}/) || attrs.match(/text="([^"]*)"/);
    const textProp = textMatch ? textMatch[1].trim() : '';

    // Determine content: prefer text prop, fall back to JSX children
    let content = textProp || children;

    // Clean up JSX from children content
    content = cleanJsx(content);

    accordions.push({ title, content });
  }

  // Also handle self-closing with text prop: <QuestionAccordion title="..." text="..." />
  const selfRe = /<QuestionAccordion([^>]+?)\/>/g;
  while ((m = selfRe.exec(source)) !== null) {
    const attrs = m[1];
    const titleMatch = attrs.match(/title="([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : '';
    const textMatch = attrs.match(/text=\{`([\s\S]*?)`\}/) || attrs.match(/text="([^"]*)"/);
    const content = textMatch ? cleanJsx(textMatch[1].trim()) : '';
    accordions.push({ title, content });
  }

  return accordions;
}

/** Strip JSX-specific syntax from content, leaving HTML-safe text */
function cleanJsx(text) {
  return text
    .replace(/\{" "\}/g, ' ')
    .replace(/\{`/g, '')
    .replace(/`\}/g, '')
    .replace(/style=\{\{[^}]+\}\}/g, '')
    .replace(/<Typography[^>]*>/g, '')
    .replace(/<\/Typography>/g, '')
    .replace(/<Grid[^>]*>/g, '')
    .replace(/<\/Grid>/g, '')
    .replace(/<Box[^>]*>/g, '')
    .replace(/<\/Box>/g, '')
    .replace(/sx=\{\{[\s\S]*?\}\}/g, '')
    .replace(/className="[^"]*"/g, '')
    .replace(/style=\{\{[\s\S]*?\}\}/g, '')
    // Convert JSX anchor to HTML
    .replace(/<a\s+style=\{\{[^}]*color:\s*"([^"]+)"[^}]*\}\}\s+href="([^"]+)">/g, '<a style="color: $1; text-decoration: none; font-weight: bold;" href="$2">')
    .replace(/<a\s+href="([^"]+)"\s+style=\{\{[^}]*\}\}>/g, '<a href="$1" style="color: #3A959B; text-decoration: none; font-weight: bold;">')
    .replace(/<br \/>/g, '<br />')
    .replace(/\{" "\}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Extract the first <Typography> body text (intro paragraph) */
function extractIntro(source) {
  // Match first <Typography ...>...</Typography> that isn't a heading
  const m = source.match(/<Typography(?:\s+sx=\{[^}]+\})?\s*>\s*([\s\S]+?)<\/Typography>/);
  if (!m) return '';
  // Skip if it's a heading (contains variant="h")
  const pre = source.substring(0, m.index);
  const variantMatch = source.substring(m.index - 100, m.index).match(/variant="h\d"/);
  if (variantMatch) {
    // Try to find next one
    const rest = source.substring(m.index + m[0].length);
    const m2 = rest.match(/<Typography(?:\s+sx=\{[^}]+\})?\s*>\s*([\s\S]+?)<\/Typography>/);
    return m2 ? cleanJsx(m2[1]) : '';
  }
  return cleanJsx(m[1]);
}

/** Extract YouTube iframe src */
function extractYoutube(source) {
  const m = source.match(/src="(https:\/\/www\.youtube\.com\/embed\/[^"]+)"/);
  return m ? m[1] : null;
}

/** Extract the page heading (variant="h5" text) */
function extractHeading(source) {
  const m = source.match(/variant="h5"[\s\S]*?>\s*([\s\S]*?)\s*<UnderlineB/);
  if (m) return cleanJsx(m[1]).replace(/<[^>]+>/g, '').trim();
  const m2 = source.match(/variant="h4"[\s\S]*?>\s*([\s\S]*?)\s*<UnderlineT/);
  if (m2) return cleanJsx(m2[1]).replace(/<[^>]+>/g, '').trim();
  return '';
}

// ─── Surgery nav items (shared) ──────────────────────────────────────────────

const surgeryNav = [
  { label: 'Dental Implants', href: '/surgery/dental-implants', image: '/img/tooth1.png' },
  { label: 'Wisdom Teeth', href: '/surgery/wisdom-teeth', image: '/img/tooth2.png' },
  { label: 'Tooth Extraction', href: '/surgery/tooth-extraction', image: '/img/tooth3.png' },
  { label: 'Bone Grafting', href: '/surgery/bone-grafting', image: '/img/tooth4.png' },
  { label: 'Orthodontic Surgery', href: '/surgery/orthodontic-surgery', image: '/img/tooth5.png' },
  { label: 'Facial Trauma', href: '/surgery/facial-trauma', image: '/img/tooth6.png' },
  { label: 'Oral Pathology', href: '/surgery/oral-pathology', image: '/img/tooth7.png' },
  { label: 'Jaw Corrective', href: '/surgery/jaw-corrective', image: '/img/tooth8.png' },
  { label: 'TMJ Disorder', href: '/surgery/tmj-disorder', image: '/img/tooth9.png' },
];

const afterNav = [
  { label: 'General Instructions', href: '/after-surgery/general-instructions', image: '/img/tooth10.png' },
  { label: 'Tooth Removal', href: '/after-surgery/tooth-removal', image: '/img/tooth3.png' },
  { label: 'Wisdom Teeth Removal', href: '/after-surgery/wisdom-teeth-removal', image: '/img/tooth2.png' },
  { label: 'Facial Trauma', href: '/after-surgery/facial-trauma', image: '/img/tooth6.png' },
  { label: 'Exposure of Impacted Tooth', href: '/after-surgery/exposure-of-impacted-tooth', image: '/img/tooth11.png' },
  { label: 'Placement of Dental Implants', href: '/after-surgery/placement-of-dental-implants', image: '/img/tooth1.png' },
  { label: 'Removal of Multiple Teeth', href: '/after-surgery/removal-of-multiple-teeth', image: '/img/tooth12.png' },
];

// ─── Template builders ───────────────────────────────────────────────────────

function navItemsCode(items) {
  return `[\n${items.map(i =>
    `  { label: '${i.label}', href: '${i.href}', image: '${i.image}' },`
  ).join('\n')}\n]`;
}

function buildSurgeryPage({ slug, title, metaTitle, intro, youtube, accordions }) {
  const ytBlock = youtube ? `
    <div class="mb-10">
      <iframe
        class="w-full max-w-[600px] aspect-video"
        src="${youtube}"
        title="${title}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
` : '';

  const accordionBlocks = accordions.map(a => `
    <Accordion title="${a.title.replace(/"/g, '&quot;')}">
      ${a.content}
    </Accordion>`).join('\n');

  return `---
import Layout from '../../layouts/Layout.astro';
import SidebarLayout from '../../components/shared/SidebarLayout.astro';
import PageHeading from '../../components/shared/PageHeading.astro';
import Accordion from '../../components/shared/Accordion.astro';

const navItems = ${navItemsCode(surgeryNav)};
---

<Layout title="${metaTitle} - Great Lakes Oral & Maxillofacial Surgery Centre">
  <SidebarLayout title="Our Procedures" navItems={navItems} currentPath={Astro.url.pathname}>
    <PageHeading title="${title}" />
    <p class="mb-8 leading-relaxed" style="color: #515151">${intro}</p>
${ytBlock}${accordionBlocks}
  </SidebarLayout>
</Layout>
`;
}

function buildAfterPage({ slug, title, metaTitle, intro, youtube, accordions, footer }) {
  const ytBlock = youtube ? `
    <div class="mb-10">
      <iframe
        class="w-full max-w-[600px] aspect-video"
        src="${youtube}"
        title="${title}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
` : '';

  const accordionBlocks = accordions.map(a => `
    <Accordion title="${a.title.replace(/"/g, '&quot;')}">
      ${a.content}
    </Accordion>`).join('\n');

  const footerBlock = footer ? `\n    <p class="mt-8 text-center max-w-[70%] mx-auto leading-relaxed" style="color: #515151">${footer}</p>` : '';

  return `---
import Layout from '../../layouts/Layout.astro';
import SidebarLayout from '../../components/shared/SidebarLayout.astro';
import PageHeading from '../../components/shared/PageHeading.astro';
import Accordion from '../../components/shared/Accordion.astro';

const navItems = ${navItemsCode(afterNav)};
---

<Layout title="${metaTitle} - Great Lakes Oral & Maxillofacial Surgery Centre">
  <SidebarLayout title="After a Procedure" navItems={navItems} currentPath={Astro.url.pathname}>
    <PageHeading title="${title}" />
    <p class="mb-8 leading-relaxed" style="color: #515151">${intro}</p>
${ytBlock}${accordionBlocks}${footerBlock}
  </SidebarLayout>
</Layout>
`;
}

// ─── Process surgery pages ────────────────────────────────────────────────────

const surgeryFiles = [
  { file: 'WisdomTeeth.js', slug: 'wisdom-teeth' },
  { file: 'Extraction.js', slug: 'tooth-extraction' },
  { file: 'BoneGrafting.js', slug: 'bone-grafting' },
  { file: 'OrthodonticSurgery.js', slug: 'orthodontic-surgery' },
  { file: 'FacialTrauma.js', slug: 'facial-trauma' },
  { file: 'OralPathology.js', slug: 'oral-pathology' },
  { file: 'CorrectiveJaw.js', slug: 'jaw-corrective' },
  { file: 'TMJDisorder.js', slug: 'tmj-disorder' },
];

for (const { file, slug } of surgeryFiles) {
  const src = readFile(path.join(OLD_SRC, 'surgery', file));
  const heading = extractHeading(src);
  const intro = extractIntro(src);
  const youtube = extractYoutube(src);
  const accordions = parseAccordions(src);

  const content = buildSurgeryPage({
    slug,
    title: heading,
    metaTitle: heading,
    intro,
    youtube,
    accordions,
  });

  writeFile(path.join(NEW_SRC, 'pages/surgery', `${slug}.astro`), content);
}

// ─── Process after-surgery pages ─────────────────────────────────────────────

const afterFiles = [
  { file: 'GeneralInstructions.js', slug: 'general-instructions' },
  { file: 'ToothRemoval.js', slug: 'tooth-removal' },
  { file: 'AfterWisdom.js', slug: 'wisdom-teeth-removal' },
  { file: 'AfterFacialTrauma.js', slug: 'facial-trauma' },
  { file: 'ExposureImpact.js', slug: 'exposure-of-impacted-tooth' },
  { file: 'Placement.js', slug: 'placement-of-dental-implants' },
  { file: 'MultipleTeeth.js', slug: 'removal-of-multiple-teeth' },
];

for (const { file, slug } of afterFiles) {
  const src = readFile(path.join(OLD_SRC, 'aftersurgery', file));
  const heading = extractHeading(src);
  const intro = extractIntro(src);
  const youtube = extractYoutube(src);
  const accordions = parseAccordions(src);

  const content = buildAfterPage({
    slug,
    title: heading,
    metaTitle: heading,
    intro,
    youtube,
    accordions,
  });

  writeFile(path.join(NEW_SRC, 'pages/after-surgery', `${slug}.astro`), content);
}

// ─── After-surgery index redirect ────────────────────────────────────────────

writeFile(
  path.join(NEW_SRC, 'pages/after-surgery/index.astro'),
  `---\nreturn Astro.redirect('/after-surgery/general-instructions');\n---\n`
);

console.log('\n✅ Migration complete!');
