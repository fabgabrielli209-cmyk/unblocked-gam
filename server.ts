import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Proxy endpoint: fetches external web pages, strips frame restrictions & CSP, and relays them
  app.get('/api/proxy', async (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).send('Missing target URL parameter.');
    }

    try {
      let resolved = targetUrl.startsWith('http://') || targetUrl.startsWith('https://')
        ? targetUrl
        : `https://${targetUrl}`;

      const response = await fetch(resolved, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
      });

      const contentType = response.headers.get('content-type') || 'text/html';
      res.setHeader('Content-Type', contentType);
      
      // Strip frame-ancestors, CSP, and X-Frame-Options to allow embedding in iframe
      res.removeHeader('X-Frame-Options');
      res.removeHeader('Content-Security-Policy');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('X-Proxy-By', 'gam-3');

      // If HTML content, inject <base> tag so relative styles, images, and links resolve
      if (contentType.includes('text/html')) {
        let html = await response.text();
        const finalUrl = response.url || resolved;
        const baseHref = finalUrl.endsWith('/') ? finalUrl : `${finalUrl}/`;
        const baseTag = `<base href="${baseHref}">`;

        // Strip meta CSP tags inside HTML
        html = html.replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '');
        html = html.replace(/<meta[^>]*http-equiv=["']X-Frame-Options["'][^>]*>/gi, '');

        // Inject base tag
        if (/<head[^>]*>/i.test(html)) {
          html = html.replace(/(<head[^>]*>)/i, `$1\n  ${baseTag}`);
        } else {
          html = `${baseTag}\n${html}`;
        }

        res.send(html);
        return;
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      res.send(buffer);
    } catch (err: any) {
      // Friendly HTML error page with fallback options
      res.status(502).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Proxy Relay Notice</title>
          <style>
            body { background: #0b0f19; color: #f1f5f9; font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
            .card { background: #182234; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; max-width: 480px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
            h1 { font-size: 20px; color: #38bdf8; margin: 0 0 12px; }
            p { font-size: 14px; color: #94a3b8; line-height: 1.5; margin: 0 0 24px; }
            .btn { display: inline-block; background: #0284c7; color: white; text-decoration: none; padding: 10px 20px; border-radius: 10px; font-weight: 600; font-size: 13px; transition: background 0.2s; }
            .btn:hover { background: #0369a1; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Connection Relay Notice</h1>
            <p>Target (${targetUrl}) could not be reached directly through the relay: ${err.message || 'Network blocked'}.</p>
            <a href="${targetUrl}" target="_blank" rel="noopener noreferrer" class="btn">Open Target Site in New Window</a>
          </div>
        </body>
        </html>
      `);
    }
  });

  // Proxy status endpoint
  app.get('/api/proxy/status', (_req, res) => {
    res.json({
      status: 'active',
      name: 'gam-3 proxy engine',
      protocols: ['http', 'https', 'relay'],
      timestamp: Date.now(),
    });
  });

  // Mount Vite middlewares for SPA dev mode
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, port: PORT, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`gam-3 proxy and application server listening on port ${PORT}`);
  });
}

startServer().catch(console.error);
