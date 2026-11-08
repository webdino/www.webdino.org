/**
 * UI strings. Content managed in the CMS is not included here; add a locale to `astro.config.mjs`,
 * `public/admin/config.yml` and this file to support a new language.
 */
export const ui = /** @type {const} */ ({
  ja: {
    'site.title': 'WebDINO Japan',
    'site.copyright': 'WebDINO Japan',
    'site.og-locale': 'ja_JP',
    'nav.primary.label': '主要ページ',
    'nav.secondary.label': 'サブページ',
    'nav.social.label': 'ソーシャルメディア',
    'nav.breadcrumbs.label': 'パンくずリスト',
    'nav.section.label': '{title} の詳細リンク',
    'nav.menu.open': 'メニューを開く',
    'nav.menu.close': 'メニューを閉じる',
    'nav.feed': 'フィード',
    'footer.copyright': 'Copyright &copy; {year} {copyright}. All rights reserved.',
    'footer.privacy': 'プライバシーポリシー',
    'date.short': '{month} 月 {day} 日',
    'date.long': '{year} 年 {month} 月 {day} 日',
    'post.read-more': '続きを読む &raquo;',
    'post.press-release': '{title}【プレスリリース】',
    'post.truncated': '{text}...',
    'updates.tag.title': '{name} タグの付いた記事',
    'updates.author.title': '{name} が書いた記事',
    'author.job-title': 'タイトル',
    'author.description': '自己紹介',
    'author.twitter': 'X (旧 Twitter)',
    'author.facebook': 'Facebook',
    'author.github': 'GitHub',
    'contact.required': '必須',
    'contact.honeypot': 'こちらには何も入力しないでください:',
    'privacy.established': '{date}制定',
    'privacy.updated': '{date}更新',
  },
});

/**
 * @typedef {keyof typeof ui} Locale
 */

/**
 * @typedef {keyof (typeof ui)['ja']} UIStringKey
 */
