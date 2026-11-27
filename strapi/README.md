# Rostivo: Strapi CMS

Strapi 5 backend for the Rostivo Astro theme. It holds the restaurant menu (dishes and their categories) and the blog.

## Content model

### Menu Item

`api::menu-item.menu-item`, REST: `/api/menu-items`, Draft & Publish on.

| Field              | Type                          | Used for                                                  |
| :----------------- | :---------------------------- | :-------------------------------------------------------- |
| `title`            | Text (required)               | Card title, dish page `<h1>`, page title                  |
| `slug`             | UID from title                | URL: `/menu/<slug>`                                       |
| `dishNumber`       | Integer (required)            | "DISH 3" badge, and the order of every menu list          |
| `shortDescription` | Long text (required)          | Card description                                          |
| `description`      | Long text                     | Dish page description and meta description               |
| `image`            | Media, image (required)       | Card image, dish page image, Open Graph image             |
| `category`         | Relation, many-to-one         | The menu tab the dish appears in                          |
| `ingredients`      | Component `menu.ingredient`, repeatable (`name`) | Ingredients list on the dish page (two columns) |

### Menu Category

`api::menu-category.menu-category`, REST: `/api/menu-categories`.

| Field       | Type                      | Used for                         |
| :---------- | :------------------------ | :------------------------------- |
| `name`      | Text (required, unique)   | Tab label                        |
| `slug`      | UID from name             | Identifier                       |
| `order`     | Integer                   | Tab order (ascending)            |
| `menuItems` | Relation, one-to-many     | The dishes in the category       |

### Blog Post

`api::blog-post.blog-post`, REST: `/api/blog-posts`, Draft & Publish on.

| Field             | Type                      | Used for                                                      |
| :---------------- | :------------------------ | :------------------------------------------------------------ |
| `title`           | Text (required)           | Card title, post `<h1>`, page title                           |
| `slug`            | UID from title            | URL: `/blog-post/<slug>`                                      |
| `date`            | Date & time (required)    | "Published on" date and the order of every blog list (newest first) |
| `category`        | Text                      | Category label                                                |
| `author`          | Text                      | "Written by"                                                  |
| `readTime`        | Text                      | "Read time", e.g. `8 min`                                     |
| `coverImage`      | Media, image (required)   | Card image, Open Graph image                                  |
| `heroImage`       | Media, image              | Post page hero image. Empty: the theme's default image        |
| `content`         | Rich text (Blocks)        | Post body                                                     |
| `metaDescription` | Long text                 | Meta and Open Graph description                               |

On start, `src/index.ts` gives the Public role read access (`find`, `findOne`) to the three collections so the Astro site can build without a token. Remove that if you prefer a read-only API token (then set `STRAPI_API_TOKEN` in the Astro project).

## Getting started

```sh
npm install
cp .env.example .env              # then replace every secret with your own values
npm run develop                   # http://localhost:1337/admin
```

Create the first admin account in the browser, or run:

```sh
npx strapi admin:create-user --firstname=Admin --lastname=User --email=you@example.com --password='<strong password>'
```

### Demo content

`seed/rostivo-seed.tar.gz` holds the theme's demo content: 9 dishes, 6 menu categories and 9 blog posts, with their images. Import it into a fresh project:

```sh
npx strapi import -f seed/rostivo-seed.tar.gz --force
```

Import replaces existing content, so run it only on an empty project.

## Strapi MCP server

The MCP server is turned on in `config/server.ts` (`mcp.enabled`; set `MCP_ENABLED=false` in `.env` to turn it off). It needs Strapi 5.47 or later (the media tools need 5.54) and listens at `POST /mcp` over Streamable HTTP. Reference: https://docs.strapi.io/cms/features/strapi-mcp-server

1. In the admin panel, go to **Settings > Administration Panel > Admin Tokens** and create a token. Give it the Content Manager actions on Menu Item, Menu Category and Blog Post, plus the Media Library permissions if you want the media tools. The token is shown only once.
2. Connect your MCP client with the Streamable HTTP transport, for example:

   ```json
   {
     "mcpServers": {
       "strapi-mcp": {
         "type": "streamable-http",
         "url": "http://localhost:1337/mcp",
         "headers": { "Authorization": "Bearer YOUR_ADMIN_TOKEN" }
       }
     }
   }
   ```

   Keep the token out of committed files.

The token decides which tools appear. For this project they are, per collection, `list_<type>`, `get_<type>`, `create_<type>`, `update_<type>` and `delete_<type>` (types `menu-item`, `menu-category`, `blog-post`), plus `publish_`, `unpublish_` and `discard_<type>_draft` for Menu Item and Blog Post (the Draft & Publish types), and the `media_*` tools. The demo content was loaded through these tools.

The MCP server cannot upload files: upload images in the Media Library (or through the upload API), then pass the asset id as `image`, `coverImage` or `heroImage`. Relations take the related entry's `documentId`, e.g. `"category": "<menu category documentId>"`.

## Deploying

Run `npm run build`, then `npm run start` with production environment variables. Set `PUBLIC_URL` to the server's public URL. SQLite is the default database. For production, switch `DATABASE_CLIENT` to `postgres` or `mysql` in `.env`.
