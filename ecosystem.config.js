module.exports = {
    apps: [
        {
            name: "pwd-manager",
            script: "./server/dist/index.js",
            env: {
                NODE_ENV: "production",
                PORT: 3001,
            },
        },
    ],
};
