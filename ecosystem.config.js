module.exports = {
  apps: [
    {
      name: "threemail-bank",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
