import getPort from 'get-port';
import logger from './logger';

export async function getAvailablePort(preferPort: number, range = 50): Promise<number> {
  for (let i = preferPort; i <= preferPort + range; i += 1) {
    const port = await getPort({ port: i });
    if (port === i) {
      return i;
    }
  }

  const fallback = await getPort();
  logger.warn(`Could not find free port in range ${preferPort}-${preferPort + range}, using ${fallback}`);
  return fallback;
}
