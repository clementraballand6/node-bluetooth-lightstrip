const process = require('process');
const deviceFinder = require('../index');

(async () => {
    const devices = await deviceFinder([{
        debug: true,
        auto: false,
        driver: 'qhm',
        address: '01:1a:02:00:08:6e'
        // address: '01:1a:02:00:08:6e'
    }, {
        debug: true,
        auto: false,
        driver: 'qhm',
        localName: 'QHM-0AFF',
        // address: '01:1a:02:00:08:6e'
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
