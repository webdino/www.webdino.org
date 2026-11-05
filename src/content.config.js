import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// All collections are localized: entries are stored in a subfolder for each locale, e.g.
// `src/content/news/ja/202610140720.md`, so entry IDs are prefixed with the locale code.

const heading = z.object({ heading: z.string(), subheading: z.string().optional() });
const section = heading.extend({ subheading: z.string() });

/**
 * Fields common to all the fixed pages.
 */
const page = z.object({
  title: z.string(),
  linkTitle: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  contactDesc: z.string().optional(),
  contactLink: z.string().optional(),
  contactLabel: z.string().optional(),
  linkLabel: z.string().optional(),
});

/**
 * Define a fixed page as a collection, so that each page has its own schema. The name matches the
 * file name in `src/content/pages/{locale}/`.
 * @template {import('astro/zod').ZodRawShape} T
 * @param {string} name Page name.
 * @param {T} fields Fields specific to the page.
 */
const definePage = (name, fields) =>
  defineCollection({
    loader: glob({ pattern: `*/${name}.md`, base: './src/content/pages' }),
    schema: page.extend(fields),
  });

const serviceCases = z.object({
  heading: z.string(),
  details: z.array(
    z.object({ heading: z.string(), description: z.string(), image: z.string().optional() }),
  ),
});

const iconList = section.extend({
  items: z.array(z.object({ icon: z.string(), description: z.string() })),
});

const people = z.object({
  heading: z.string(),
  people: z.array(z.object({ name: z.string(), title: z.string(), image: z.string().optional() })),
});

const message = section.extend({ description: z.string() });

const pages = {
  homePage: definePage('home', { headline: z.string() }),
  aboutPage: definePage('about', {
    concepts: z.array(section.extend({ description: z.string() })),
    overview: section.extend({
      items: z.array(z.object({ label: z.string(), value: z.string() })),
    }),
    linkLabel: z.string(),
  }),
  leadershipPage: definePage('leadership', {
    message: z.object({ heading: z.string(), text: z.string() }),
    leadership: z.object({
      heading: z.string(),
      roles: z.array(
        section.extend({
          members: z.array(
            z.object({
              name: z.string(),
              titles: z.array(z.string()).optional(),
              image: z.string(),
            }),
          ),
        }),
      ),
    }),
  }),
  historyPage: definePage('history', {
    history: z.object({
      heading: z.string(),
      events: z.array(z.object({ time: z.string(), text: z.string() })),
    }),
    activities: z.object({
      heading: z.string(),
      timeline: z.array(
        z.object({
          time: z.string(),
          title: z.string(),
          description: z.string(),
          image: z.string().optional(),
          id: z.string(),
        }),
      ),
    }),
  }),
  locationPage: definePage('location', { nearby: z.string() }),
  servicesPage: definePage('services', {}),
  techPage: definePage('tech', {
    linkLabel: z.string(),
    image: z.string(),
    fields: section.extend({
      details: z.array(
        section.extend({
          summary: z.string(),
          description: z.string(),
          title: z.string().optional(),
        }),
      ),
    }),
    solutions: section.extend({
      description: z.string().optional(),
      linkLabel: z.string().optional(),
      examples: z.array(z.object({ label: z.string(), icon: z.string() })),
      cases: serviceCases,
    }),
  }),
  humanPage: definePage('human', {
    linkLabel: z.string(),
    image: z.string(),
    solutions: section.extend({
      examples: z.array(
        z.object({ heading: z.string(), description: z.string(), image: z.string() }),
      ),
      cases: serviceCases,
    }),
    concepts: z.array(section.extend({ description: z.string(), id: z.string() })),
  }),
  fullstackPage: definePage('fullstack', {
    heroImage: z.string(),
    features: iconList,
    outcomes: iconList,
    support: iconList,
    curriculum: section.extend({
      description: z.string(),
      items: z.array(z.object({ day: z.string(), title: z.string(), description: z.string() })),
    }),
    instructors: section.extend({
      description: z.string(),
      internal: people.optional(),
      external: people.optional(),
      guests: people.optional(),
    }),
  }),
  communityPage: definePage('community', {
    feature_images: z.array(z.object({ src: z.string() })),
    concept: section.extend({ description: z.string(), src: z.string().optional() }),
    friends: section.extend({
      description: z.string(),
      groups: z.array(
        z.object({ name: z.string(), url: z.string().optional(), description: z.string() }),
      ),
    }),
  }),
  updatesPage: definePage('updates', {}),
  newsPage: definePage('news', {}),
  careersPage: definePage('careers', {
    positionsAvailable: z.string(),
    positionsUnavailable: z.string(),
    images: z.array(z.object({ src: z.string(), caption: z.string() })).default([]),
    labels: z.record(z.string(), z.string()),
    positions: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          responsibilities: z.string(),
          totalJobOpenings: z.string(),
          workHours: z.string(),
          holidays: z.string(),
          salary: z.string(),
          experienceRequirements: z.string(),
          skills: z.string(),
          jobBenefits: z.string(),
          otherConditions: z.string(),
          jobLocation: z.string(),
          apply: z.string(),
        }),
      )
      .default([]),
  }),
  contactPage: definePage('contact', {
    fields: z.array(
      z.object({
        name: z.string(),
        label: z.string(),
        placeholder: z.string(),
        type: z.enum(['text', 'email', 'tel', 'url', 'multiline']),
        required: z.boolean(),
      }),
    ),
    submit: z.object({ privacy: z.string(), buttonLabel: z.string() }),
    thanks: message,
    error: message,
  }),
  privacyPage: definePage('privacy', {
    date: z.coerce.date(),
    lastModified: z.coerce.date().optional(),
    publisher: z.object({
      name: z.string(),
      person: z.object({ role: z.string(), name: z.string() }),
      contact: z.object({ title: z.string(), email: z.string() }),
    }),
  }),
  errorPage: definePage('error', {}),
};

