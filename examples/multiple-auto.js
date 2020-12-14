const process = require('process');
const deviceFinder = require('../index');

(async () => {
    const devices = await deviceFinder([{
        debug: true,
        auto: true
    }, {
        debug: true,
        auto: true
    }]);

    [`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach((eventType) => {
        process.on(eventType, async () => {
            // await devices.disconnect();
            process.exit(0);
        });
    })

    await devices.connect();
    await devices.on();

    devices.startBlinking(['ff0000', '00ff00', '0000ff']);

    setTimeout(() => {
        devices.stopBlinking();
    }, 2000);
})();
