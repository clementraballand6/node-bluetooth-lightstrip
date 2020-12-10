const process = require('process');
const deviceFinder = require('./BLELightstrip');

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
    // await device.on();
    // await device.color('ff0000'); // red
    // await device.color('00ff00'); // green
    // await device.color('ff0000'); // red
    // await device.color('00ff00'); // green
    // await device.color('ff0000'); // red
    // await device.color('00ff00'); // green
    // await device.color('ff0000'); // red

    device.startBlinking(['ff0000', '00ff00', '0000ff']);

    setTimeout(() => {
        device.stopBlinking();
    }, 2000);
    // await device.disconnect();
    // await device.color('0000ff');

})();
