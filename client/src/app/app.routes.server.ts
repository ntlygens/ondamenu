import { RenderMode, ServerRoute } from '@angular/ssr';

/** Render on each request so database content is always current (prerendering would freeze it at build time). */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
