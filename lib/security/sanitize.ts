const DANGEROUS_TAGS = /<\s*\/?\s*(script|iframe|object|embed|style|link|meta|base|form)\b[^>]*>/gi;
const EVENT_ATTR = /\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_URL = /href\s*=\s*["']\s*javascript:[^"']*["']/gi;
const DATA_URL_HTML = /href\s*=\s*["']\s*data:text\/html[^"']*["']/gi;

export function sanitizeHtml(input: string): string {
  if (!input) return "";
  let out = input;
  out = out.replace(DANGEROUS_TAGS, "");
  out = out.replace(EVENT_ATTR, "");
  out = out.replace(JS_URL, 'href="#"');
  out = out.replace(DATA_URL_HTML, 'href="#"');
  return out;
}

export function sanitizeTitle(input: string): string {
  return input.trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}
