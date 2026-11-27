/**
 * Structured data (JSON-LD) for the pages that had it in the template.
 * URLs are made absolute against the site URL (SITE_URL).
 */
import config from '../config/config.json';
import type { MenuItem } from './strapi';
import { mediaUrl } from './strapi';

const abs = (path: string, site: URL | undefined) => (site ? new URL(path, site).href : path);
const image = (url: string) => ({ '@type': 'ImageObject', url });

const { site, restaurant } = config;

export function homeSchema(siteUrl: URL | undefined, dishes: MenuItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: site.title,
    description: site.description,
    url: abs('/', siteUrl),
    inLanguage: site.lang,
    about: {
      '@type': 'Restaurant',
      name: restaurant.name,
      description: restaurant.description,
      image: [1, 4, 3, 2].map((n) => image(abs(`/images/Home-V2-Hero-Image-${n}.png`, siteUrl))),
      logo: image(abs(restaurant.logo, siteUrl)),
      servesCuisine: restaurant.servesCuisine,
      hasMenu: {
        '@type': 'Menu',
        hasMenuSection: {
          '@type': 'MenuSection',
          name: config.menu.allTabLabel,
          hasMenuItem: dishes.map((dish) => ({
            '@type': 'MenuItem',
            name: dish.title,
            description: dish.shortDescription,
            ...(dish.image ? { image: image(mediaUrl(dish.image.url)) } : {}),
          })),
        },
      },
      employee: [
        { name: 'John Doe', jobTitle: 'Master chef', img: 'Chef-Image-1.png' },
        { name: 'Charles Thomas', jobTitle: 'Fish Chef', img: 'Chef-Image-6.png' },
        { name: 'James Oliver', jobTitle: 'Commis Chef', img: 'Chef-Image-3.png' },
      ].map((p) => ({ '@type': 'Person', name: p.name, jobTitle: p.jobTitle, image: image(abs(`/images/${p.img}`, siteUrl)) })),
      review: [
        {
          '@type': 'Review',
          author: { '@type': 'Person', name: 'Theresa Webb', jobTitle: 'Businessman', image: image(abs('/images/client_image.svg', siteUrl)) },
          reviewBody:
            "The attention to detail is remarkable. Every dish feels like a work of art. Chef John's creations are nothing short of culinary masterpieces!",
        },
      ],
    },
  };
}

export function aboutSchema(siteUrl: URL | undefined) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Us',
    url: abs('/about-us', siteUrl),
    inLanguage: site.lang,
    about: {
      '@type': 'Restaurant',
      name: restaurant.name,
      description: restaurant.description,
      logo: image(abs(restaurant.logo, siteUrl)),
      servesCuisine: restaurant.servesCuisine,
    },
  };
}

export function bookTableSchema(siteUrl: URL | undefined) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Book a Table',
    description:
      'Reserve your table at Rystro and enjoy an unforgettable dining experience. Make reservations for romantic dinners, family gatherings, or business lunches.',
    url: abs('/book-a-table', siteUrl),
    inLanguage: site.lang,
    about: {
      '@type': 'Restaurant',
      name: restaurant.name,
      description: 'Experience the best of Rystro with reservations for romantic dinners, family gatherings, or business lunches.',
      image: image(abs(restaurant.logo, siteUrl)),
    },
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: abs('/book-a-table', siteUrl),
        actionPlatform: ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform'],
      },
      result: { '@type': 'Reservation', name: `Table Reservation at ${restaurant.name}` },
    },
  };
}
