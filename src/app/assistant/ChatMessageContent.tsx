import React from 'react';
import Link from 'next/link';

export interface ProductItem {
  name: string;
  category?: string;
  description?: string;
  slug?: string;
  min_sum_assured?: number;
  max_sum_assured?: number;
  min_payment_term?: number;
  max_payment_term?: number;
}

export interface ChatMessageContentProps {
  content: string;
  className?: string;
  isUser?: boolean;
}

/**
 * Parses inline markdown: **bold**, *italic*, `code`, and [label](url)
 */
export function formatInlineMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match: [link](url) | **bold** | __bold__ | *italic* | _italic_ | `code`
  const tokenRegex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|__[^_]+__|(?<!\*)\*[^*]+\*(?!\*)|(?<!_)_[^_]+_(?!_)|`[^`]+`)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Link: [label](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, url] = linkMatch;
      const isInternal = url.startsWith('/');
      if (isInternal) {
        return (
          <Link
            key={index}
            href={url}
            className="inline-flex items-center gap-0.5 text-blue-600 font-semibold underline underline-offset-2 hover:text-blue-800 transition-colors"
          >
            {label}
          </Link>
        );
      }
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-blue-600 font-semibold underline underline-offset-2 hover:text-blue-800 transition-colors"
        >
          {label} ↗
        </a>
      );
    }

    // Bold: **text** or __text__
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      const inner = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-slate-900">
          {formatInlineMarkdown(inner)}
        </strong>
      );
    }

    // Italic: *text* or _text_
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      const inner = part.slice(1, -1);
      return (
        <em key={index} className="italic text-slate-800">
          {formatInlineMarkdown(inner)}
        </em>
      );
    }

    // Inline code: `code`
    if (part.startsWith('`') && part.endsWith('`')) {
      const code = part.slice(1, -1);
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 mx-0.5 text-[11px] font-mono font-medium rounded bg-slate-100 text-blue-700 border border-slate-200"
        >
          {code}
        </code>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

function renderProductCards(products: ProductItem[]) {
  return (
    <div className="my-3 space-y-2.5">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
        <span>Rekomendasi Produk Terverifikasi OJK:</span>
      </div>
      <div className="grid grid-cols-1 gap-2.5">
        {products.map((p, idx) => {
          const categoryName = p.category?.toUpperCase() || 'ASURANSI';
          const isVehicle = p.category === 'vehicle' || p.category === 'kendaraan';
          const isHealth = p.category === 'health' || p.category === 'kesehatan';
          const categoryBadgeColor = isVehicle
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : isHealth
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-blue-50 text-blue-700 border-blue-200';

          const simUrl = p.slug ? `/simulation?product=${encodeURIComponent(p.slug)}` : '/simulation';

          return (
            <div
              key={idx}
              className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all text-left"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-blue-900">
                      {idx + 1}. {p.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border tracking-wider ${categoryBadgeColor}`}
                    >
                      {categoryName}
                    </span>
                  </div>
                  {p.description && (
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{p.description}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-medium">
                  {p.min_sum_assured !== undefined && p.max_sum_assured !== undefined && (
                    <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                      UP: Rp {Number(p.min_sum_assured).toLocaleString('id-ID')} - Rp{' '}
                      {Number(p.max_sum_assured).toLocaleString('id-ID')}
                    </span>
                  )}
                  {p.min_payment_term && p.max_payment_term && (
                    <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                      Tenor: {p.min_payment_term}-{p.max_payment_term} Thn
                    </span>
                  )}
                </div>

                <Link
                  href={simUrl}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors border border-blue-200"
                >
                  Simulasi Premi →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function parseTable(lines: string[]): { headers: string[]; rows: string[][] } | null {
  if (lines.length < 2) return null;
  const parseRow = (line: string) =>
    line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((c) => c.trim());

  const headers = parseRow(lines[0]);
  const separator = parseRow(lines[1]);
  const isSeparator = separator.every((c) => /^:?-+:?$/.test(c));
  if (!isSeparator || headers.length === 0) return null;

  const rows: string[][] = [];
  for (let i = 2; i < lines.length; i++) {
    const row = parseRow(lines[i]);
    if (row.length === headers.length || row.length > 1) {
      rows.push(row);
    }
  }

  return { headers, rows };
}

export const ChatMessageContent: React.FC<ChatMessageContentProps> = ({ content, className = '', isUser = false }) => {
  if (!content) return null;

  if (isUser) {
    return (
      <div className={`space-y-1 text-left leading-relaxed text-white ${className}`}>
        <p className="text-white text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap break-words font-medium">
          {content}
        </p>
      </div>
    );
  }

  // 1. Check if there is an embedded JSON array of products (either full text or inside markdown block)
  const jsonMatch = content.match(/\[\s*\{[\s\S]*?"name"[\s\S]*?\}\s*\]/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name) {
        const preJson = content.slice(0, jsonMatch.index).trim();
        const postJson = content.slice((jsonMatch.index || 0) + jsonMatch[0].length).trim();
        return (
          <div className={`space-y-2 text-left leading-relaxed ${className}`}>
            {preJson && <ChatMessageContent content={preJson} />}
            {renderProductCards(parsed)}
            {postJson && <ChatMessageContent content={postJson} />}
          </div>
        );
      }
    } catch {
      // ignore json parse error and fallback to standard markdown rendering
    }
  }

  // 2. Parse into Markdown Blocks
  const rawLines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let lineIdx = 0;

  while (lineIdx < rawLines.length) {
    const line = rawLines[lineIdx];
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      lineIdx++;
      continue;
    }

    // Horizontal Rule
    if (/^(---|___|\*\*\*)$/.test(trimmed)) {
      elements.push(<hr key={`hr-${lineIdx}`} className="border-t border-slate-200 my-3" />);
      lineIdx++;
      continue;
    }

    // Headings: #, ##, ###, ####
    if (trimmed.startsWith('#')) {
      const levelMatch = trimmed.match(/^(#{1,4})\s+(.*)$/);
      if (levelMatch) {
        const level = levelMatch[1].length;
        const headingText = levelMatch[2];
        if (level === 1) {
          elements.push(
            <h3 key={`h1-${lineIdx}`} className="font-extrabold text-slate-900 text-sm sm:text-base mt-3 mb-1.5">
              {formatInlineMarkdown(headingText)}
            </h3>
          );
        } else if (level === 2) {
          elements.push(
            <h4 key={`h2-${lineIdx}`} className="font-bold text-slate-900 text-xs sm:text-sm mt-2.5 mb-1 text-blue-950">
              {formatInlineMarkdown(headingText)}
            </h4>
          );
        } else {
          elements.push(
            <h5 key={`h3-${lineIdx}`} className="font-semibold text-slate-800 text-xs sm:text-[13px] mt-2 mb-1">
              {formatInlineMarkdown(headingText)}
            </h5>
          );
        }
        lineIdx++;
        continue;
      }
    }

    // Blockquote: > text
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (lineIdx < rawLines.length && rawLines[lineIdx].trim().startsWith('>')) {
        quoteLines.push(rawLines[lineIdx].trim().replace(/^>\s*/, ''));
        lineIdx++;
      }
      elements.push(
        <div
          key={`quote-${lineIdx}`}
          className="my-2 pl-3.5 pr-3 py-2 rounded-r-lg border-l-4 border-blue-500 bg-blue-50/70 text-slate-700 text-xs sm:text-[13px] italic leading-relaxed space-y-1"
        >
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx}>{formatInlineMarkdown(ql)}</p>
          ))}
        </div>
      );
      continue;
    }

    // Table: starts with | and next line has | --- |
    if (trimmed.startsWith('|') && lineIdx + 1 < rawLines.length && rawLines[lineIdx + 1].trim().startsWith('|')) {
      const tableLines: string[] = [];
      while (lineIdx < rawLines.length && rawLines[lineIdx].trim().startsWith('|')) {
        tableLines.push(rawLines[lineIdx]);
        lineIdx++;
      }
      const tableData = parseTable(tableLines);
      if (tableData) {
        elements.push(
          <div
            key={`table-${lineIdx}`}
            className="my-2.5 overflow-x-auto rounded-lg border border-slate-200 shadow-2xs"
          >
            <table className="min-w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/90 border-b border-slate-200">
                  {tableData.headers.map((h, hIdx) => (
                    <th key={hIdx} className="px-3 py-2 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                      {formatInlineMarkdown(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tableData.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/60 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-2 text-slate-700 leading-normal">
                        {formatInlineMarkdown(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // Numbered List: 1. text
    const numberMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numberMatch) {
      const listItems: { num: string; text: string }[] = [];
      while (lineIdx < rawLines.length) {
        const itemTrim = rawLines[lineIdx].trim();
        const m = itemTrim.match(/^(\d+)\.\s+(.*)$/);
        if (!m) break;
        listItems.push({ num: m[1], text: m[2] });
        lineIdx++;
      }
      elements.push(
        <div key={`ol-${lineIdx}`} className="space-y-1.5 my-1.5 pl-0.5">
          {listItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs sm:text-[13px]">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold shrink-0 mt-0.5">
                {item.num}
              </span>
              <span className="flex-1 leading-relaxed">{formatInlineMarkdown(item.text)}</span>
            </div>
          ))}
        </div>
      );
      continue;
    }

    // Bullet List: - text or * text or • text
    if (/^[-*•]\s+/.test(trimmed)) {
      const bulletItems: string[] = [];
      while (lineIdx < rawLines.length && /^[-*•]\s+/.test(rawLines[lineIdx].trim())) {
        bulletItems.push(rawLines[lineIdx].trim().replace(/^[-*•]\s+/, ''));
        lineIdx++;
      }
      elements.push(
        <div key={`ul-${lineIdx}`} className="space-y-1.5 my-1.5 pl-0.5">
          {bulletItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs sm:text-[13px]">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0"></span>
              <span className="flex-1 leading-relaxed">{formatInlineMarkdown(item)}</span>
            </div>
          ))}
        </div>
      );
      continue;
    }

    // Code Block: ```lang ... ```
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      lineIdx++;
      while (lineIdx < rawLines.length && !rawLines[lineIdx].trim().startsWith('```')) {
        codeLines.push(rawLines[lineIdx]);
        lineIdx++;
      }
      if (lineIdx < rawLines.length) lineIdx++; // skip closing ```
      elements.push(
        <div key={`codeblock-${lineIdx}`} className="my-2 rounded-lg bg-slate-900 text-slate-100 p-3 text-[11px] font-mono overflow-x-auto border border-slate-800">
          {lang && <div className="text-[10px] text-slate-400 font-bold uppercase mb-1.5">{lang}</div>}
          <pre className="leading-relaxed whitespace-pre-wrap">{codeLines.join('\n')}</pre>
        </div>
      );
      continue;
    }

    // Regular Paragraph
    elements.push(
      <p key={`p-${lineIdx}`} className="text-xs sm:text-[13px] leading-relaxed text-slate-800">
        {formatInlineMarkdown(line)}
      </p>
    );
    lineIdx++;
  }

  return <div className={`space-y-2 text-left leading-relaxed ${className}`}>{elements}</div>;
};
