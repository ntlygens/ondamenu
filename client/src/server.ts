import { AngularAppEngine, createRequestHandler } from '@angular/ssr';

/**
 * Platform-neutral server entry (built with "experimentalPlatform": "neutral").
 * Runs inside the Cloudflare Worker (worker/index.mjs) and under `ng serve`.
 */
const angularApp = new AngularAppEngine();

/** Renders one page request; resolves to null when the URL isn't an Angular route. */
export function renderPage(request: Request, context?: unknown): Promise<Response | null> {
  return angularApp.handle(request, context);
}

/** Request handler used by the Angular CLI dev server. */
export default createRequestHandler(async (request) => {
  return (await renderPage(request)) ?? new Response('Not found', { status: 404 });
});
