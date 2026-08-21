// Cloudflare Worker Universal Handler
import { onRequestPost, onRequestOptions } from "./functions/api/analyze.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/analyze") {
      if (request.method === "OPTIONS") {
        return onRequestOptions();
      }
      if (request.method === "POST") {
        return onRequestPost({ request, env });
      }
    }

    // Serve static assets via Cloudflare Pages
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not Found", { status: 404 });
  }
};
