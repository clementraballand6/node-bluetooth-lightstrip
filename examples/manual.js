const process = require('process');
const deviceFinder = require('../index');

(async () => {
    const device = await deviceFinder({
        debug: true,
        auto: false,
        driver: 'qhm',
        // localName: 'QHM-0AFF',
        address: '01:1a:02:00:08:6e'
        // address: '0e:1a:02:00:14:a6'
    });

    await device.connect();
    await device.on();

    device.startBlinking(['ff0000', '00ff00', '0000ff']);

    setTimeout(async () => {
        device.stopBlinking();
        await device.off();
        device.disconnect();
    }, 2000);
})();
