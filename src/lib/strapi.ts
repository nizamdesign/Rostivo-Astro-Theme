/**
 * Minimal Strapi 5 REST client for the Menu Item, Menu Category and Blog Post
 * collections.
 *
 * Configure with environment variables (see .env.example):
 *   STRAPI_URL        Base URL of the Strapi server, e.g. http://localhost:1337.
 *                     Leave unset to build from the bundled demo content
 *                     (src/data/demo-content.json, images in public/cms).
 *   STRAPI_API_TOKEN  Optional read-only API token. Leave empty when the
 *                     Public role can read the content.
 *
 * Pages are rendered at build time. If Strapi cannot be reached the lists
 * fall back to the template's empty state ("No items found.") instead of
 * failing the build.
 */

import demoContent from '../data/demo-content.json';

export interface StrapiImageFormat {
  url: string;
  width: number;
  height: number;
}

export interface StrapiImage {
  id: number;
  url: string;
  alternativeText: string | null;
  width: number | null;
  height: number | null;
  formats?: Record<string, StrapiImageFormat> | null;
}

export type BlocksContent = BlockNode[];

export interface BlockNode {
  type: string;
  children?: BlockNode[];
  text?: string;
  level?: number;
  format?: 'ordered' | 'unordered';
  url?: string;
  image?: StrapiImage;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  language?: string;
}

export interface MenuCategory {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  order: number | null;
}

export interface Ingredient {
  id: number;
  name: string;
}

export interface MenuItem {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  dishNumber: number;
  shortDescription: string;
  description: string | null;
  image: StrapiImage | null;
  category: MenuCategory | null;
  ingredients: Ingredient[];
}

export interface BlogPost {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  date: string;
  category: string | null;
  author: string | null;
  readTime: string | null;
  coverImage: StrapiImage | null;
  heroImage?: StrapiImage | null;
  content?: BlocksContent | null;
  metaDescription: string | null;
}

interface ListResponse<T> {
  data: T[];
  meta: { pagination: { page: number; pageCount: number } };
}

const STRAPI_URL = import.meta.env.STRAPI_URL?.replace(/\/$/, '') || '';

/** Bundled demo content, used when STRAPI_URL is not set. */
const DEMO: Record<string, unknown[]> = {
  'menu-items': demoContent.menuItems,
  'menu-categories': demoContent.menuCategories,
  'blog-posts': demoContent.blogPosts,
};
const STRAPI_API_TOKEN = import.meta.env.STRAPI_API_TOKEN;

let warned = false;
const cache = new Map<string, Promise<unknown>>();

async function request<T>(path: string, params: Record<string, string>): Promise<T | null> {
  const url = new URL(`/api/${path}`, STRAPI_URL);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (STRAPI_API_TOKEN) headers.Authorization = `Bearer ${STRAPI_API_TOKEN}`;

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return (await res.json()) as T;
  } catch (error) {
    if (!warned) {
      warned = true;
      console.warn(`[strapi] Could not load ${url.pathname} from ${STRAPI_URL}: ${(error as Error).message}`);
    }
    return null;
  }
}

/** Every page of a collection. Results are memoised for the length of a build. */
function fetchAll<T>(path: string, params: Record<string, string>): Promise<T[]> {
  if (!STRAPI_URL) return Promise.resolve(sortLike((DEMO[path] ?? []) as T[], params.sort));
  const key = `${path}?${new URLSearchParams(params)}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      (async () => {
        const items: T[] = [];
        for (let page = 1; ; page++) {
          const json = await request<ListResponse<T>>(path, {
            ...params,
            'pagination[page]': String(page),
            'pagination[pageSize]': '100',
          });
          if (!json) break;
          items.push(...json.data);
          if (page >= json.meta.pagination.pageCount) break;
        }
        return items;
      })(),
    );
  }
  return cache.get(key) as Promise<T[]>;
}

/** Applies a Strapi "field:asc|desc" sort to the demo content. */
function sortLike<T>(items: T[], sort: string | undefined): T[] {
  if (!sort) return items;
  const [field, dir] = sort.split(':');
  const sign = dir === 'desc' ? -1 : 1;
  return [...items].sort((a, b) => {
    const x = (a as Record<string, unknown>)[field] as string | number;
    const y = (b as Record<string, unknown>)[field] as string | number;
    return x === y ? 0 : x > y ? sign : -sign;
  });
}

const IMAGE_FIELDS = ['url', 'alternativeText', 'width', 'height', 'formats'];

function imageFields(field: string): Record<string, string> {
  return Object.fromEntries(IMAGE_FIELDS.map((f, i) => [`populate[${field}][fields][${i}]`, f]));
}

/* ---------------------------------------------------------------- Menu --- */

/** Published dishes, ordered by dish number, with image, category and ingredients. */
export function getMenuItems(): Promise<MenuItem[]> {
  return fetchAll<MenuItem>('menu-items', {
    sort: 'dishNumber:asc',
    ...imageFields('image'),
    'populate[category][fields][0]': 'name',
    'populate[category][fields][1]': 'slug',
    'populate[category][fields][2]': 'order',
    'populate[ingredients]': 'true',
  });
}

/** Menu categories in tab order. */
export function getMenuCategories(): Promise<MenuCategory[]> {
  return fetchAll<MenuCategory>('menu-categories', {
    sort: 'order:asc',
    'fields[0]': 'name',
    'fields[1]': 'slug',
    'fields[2]': 'order',
  });
}

/* ---------------------------------------------------------------- Blog --- */

const POST_FIELDS = ['title', 'slug', 'date', 'category', 'author', 'readTime', 'metaDescription'];

/** Published posts, newest first (without the rich text). */
export function getBlogPosts(): Promise<BlogPost[]> {
  return fetchAll<BlogPost>('blog-posts', {
    sort: 'date:desc',
    ...Object.fromEntries(POST_FIELDS.map((f, i) => [`fields[${i}]`, f])),
    ...imageFields('coverImage'),
  });
}

/** Published posts with rich text and hero image, for the post pages. */
export function getBlogPostsWithContent(): Promise<BlogPost[]> {
  return fetchAll<BlogPost>('blog-posts', {
    sort: 'date:desc',
    ...Object.fromEntries([...POST_FIELDS, 'content'].map((f, i) => [`fields[${i}]`, f])),
    ...imageFields('coverImage'),
    ...imageFields('heroImage'),
  });
}

/* --------------------------------------------------------------- Media --- */

/**
 * URL for a media path. Strapi returns local uploads as /uploads/..., which
 * are served by the Strapi server; demo images (/cms/...) are site files.
 */
export function mediaUrl(url: string): string {
  return /^https?:\/\//.test(url) || !STRAPI_URL ? url : `${STRAPI_URL}${url}`;
}
