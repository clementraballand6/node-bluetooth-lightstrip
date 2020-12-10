const noble = require('@abandonware/noble');
const fs = require('fs');

const DRIVERS_DIR = './drivers';

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

function delayPromise(delay, cb = () => {}) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(cb());
        }, delay);
    });
}

class Device {
    constructor(peripheral, driver) {
        this.peripheral = peripheral;
        this.driver = driver;
        this.delay = 0;

        ['color', 'on', 'off'].forEach((method) => {
           if (!driver[method]) return;
           this[method] = (param) => {
               return this._periphWrite(method, param);
           }
        });
    }

    connect() {
        return this.peripheral.connectAsync();
    }

    disconnect(delay = 1000) {
        return delayPromise(delay, () => this.peripheral.disconnectAsync());
    }

    async startBlinking(colors, delay = 100) {
        this.isBlinking = true;
        this.delay = delay;
        while (this.isBlinking) {
            for (let i = 0; i < colors.length; i++) {
                await this.color(colors[i]);
            }
        }
    }

    async _periphWrite(driverProp, param) {
        // console.time(driverProp + param);
        await delayPromise(this.delay);
        // console.timeEnd(driverProp + param);
        return this.peripheral.writeHandleAsync(
            this.driver[driverProp].handle,
            this.driver[driverProp].data(param),
            !this.driver[driverProp].writeReq
        );
    }
}

module.exports = async (options) => {
    if (options.auto) {
        const { peripheral, driver } = await findPeripheral(autoDetect());
        return new Device(peripheral, driver);
    }
}
