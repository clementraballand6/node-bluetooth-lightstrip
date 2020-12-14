const assert = require('assert');
const { delayPromise, timeoutPromise } = require('./utils');
const rejectTimeout = timeoutPromise(5000, false);

module.exports = class Device {
    constructor(peripheral, driver, options = {}) {
        this.peripheral = peripheral;
        this.driver = driver;
        this.options = options;
        this.reconnectAttempts = 0;

        this._debug('device class instance created with peripheral :', peripheral);
        this._debug('device class instance created with driver :', driver);

        Object.keys(driver.methods).forEach((method) => {
            this[method] = async (param) => {
                this.lastParam = param;
                return this._periphWrite(method, param);
            }
            this._debug(`created method ${method}`);
        });
    }

    async connect() {
        this._debug(`connecting ...`);
        await this.peripheral.connectAsync();
        this._debug(`successfully connected !`);
    }

    disconnect(delay = 0) {
        this._debug(`disconnecting from ${this.peripheral.address} ...`)
        return delayPromise(delay, () => this.peripheral.disconnectAsync())
            .then(() => this._debug(`disconnected successfully!`));
    }

    setDelay(delay) {
        this._debug(`delay set to ${delay} ms`);
        this.options.delay = delay;
    }

    async startBlinking(colors = ['ff0000', '00ff00'], delay = 100) {
        this.isBlinking = true;
        this.options.delay = delay;
        while (this.isBlinking) {
            for (let i = 0; i < colors.length; i++) {
                if (this.isBlinking) {
                    await this.color(colors[i]);
                }
            }
        }
    }

    stopBlinking() {
        this.isBlinking = false;
    }

    async _periphWrite(driverProp, param) {
        this._debug(`[writeHandle] using driver method '${driverProp}'${param ? ` with param ${param}` : ''}`);

        if (this.peripheral.state === 'disconnected') {
            if (this.reconnectAttempts === this.options.maxReconnectAttempts) throw new Error('unable to reconnect to device');
            this._debug(`peripheral state is disconnected, trying to reconnect (attempt #${this.reconnectAttempts + 1})`);
            await this.connect();
            this.reconnectAttempts++;

            await this._periphWrite(driverProp, param);
        } else {
            this.reconnectAttempts = 0;
        }

        await this.peripheral.writeHandleAsync(
            this.driver.methods[driverProp].handle,
            this.driver.methods[driverProp].data(param),
            !this.driver.methods[driverProp].writeReq
        );

        return await delayPromise(this.options.delay);
    }

    _debug(message, dump) {
        if (this.options.debug) {
            const devicePrefix = this.peripheral.advertisement.localName || this.peripheral.address;
            dump ? console.debug(`[DEBUG] [${devicePrefix}] ${message}`, dump) : console.debug(`[DEBUG] [${devicePrefix}] ${message}`);
        }
    }
}
