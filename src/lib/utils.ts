import config from '../config/config.json';
import { getBlogPosts, getMenuItems } from './strapi';

/**
 * Normalises a path so `/about-us`, `/about-us/` and the built `/about-us.html`
 * (build.format "file") compare equal. `/index.html` becomes `/`.
 */
export function normalizePath(path: string): string {
  let p = path.replace(/\.html$/, '').replace(/\/index$/, '/');
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p || '/';
}

/** Attributes the theme puts on a link that points to the current page (styled by .w--current). */
export function currentAttrs(url: string, pathname: string) {
  const isCurrent = normalizePath(url) === normalizePath(pathname);
  return {
    isCurrent,
    ariaCurrent: isCurrent ? ('page' as const) : undefined,
    currentClass: isCurrent ? ' w--current' : '',
  };
}

export const menuItemUrl = (slug: string) => `${config.menu.basePath}/${slug}`;
export const postUrl = (slug: string) => `${config.blog.basePath}/${slug}`;

/** "Oct 21, 2024", the date format used across the theme. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** "DISH 3" */
export const dishLabel = (n: number) => `DISH ${n}`;

/**
 * Resolves the placeholders used in menu.json:
 *   @latest-blog-post  newest blog post (falls back to /blog)
 *   @first-menu-item   first dish (falls back to /menu)
 */
export async function resolveUrl(url: string): Promise<string> {
  if (url === '@latest-blog-post') {
    const [post] = await getBlogPosts();
    return post ? postUrl(post.slug) : '/blog';
  }
  if (url === '@first-menu-item') {
    const [item] = await getMenuItems();
    return item ? menuItemUrl(item.slug) : '/menu';
  }
  return url;
}

/** Splits a list in two columns, the first one taking the extra item. */
export function splitColumns<T>(items: T[]): [T[], T[]] {
  const half = Math.ceil(items.length / 2);
  return [items.slice(0, half), items.slice(half)];
}

type FormName = keyof typeof config.forms;

/**
 * Attributes for a theme form. With an `action` set in config.json the form
 * posts there directly. Without one it runs in demo mode: submitting shows the
 * template's success message and nothing is sent anywhere (see BaseLayout).
 */
export function formAttrs(name: FormName) {
  const { action, method } = config.forms[name];
  return action
    ? { action, method }
    : { method: 'get', 'data-form-demo': '' };
}
