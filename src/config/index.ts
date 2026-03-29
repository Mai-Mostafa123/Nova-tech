import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 3102),
  wsPort: Number(process.env.WS_PORT || 24680),
  jwtSecret: process.env.JWT_SECRET || 'velora-local-dev-secret',
  nodeEnv: process.env.NODE_ENV || 'development',
};
