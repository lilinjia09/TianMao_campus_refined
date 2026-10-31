import http from 'node:http';
import worker from './worker.mjs';
const port = Number(process.env.PORT || 8080);
const configured = process.env.PUBLIC_ORIGIN ? new URL(process.env.PUBLIC_ORIGIN).origin : null;
if (configured && !/^https?:/.test(configured)) throw Error('PUBLIC_ORIGIN must use HTTP or HTTPS');
http.createServer(async (req, res) => {
  try {
    const origin = configured || 'http://' + (req.headers.host || 'localhost:' + port);
    const url = new URL(req.url || '/', origin);
    if (url.origin !== origin) { res.writeHead(400); res.end('Invalid URL'); return; }
    const response = await worker.fetch(new Request(url, { method: req.method, headers: req.headers }));
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch { res.writeHead(500); res.end('Temporary error'); }
}).listen(port, '0.0.0.0', () => console.log('Campus market: http://localhost:' + port));
