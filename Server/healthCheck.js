const http = require('http');

const options = {
    host: '127.0.0.1',
    port: 8000,
    path: '/health',
    method: 'GET',
    timeout: 2000
};

const request = http.request(options, (res) => {
    console.log(`Healthy`);
    if (res.statusCode === 200) {
        process.exit(0);
    } else {
        process.exit(1);
    }
});

request.on('error', (err) => {
    console.error("Unhealthy");
    process.exit(1);
});

request.on('timeout', () => {
    console.error('Unhealthy');
    request.destroy();
    process.exit(1);
});

request.end();
