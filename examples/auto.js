const process = require('process');
const deviceFinder = require('../index');

(async () => {
    const device = await deviceFinder({
        debug: true
    });

    [`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach((eventType) => {
        process.on(eventType, () => {
            device.disconnect();
            process.exit(0);
        });
    })

    await device.connect();
    await device.on();

    device.startBlinking(['ff0000', '00ff00', '0000ff']);

    setTimeout(() => {
        device.stopBlinking();
    }, 2000);
})();
