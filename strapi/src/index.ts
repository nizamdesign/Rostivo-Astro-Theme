import type { Core } from '@strapi/strapi';

/** Read-only actions the Astro site needs without a token. */
const PUBLIC_ACTIONS = [
  'api::menu-item.menu-item.find',
  'api::menu-item.menu-item.findOne',
  'api::menu-category.menu-category.find',
  'api::menu-category.menu-category.findOne',
  'api::blog-post.blog-post.find',
  'api::blog-post.blog-post.findOne',
];

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * Gives the Public role read access to published menu items, menu
   * categories and blog posts, so the Astro site can build without an API
   * token. Remove this and set STRAPI_API_TOKEN in the Astro project if the
   * content should stay private.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const publicRole = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });
    if (!publicRole) return;

    for (const action of PUBLIC_ACTIONS) {
      const existing = await strapi.db
        .query('plugin::users-permissions.permission')
        .findOne({ where: { action, role: publicRole.id } });
      if (!existing) {
        await strapi.db
          .query('plugin::users-permissions.permission')
          .create({ data: { action, role: publicRole.id } });
      }
    }
  },
};
