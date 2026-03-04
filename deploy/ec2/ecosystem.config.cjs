module.exports = {
  apps: [
    {
      name: "aisee-ui",
      cwd: "/home/ubuntu/ui",
      script: "yarn",
      args: "start -p 3000",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "450M",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