const news = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    date: z.coerce.date(),
    tags: z
      .array(z.string())
      .nullish()
      .transform((value) => value ?? []),
    authors: z
      .array(z.string())
      .nullish()
      .transform((value) => value ?? []),
    image: z.string().optional(),
    summary: z.string().optional(),
  }),
});

const authors = defineCollection({
  loader: glob({ pattern: '*/*.yaml', base: './src/content/authors' }),
  schema: z.object({
    title: z.string(),
    name: z.string(),
    jobTitle: z.string().nullish(),
    twitter: z.string().nullish(),
    facebook: z.string().nullish(),
    github: z.string().nullish(),
    image: z.string().nullish(),
    description: z.string().nullish(),
  }),
});

const tags = defineCollection({
  loader: glob({ pattern: '*/*.yaml', base: './src/content/tags' }),
  schema: z.object({
    title: z.string(),
    name: z.string(),
    description: z.string().nullish(),
  }),
});

/**
 * Content shared across multiple pages.
 */
const settings = defineCollection({
  loader: glob({ pattern: '*/partials.yaml', base: './src/content/settings' }),
  schema: z.object({
    publisher: z.object({
      name: z.string(),
      address: z.string(),
      map: z.object({ place_id: z.string(), api_key: z.string() }),
    }),
    contact: z.object({ heading: z.string(), description: z.string(), linkLabel: z.string() }),
    social: z.array(
      z.object({ name: z.string(), identifier: z.string(), account: z.string(), url: z.string() }),
    ),
    updates: z.object({
      news: heading.extend({ linkLabel: z.string(), backlinkLabel: z.string() }),
      tags: heading,
      share: heading.extend({
        media: z.array(z.object({ name: z.string(), identifier: z.string(), url: z.string() })),
      }),
      nav: z.object({ prev: z.string(), next: z.string() }),
      all: heading.extend({ linkLabel: z.string() }),
    }),
    promo: heading.extend({
      links: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
          url: z.string(),
          image: z.string(),
        }),
      ),
    }),
  }),
});

export const collections = { ...pages, news, authors, tags, settings };
