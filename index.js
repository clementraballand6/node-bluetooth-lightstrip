const noble = require('@abandonware/noble');
const fs = require('fs');
const Device = require('./Device');
const Devices = require('./Devices');

const DRIVERS_DIR = './drivers';
const DEFAULT_OPTIONS = {
    auto: true,
    debug: false,
    timeout: 500,
    maxReconnectAttempts: 5,
    discoverTimeout: 10000
};

const drivers = fs.readdirSync(DRIVERS_DIR).map((d) => {
    const config = require(`${DRIVERS_DIR}/${d}`);
    return {
        driver: d.replace('.js', ''),
        ...config
    };
});

function findByNameAndAddress(peripheral, criteria) {
    const name = peripheral.advertisement.localName;

    if (name && criteria.localName && name.match(new RegExp(criteria.localName, 'i'))) {
        return true;
    }

    if (criteria.address && peripheral.address.match(new RegExp(criteria.address, 'i'))) {
        return true;
    }

    return false;
}

function autoDetect() {
    return (peripheral) => {
        var associatedDriver = null;

        drivers.some((driver) => {
            const match = findByNameAndAddress(peripheral, driver.criteria);
            if (match) {
                associatedDriver = driver;
                return true;
            }
        });

        return associatedDriver;
    }
}

function findPeripherals(matches, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const peripherals = [];
        const onDiscover = (peripheral) => {
            matches.forEach((match) => {
                const driver = match(peripheral);

                if (driver) {
                    matches.splice(matches.indexOf(match), 1);
                    peripherals.push({
                        peripheral,
                        driver
                    });

                    if (!matches.length) {
                        resolve(peripherals);
                    }
                }
            })
        }

        noble.on('discover', onDiscover);

        setTimeout(() => {
            noble.removeListener('discover', onDiscover);
            reject(new Error('discover timed out'));
        }, timeout);
    });
}

const getDevices = async (devices, timeout = 5000) => {
    const matches = [];

    for (let i = 0; i < devices.length; i++) {
        const options = {
            ...DEFAULT_OPTIONS,
            ...devices[i]
        };

        if (options.auto) {
            matches.push(autoDetect());
        } else {
            const { localName, address } = options;
            const foundDriver = drivers.find((d) => d.driver === options.driver);
            const match = (peripheral) => {
                if (findByNameAndAddress(peripheral, {localName, address})) {
                    return foundDriver;
                }
            }

            matches.push(match);
        }
    }

    return findPeripherals(matches, timeout);
}

module.exports = async (options) => {
    const devicesOptions = Array.isArray(options) ? options : [options];

    noble.startScanning();
    const devices = await getDevices(devicesOptions);
    noble.stopScanning();

    if (Array.isArray(options)) {
        const deviceInstances = devices.map((d, i) => new Device(d.peripheral, d.driver, options[i]))
        return new Devices(deviceInstances);
    } else {
        return new Device(devices[0].peripheral, devices[0].driver, options);
    }
}
