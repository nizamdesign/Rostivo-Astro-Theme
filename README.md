# Rostivo: Astro theme

A restaurant, café and bistro theme for Astro. The menu and the blog are managed in Strapi.

## Requirements

- Node.js 22.12 or later
- Optional: a Strapi 5 server with the Rostivo content. The `strapi/` folder holds the ready-made Strapi project (see `strapi/README.md`).

## Getting started

```sh
npm install
cp .env.example .env
npm run dev               # http://localhost:4321
```

With `STRAPI_URL` unset, the site builds from the bundled demo content (`src/data/demo-content.json`, images in `public/cms/`), so it runs and deploys without a CMS. Set `STRAPI_URL` to load the menu and blog from your Strapi server instead.

| Command           | What it does                                        |
| :---------------- | :-------------------------------------------------- |
| `npm run dev`     | Starts the dev server. CMS data is fetched live.    |
| `npm run build`   | Type-checks, then builds the static site to `dist/` |
| `npm run preview` | Serves the built site locally                       |
| `npm run check`   | Runs `astro check`                                  |

## Environment variables

| Variable           | Required   | Purpose                                                                   |
| :----------------- | :--------- | :------------------------------------------------------------------------ |
| `STRAPI_URL`       | no         | Base URL of the Strapi server, e.g. `https://cms.example.com`. Unset: demo content |
| `STRAPI_API_TOKEN` | no         | Read-only API token. Leave empty if the Public role can read the content. |
| `SITE_URL`         | yes (prod) | Public URL of the site, used for canonical, Open Graph and sitemap URLs   |

## Pages

| Route                                  | File                                                           |
| :------------------------------------- | :------------------------------------------------------------- |
| `/`                                    | `src/pages/index.astro`                                        |
| `/about-us`                            | `src/pages/about-us.astro`                                     |
| `/menu`                                | `src/pages/menu.astro`                                         |
| `/menu/[slug]`                         | `src/pages/menu/[slug].astro` (one page per published dish)    |
| `/chef`                                | `src/pages/chef.astro`                                         |
| `/blog`                                | `src/pages/blog.astro`                                         |
| `/blog-post/[slug]`                    | `src/pages/blog-post/[slug].astro` (one page per post)         |
| `/book-a-table`                        | `src/pages/book-a-table.astro`                                 |
| `/user-authentication/sign-in`         | `src/pages/user-authentication/sign-in.astro`                  |
| `/user-authentication/sign-up`         | `src/pages/user-authentication/sign-up.astro`                  |
| `/user-authentication/forgot-password` | `src/pages/user-authentication/forgot-password.astro`          |
| `/utility-pages/style-guide`           | `src/pages/utility-pages/style-guide.astro`                    |
| `/utility-pages/license`               | `src/pages/utility-pages/license.astro`                        |
| `/utility-pages/changelog`             | `src/pages/utility-pages/changelog.astro`                      |
| `/utility-pages/privacy-policy`        | `src/pages/utility-pages/privacy-policy.astro`                 |
| `/utility-pages/cookies-settings`      | `src/pages/utility-pages/cookies-settings.astro`               |
| `/401`, `/404`                         | `src/pages/401.astro`, `src/pages/404.astro`                   |

## Project structure

```text
src/
├── components/
│   ├── Navbar.astro, Footer.astro, SeoMeta.astro
│   ├── blog/            BlogCard, BlogList, RichText (Strapi blocks renderer)
│   ├── menu/            MenuCard
│   └── sections/        One component per page section, grouped by page;
│                        shared/ holds sections used on several pages
├── config/
│   ├── config.json      Site title, SEO defaults, restaurant details, form endpoints, CMS settings
│   └── menu.json        Navbar, Pages dropdown and footer links
├── data/demo-content.json   Menu and blog content used when STRAPI_URL is unset
├── layouts/BaseLayout.astro
├── lib/
│   ├── strapi.ts        Strapi REST client and media helper
│   ├── schema.ts        Structured data (JSON-LD)
│   └── utils.ts         Links, dates, forms
├── pages/
└── styles/              The theme's original stylesheets
public/
├── cms/                 Images of the demo content
├── fonts/               Oswald
├── images/              Theme images
└── js/                  Interaction runtime and jQuery (served as-is)
strapi/                  Strapi 5 project with the content model and demo content
```

## Content from Strapi

The content model, permissions and demo content live in `strapi/`. Run it locally with `cd strapi && npm install && npm run develop`, then import the demo content (see `strapi/README.md`).

**Menu** (Menu Item and Menu Category collections):

- **Home and About**: the first dishes by dish number, in "Our Signature Creations" (`menu.previewCount` in `config.json`).
- **Menu page and each dish page**: the tabbed menu. The first tab ("Signature Creations", `menu.allTabLabel`) lists every dish. Each Menu Category adds a tab, ordered by its `order` field.
- **Dish page** `/menu/[slug]`: title, description, ingredients (split over two columns), image and dish number.

**Blog** (Blog Post collection):

- **Home and About**: the latest posts (`blog.previewCount`).
- **Blog page**: every published post, newest first (by the post's `date`).
- **Post page** `/blog-post/[slug]`: title, author, date, read time, category, rich text and the next posts under "More related blogs" (`blog.relatedCount`). The hero image comes from the post's optional `heroImage`, and otherwise the theme's default image.

The "Blog Details" and "Menu Details" links in `menu.json` (`@latest-blog-post`, `@first-menu-item`) and the Blog page's featured card follow the newest post and the first dish, so they never point to a deleted entry.

Pages are built statically, so publish changes by rebuilding. In production, add a Strapi webhook (Settings > Webhooks) on `entry.publish`, `entry.unpublish` and `entry.update` that calls your host's deploy hook. Images are loaded from the Strapi server, so it must be publicly reachable (or use an upload provider such as S3 or Cloudinary).

If `STRAPI_URL` is set but Strapi cannot be reached during a build, the lists show the theme's empty state ("No items found.") and no dish or post pages are generated. The build itself does not fail.

## Animations and interactions

Scroll, load and hover animations, the full-screen menu, the Pages dropdown and the menu tabs run on the theme's interaction runtime in `public/js/interactions.js` (with jQuery). It looks up each page's animations by the `pageId` passed to `BaseLayout`, so keep those values as they are. A new page that reuses existing sections can take the `pageId` of the page those sections came from. The `interactionId` values in `menu.json` keep each navigation link's hover animation.

## Forms

The newsletter, reservation, sign-in, sign-up, forgot-password and password forms read their endpoint from `forms` in `src/config/config.json`. Set `action` to your form service (Formspree, Basin, your own API) and the form posts there directly. While `action` is empty, the form runs in demo mode: submitting shows the theme's success message and nothing is sent anywhere.

## Customising

- Titles, SEO defaults and restaurant details: `src/config/config.json`
- Navigation and footer links: `src/config/menu.json`
- Section content: the matching file in `src/components/sections/`
- Styles: `src/styles/rostivo.css` (theme) and `src/styles/framework.css` (layout and component base)
