/**
 * Netlify site that stores the contact form submissions with Netlify Forms and notifies the team.
 * The form was registered there by the last Netlify deploy of this repository. Every field is passed
 * on, but Netlify only keeps those known to that deploy: `name`, `company`, `email`, `subject`,
 * `message` and `privacy`.
 * @see https://docs.netlify.com/manage/forms/setup/
 */
const NETLIFY_FORMS_SITE = 'https://www-webdino-org.netlify.app';

/**
 * Page on the Netlify site to post the submissions to. Netlify Forms accepts a POST request to a
 * page path, but redirect rules in `_redirects` run first, e.g. a POST to `/` gets the `302` to
 * `/ja/` and never reaches Netlify Forms.
 */
const NETLIFY_FORMS_PATH = '/ja/contact/';

/** Form name registered with Netlify Forms. */
const FORM_NAME = 'contact';

/** Honeypot field that only bots fill in. */
const HONEYPOT_FIELD = 'bot-field';

/** Field added by the Cloudflare Turnstile widget. */
const TURNSTILE_FIELD = 'cf-turnstile-response';

/**
 * Receive a contact form submission, verify its Cloudflare Turnstile token and pass it on to
 * Netlify Forms. Set the `TURNSTILE_SECRET_KEY` secret on the Cloudflare Pages project. For local
 * development with `wrangler pages dev`, put the test secret that always passes in `.dev.vars`:
 * `TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA`.
 * @see https://developers.cloudflare.com/pages/functions/api-reference/
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 * @param {object} context Pages Function context.
 * @param {Request} context.request Incoming request.
 * @param {{ TURNSTILE_SECRET_KEY?: string }} context.env Environment variables and secrets.
 * @returns {Promise<Response>} Response.
 */
export const onRequestPost = async ({ request, env }) => {
  const secret = env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    console.error('TURNSTILE_SECRET_KEY is not set');

    return respond(500);
  }

  /** @type {FormData} */
  let formData;

  try {
    formData = await request.formData();
  } catch {
    return respond(400);
  }

  // Drop spam silently like Netlify Forms does
  if (formData.get(HONEYPOT_FIELD)) {
    return respond(200);
  }

  const token = formData.get(TURNSTILE_FIELD);

  if (typeof token !== 'string' || !token) {
    return respond(403);
  }

  try {
    const body = new URLSearchParams({ secret, response: token });
    const remoteip = request.headers.get('CF-Connecting-IP');

    if (remoteip) {
      body.set('remoteip', remoteip);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });

    /** @type {{ success: boolean, 'error-codes'?: string[] }} */
    const { success, 'error-codes': errorCodes } = await response.json();

    if (!success) {
      console.info('Turnstile verification failed', errorCodes);

      return respond(403);
    }
  } catch (error) {
    console.error('Turnstile verification error', error);

    return respond(502);
  }

  formData.delete(TURNSTILE_FIELD);
  formData.set('form-name', FORM_NAME);

  const fields = [...formData].map(([name, value]) => [name, String(value)]);

  try {
    // Netlify Forms answers with its success page or a redirect to it, which doesn't need to be
    // followed
    const response = await fetch(new URL(NETLIFY_FORMS_PATH, NETLIFY_FORMS_SITE), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(fields).toString(),
      redirect: 'manual',
    });

    if (response.status >= 400) {
      console.error('Netlify Forms error', response.status, await response.text());

      return respond(502);
    }
  } catch (error) {
    console.error('Netlify Forms request error', error);

    return respond(502);
  }

  return respond(200);
};

/**
 * Create a plain text response. The contact page only checks the status; the text is for visitors
 * without JavaScript, who can’t pass Turnstile anyway.
 * @param {number} status HTTP status code.
 * @returns {Response} Response.
 */
const respond = (status) =>
  new Response(
    status === 200
      ? 'お問い合わせありがとうございます。'
      : status === 403
        ? '送信を確認できませんでした。ページを再読み込みして、もう一度お試しください。'
        : 'フォームの送信中に問題が発生しました。お手数ですが、また後でお試しください。',
    {
      status,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    },
  );
