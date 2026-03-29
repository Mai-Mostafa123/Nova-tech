import { spawn } from 'node:child_process';

const processes = [
  spawn('npm.cmd', ['run', 'dev:backend'], { stdio: 'inherit', shell: true }),
  spawn('npm.cmd', ['run', 'dev:frontend'], { stdio: 'inherit', shell: true }),
];

const shutdown = () => {
  for (const child of processes) {
    if (!child.killed) {
      child.kill();
    }
  }
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

for (const child of processes) {
  child.on('exit', (code) => {
    if (code && code !== 0) {
      shutdown();
    }
  });
}
