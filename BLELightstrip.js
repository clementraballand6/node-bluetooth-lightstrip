const noble = require('@abandonware/noble');
const fs = require('fs');
const Device = require('./Device');

const DRIVERS_DIR = './drivers';
const DEFAULT_OPTIONS = {
    auto: true,
    debug: false,
    timeout: 0,
    maxReconnectAttempts: 5
};

const drivers = fs.readdirSync(DRIVERS_DIR).map((d) => {
    const config = require(`${DRIVERS_DIR}/${d}`);
    return {
        driver: d.replace('.js', ''),
        ...config
    };
});

function autoDetect() {
    return (peripheral) => {
        var associatedDriver = null;
        drivers.some((driver) => {
            const name = peripheral.advertisement.localName;
            if (
                (
                    !name ||
                    (name && name.match(driver.criteria.localName))
                ) &&
                peripheral.address.match(driver.criteria.address)
            ) {
                associatedDriver = driver;
                return true;
            }
        });

        return associatedDriver;
    }
}

function findPeripheral(match, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const onDiscover = async (peripheral) => {
            const driver = match(peripheral);
            if (driver) {
                noble.stopScanning();
                resolve({
                    peripheral,
                    driver
                });
            }
        }

        noble.startScanning();
        noble.on('discover', onDiscover);

        setTimeout(() => {
            noble.removeListener('discover', onDiscover);
            noble.stopScanning();
            reject('discover timed out');
        }, timeout);
    });
}

module.exports = async (options) => {
    options = {
        ...DEFAULT_OPTIONS,
        ...options
    };

    if (options.auto) {
        const { peripheral, driver } = await findPeripheral(autoDetect());
        return new Device(peripheral, driver, options);
    }
}
