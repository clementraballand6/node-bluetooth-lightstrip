const { createProps } = require('../utils/utils');

module.exports = {
    criteria: {
        // usually QHM devices starts by QHM- and ends with 2 last mac address bytes (eg: QHM-14A6)
        localName: /^QHM-[a-z0-9]{4}$/i,
        // tested 4 lightstrips and bytes 2, 3 and 4 were the same
        address: /^[a-z0-9]{2}:1A:02:00:[a-z0-9]{2}:[a-z0-9]{2}$/i
    },
    color: createProps(
        0x0009,
        (rgb) => Buffer.from(`56${rgb}00F0AA`, 'hex'),
        true
    ),
    on: createProps(
        0x0009,
        () => Buffer.from('CC2333', 'hex'),
        true
    ),
    off: createProps(
        0x0009,
        () => Buffer.from('CC2433', 'hex'),
        true
    )
};
