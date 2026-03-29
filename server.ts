import http from 'http';
import { WebSocketServer } from 'ws';
import app from './src/app';
import { config } from './src/config';
import logger from './src/utils/logger';

let serverStarted = false;
let wsServer: WebSocketServer | null = null;

async function start() {
  if (serverStarted) {
    logger.info('Server already started.');
    return;
  }

  serverStarted = true;

  const port = config.port;
  const wsPort = config.wsPort;

  const httpServer = http.createServer(app);

  httpServer.listen(port, () => {
    logger.info(`HTTP server running on http://localhost:${port}`);
  });

  httpServer.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${port} is already in use. Please use a different port or stop the existing server.`);
    } else {
      logger.error('HTTP server error', err);
    }
  });

  wsServer = new WebSocketServer({ port: wsPort });

  wsServer.on('connection', (socket) => {
    logger.info('WS client connected');
    socket.send(JSON.stringify({ type: 'welcome', message: 'Connected to Velora WS' }));

    socket.on('message', (msg) => {
      logger.info(`WS message received: ${msg}`);
      try {
        const payload = JSON.parse(msg.toString() || '{}');
        if (payload.type === 'ping') {
          socket.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (err) {
        socket.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
      }
    });

    socket.on('close', () => {
      logger.info('WS client disconnected');
    });
  });

  wsServer.on('listening', () => {
    logger.info(`WebSocket server running on ws://localhost:${wsPort}`);
  });

  wsServer.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      logger.warn(`WebSocket port ${wsPort} already in use, skipping WebSocket server`);
      wsServer = null;
    } else {
      logger.error('WebSocket error', err);
    }
  });

  const cleanup = () => {
    logger.info('Graceful shutdown');
    wsServer?.close();
    httpServer.close(() => process.exit(0));
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('uncaughtException', (err) => logger.error('uncaughtException', err));
  process.on('unhandledRejection', (reason) => logger.error('unhandledRejection', reason));
}

start().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
