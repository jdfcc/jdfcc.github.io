import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import matter from 'gray-matter';

const repoRoot = process.cwd();
const sourceDir = path.join(repoRoot, '_posts');
const targetDir = path.join(repoRoot, 'src', 'content', 'posts');

function normalizeStaticPath(value) {
  if (!value || /^(?:[a-z]+:)?\/\//i.test(value) || /^(?:#|\/|data:|mailto:|tel:)/i.test(value)) {
    return value;
  }

  if (value.startsWith('./')) {
    value = value.slice(2);
  }

  if (value.startsWith('assets/') || value.startsWith('img/')) {
    return `/${value}`;
  }

  return value;
}

function rewriteAssetPaths(content) {
  return content
    .replace(/(<(?:img|audio|video|source)\b[^>]*?\s(?:src|poster)=['"])([^'"]+)(['"])/gi, (_, prefix, value, suffix) => {
      return `${prefix}${normalizeStaticPath(value)}${suffix}`;
    })
    .replace(/(!\[[^\]]*\]\()([^\)\s]+)(\))/g, (_, prefix, value, suffix) => {
      return `${prefix}${normalizeStaticPath(value)}${suffix}`;
    })
    .replace(/(\[[^\]]*\]\()([^\)\s]+)(\))/g, (_, prefix, value, suffix) => {
      return `${prefix}${normalizeStaticPath(value)}${suffix}`;
    })
    .replace(/^\[TOC\]\s*$/gim, '')
    .trimStart();
}

function slugify(value) {
  return value
    .trim()
    .replace(/^[0-9]{4}-[0-9]{2}-[0-9]{2}-/, '')
    .replace(/\.[^.]+$/, '')
    .replace(/\s+/g, '-')
    .replace(/[/:*?"<>|]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'post';
}

function isValidDate(value) {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function parseDateCandidate(value) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(String(value));
  return isValidDate(date) ? date : undefined;
}

function getFilenameDate(fileName) {
  const match = fileName.match(/^(\d{4}-\d{2}-\d{2})-/);
  return match ? parseDateCandidate(match[1]) : undefined;
}

function getGitCreatedDate(filePath) {
  try {
    const relative = path.relative(repoRoot, filePath).replace(/\\/g, '/');
    const output = execFileSync('git', ['log', '--diff-filter=A', '--follow', '--format=%aI', '--', relative], {
      cwd: repoRoot,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    const firstLine = output.split(/\r?\n/).find(Boolean);
    return parseDateCandidate(firstLine);
  } catch {
    return undefined;
  }
}

async function getFallbackFileDate(filePath) {
  const stat = await fs.stat(filePath);
  return parseDateCandidate(stat.birthtime) ?? parseDateCandidate(stat.mtime) ?? new Date();
}

function normalizeTags(raw) {
  if (Array.isArray(raw)) {
    return [...new Set(raw.map((tag) => String(tag).trim()).filter(Boolean))];
  }

  if (typeof raw === 'string') {
    return [...new Set(raw.split(',').map((tag) => tag.trim()).filter(Boolean))];
  }

  return [];
}

function stripMarkdown(value) {
  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^\)]+\)/g, ' ')
    .replace(/\[[^\]]*\]\(([^\)]+)\)/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildDescription(frontmatter, content) {
  const explicit = [frontmatter.description, frontmatter.subtitle].find((value) => typeof value === 'string' && value.trim());
  if (explicit) {
    return explicit.trim();
  }

  const text = stripMarkdown(content);
  return text ? text.slice(0, 120) : undefined;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

async function migrate() {
  await fs.mkdir(targetDir, { recursive: true });
  const entries = await fs.readdir(targetDir);
  await Promise.all(entries.filter((entry) => entry.endsWith('.md') || entry.endsWith('.markdown')).map((entry) => fs.rm(path.join(targetDir, entry))));

  const files = (await fs.readdir(sourceDir)).filter((file) => /\.md|\.markdown$/i.test(file));

  for (const fileName of files) {
    const sourcePath = path.join(sourceDir, fileName);
    const raw = await fs.readFile(sourcePath, 'utf-8');
    const parsed = matter(raw);

    const created =
      parseDateCandidate(parsed.data.created) ??
      parseDateCandidate(parsed.data.date) ??
      getFilenameDate(fileName) ??
      getGitCreatedDate(sourcePath) ??
      (await getFallbackFileDate(sourcePath));

    const slug = slugify(parsed.data.slug || parsed.data.title || fileName);
    const tags = normalizeTags(parsed.data.tags);
    const updated = parseDateCandidate(parsed.data.updated);
    const permalink = typeof parsed.data.permalink === 'string' && parsed.data.permalink.trim()
      ? parsed.data.permalink.trim()
      : `/${created.getUTCFullYear()}/${String(created.getUTCMonth() + 1).padStart(2, '0')}/${String(created.getUTCDate()).padStart(2, '0')}/${slug}/`;

    const cleanedContent = rewriteAssetPaths(parsed.content);
    const description = buildDescription(parsed.data, cleanedContent);

    const nextFrontmatter = {
      title: String(parsed.data.title || slug),
      created: formatDate(created),
      tags,
      slug,
      permalink,
      ...(description ? { description } : {}),
      ...(updated ? { updated: formatDate(updated) } : {}),
    };

    const output = matter.stringify(cleanedContent, nextFrontmatter, { lineWidth: 0 });
    await fs.writeFile(path.join(targetDir, fileName), output, 'utf-8');
  }
}

migrate().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
