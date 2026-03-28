/**
 * PM2 config for the API. Install: npm install -g pm2
 * From repo root: pm2 start ecosystem.config.cjs
 */
const path = require("path");

module.exports = {
  apps: [
    {
      name: "autodetaailing-api",
      cwd: path.join(__dirname, "backend"),
      script: "dist/server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
