// src/app/api/[...path]/route.js
//
// Server-side proxy for all /api/* requests.
//
// Why this exists:
//   Direct browser → backend (cbt-simulator-backend.vercel.app) calls fail in
//   production because:
//     1. CORS — browser blocks cross-origin requests with credentials unless
//        the backend explicitly whitelists the frontend origin.
//     2. iOS Safari ITP — third-party cookies are blocked unconditionally,
//        so the session cookie set by the backend is never stored.
//   By proxying through Next.js (same origin as the frontend), the browser
//   only ever talks to einsteinsadmin.vercel.app — no CORS, no ITP issues.
//
// Cookie handling:
//   The backend sets Set-Cookie with Domain=cbt-simulator-backend.vercel.app.
//   This route strips the Domain= attribute before forwarding the header to
//   the browser, so the cookie is stored for the frontend origin instead.
//   On subsequent requests the browser sends the cookie to /api/* → this
//   proxy forwards it to the backend → session is maintained correctly.

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND = 'https://cbt-simulator-backend.vercel.app';

// Headers that must not be forwarded (hop-by-hop or host-specific)
const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'transfer-encoding',
  'te',
  'trailer',
  'upgrade',
  'proxy-authorization',
  'proxy-authenticate',
]);

async function handler(request, context) {
  try {
    const { path } = await context.params;
    const pathStr = Array.isArray(path) ? path.join('/') : path;

    // Reconstruct the backend URL preserving query string
    const { search } = new URL(request.url);
    const backendUrl = `${BACKEND}/api/${pathStr}${search}`;

    // Forward request headers (strip hop-by-hop, replace Host)
    const forwardHeaders = {};
    request.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (!HOP_BY_HOP.has(lower) && lower !== 'host') {
        forwardHeaders[key] = value;
      }
    });

    // Read body for non-GET/HEAD requests
    let body = undefined;
    if (!['GET', 'HEAD'].includes(request.method.toUpperCase())) {
      body = await request.arrayBuffer();
      if (body.byteLength === 0) body = undefined;
    }

    // Make server-to-server request — no CORS restrictions
    const backendRes = await fetch(backendUrl, {
      method: request.method,
      headers: forwardHeaders,
      body,
      redirect: 'manual', // Don't auto-follow redirects; pass them through
    });

    // Build response headers
    const resHeaders = new Headers();
    backendRes.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (HOP_BY_HOP.has(lower)) return;

      if (lower === 'set-cookie') {
        // Strip Domain= so the cookie is owned by the frontend origin.
        // Split on comma-separated cookies carefully (commas can appear in
        // Expires values, so only split on ", " followed by a cookie-name=).
        const cookies = splitSetCookieHeader(value);
        cookies.forEach((cookie) => {
          const cleaned = cookie
            .split(';')
            .map((part) => part.trim())
            .filter((part) => !part.toLowerCase().startsWith('domain='))
            .join('; ');
          resHeaders.append('set-cookie', cleaned);
        });
      } else {
        resHeaders.set(key, value);
      }
    });

    // Stream the response body back
    const responseBody = await backendRes.arrayBuffer();

    return new NextResponse(responseBody, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: resHeaders,
    });
  } catch (err) {
    console.error('[API Proxy] Error:', err);
    return NextResponse.json(
      { message: 'Proxy error. Please try again.' },
      { status: 502 }
    );
  }
}

/**
 * Split a raw Set-Cookie header string into individual cookie strings.
 * The `Headers.forEach` API may already give individual cookies in some
 * environments; this handles both cases safely.
 */
function splitSetCookieHeader(raw) {
  // If it doesn't look like multiple cookies, return as-is
  if (!raw.includes(',')) return [raw];

  const cookies = [];
  let current = '';
  const parts = raw.split(',');

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    // A new cookie starts with "name=" at the start of the segment
    // (after trimming). "Expires=..." in the middle of a cookie value
    // starts with "Expires" not a new name=value pair.
    if (i === 0) {
      current = part;
    } else if (/^\s*[\w-]+=/.test(part) && !/(expires|max-age|path|secure|httponly|samesite)/i.test(part.trim().split('=')[0])) {
      cookies.push(current.trim());
      current = part;
    } else {
      current += ',' + part;
    }
  }
  if (current) cookies.push(current.trim());
  return cookies.length > 0 ? cookies : [raw];
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
export const HEAD = handler;
