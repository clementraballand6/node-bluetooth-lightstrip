const deviceFinder = require('./BLELightstrip');

(async () => {
    const device = await deviceFinder({
        auto: true
    });

    console.log(device);

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

    // await device.disconnect();
    // await device.color('0000ff');

})();
