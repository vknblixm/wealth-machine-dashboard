const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const cwd = 'C:\\Users\\Admin\\Downloads\\FounderOS-DEMO-main\\wealth-machine-dashboard';
const logDir = 'C:\\Users\\Admin\\Downloads\\FounderOS-DEMO-main\\.freebuff';
const log = fs.openSync(path.join(logDir, 'preview-56b67439-681a-4df4-a1e1-25bf4cb071b7.log'), 'w');
const err = fs.openSync(path.join(logDir, 'preview-56b67439-681a-4df4-a1e1-25bf4cb071b7.log.err'), 'w');

const child = spawn('node', ['node_modules\\next\\dist\\bin\\next', 'dev', '-p', '4200'], {
  detached: true,
  stdio: ['ignore', log, err],
  cwd,
  shell: false
});

child.unref();
console.log('Started Next.js dev server, PID: ' + child.pid);
