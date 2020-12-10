const noble = require('@abandonware/noble');
const deviceName = 'QHM-14A6';
noble.startScanning(); // any service UUID, no duplicates

noble.on('discover', async (device) => {
    if (device.advertisement.localName === deviceName) {
        console.log(device);
        await device.connectAsync();
        console.log('sending');
        // 0240000e000a0004001209005600ff0000f0aa
        // await device.writeHandleAsync(0x0009, Buffer.from('CC2333', 'hex'), false); // on
        await device.writeHandleAsync(0x0009, Buffer.from('CC2433', 'hex'), false); // off
        // await device.writeHandleAsync(0x0009, Buffer.from('560000FF00F0AA', 'hex'), false); // blue
        // await device.writeHandleAsync(0x0009, Buffer.from('5600FF0000F0AA', 'hex'), false); // green
        await device.disconnectAsync();
    }
});
