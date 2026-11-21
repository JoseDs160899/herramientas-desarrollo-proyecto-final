'use strict';

module.exports = {
  apps: [
    {
      name: 'registrau',
      script: 'src/server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      node_args: '--no-warnings',
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: 3000
      }
    }
  ]
};
