import { callSystemone, getModels } from './jev-client.js';

export default function jevMiddleware() {
  return {
    name: 'jev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/jev', async (req, res) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const path = url.pathname.replace('/api/jev', '');
        const method = req.method;

        res.setHeader('Content-Type', 'application/json');

        try {
          if (method === 'GET' && path === '/models') {
            const models = await getModels();
            res.statusCode = 200;
            res.end(JSON.stringify({ models }));
            return;
          }
          if (method === 'POST' && path === '/systemone') {
            let body = '';
            for await (const chunk of req) body += chunk;
            const { model = 'jev-latest', state, questions } = JSON.parse(body);
            const result = await callSystemone({ model, state, questions });
            res.statusCode = 200;
            res.end(JSON.stringify(result));
            return;
          }
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Not found' }));
        } catch (e) {
          const status = e.status || 500;
          res.statusCode = status;
          res.end(JSON.stringify({ error: e.message, status }));
        }
      });
    },
  };
}
