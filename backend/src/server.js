import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { initSockets } from './sockets/index.js';
import { startEscalationScheduler } from './services/escalation.js';

async function start() {
  await connectDB();

  const server = http.createServer(app);
  const io = initSockets(server);
  app.set('io', io); // controllers can reach io via req.app.get('io')
  // ...after const io = initSockets(server);
  startEscalationScheduler(io);
  server.listen(env.port, () =>
    console.log(`Server running on port ${env.port}`)
  );
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});