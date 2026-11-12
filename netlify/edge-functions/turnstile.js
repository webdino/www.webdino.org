// @ts-nocheck: Netlify Edge Functions run on Deno with the `Netlify` global
/* global Netlify */

/**
 * Reject form submissions without a valid Cloudflare Turnstile token before they reach Netlify
 * Forms, which can't verify Turnstile itself. Netlify Forms accepts a POST request to any path of
 * the site, and spam bots usually post to it directly without the contact page, so every POST
 * request is checked. The site has no other POST endpoints.
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 * @see https://docs.netlify.com/build/edge-functions/api/
 * @param {Request} request Incoming request.
 * @param {{ ip: string }} context Netlify context.
 * @returns {Promise<Response | undefined>} Error response, or `undefined` to continue to Netlify
 * Forms.
 */
export default async (request, context) => {
  const secret = Netlify.env.get('TURNSTILE_SECRET_KEY');

  if (!secret) {
    console.error('TURNSTILE_SECRET_KEY is not set');

    return reject();
  }

  /** @type {FormData} */
  let formData;

  try {
    // Clone it so Netlify Forms can read the original body
    formData = await request.clone().formData();
  } catch {
    return reject();
  }

  const token = formData.get('cf-turnstile-response');

  if (typeof token !== 'string' || !token) {
    return reject();
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret, response: token, remoteip: context.ip }),
    });

    const { success, 'error-codes': errorCodes } = await response.json();

    if (!success) {
      console.info('Turnstile verification failed', errorCodes);

      return reject();
    }
  } catch (error) {
    console.error('Turnstile verification error', error);

    return reject();
  }

  // Continue to Netlify Forms
  return undefined;
};

/**
 * Create a response for a rejected submission.
 * @returns {Response} Response.
 */
const reject = () =>
  new Response('送信を確認できませんでした。ページを再読み込みして、もう一度お試しください。', {
    status: 403,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });

export const config = {
  path: '/*',
  method: 'POST',
};
