const assert = require('assert');
const { delayPromise } = require('./utils');

module.exports = class Device {
    constructor(peripheral, driver, options = {}) {
        this.peripheral = peripheral;
        this.driver = driver;
        this.options = options;
        this.reconnectAttempts = 0;

        this._debug('device class instance created with peripheral :', peripheral);
        this._debug('device class instance created with driver :', driver);

        Object.keys(driver.methods).forEach((method) => {
            assert.equal(typeof driver.methods[method], 'object');

            this[method] = async (param) => {
                this.lastParam = param;
                return this._periphWrite(method, param);
            }
            this._debug(`created method ${method}`);
        });
    }

    async connect() {
        this._debug(`connecting to ${this.peripheral.address} (${this.peripheral.advertisement.localName}) ...`);
        await this.peripheral.connectAsync();
        this._debug(`successfully connected to ${this.peripheral.address} (${this.peripheral.advertisement.localName}) !`);
    }

    disconnect(delay = 1000) {
        return delayPromise(delay, () => this.peripheral.disconnectAsync());
    }

    setDelay(delay) {
        this._debug(`delay set to ${delay} ms`);
        this.options.delay = delay;
    }

    async startBlinking(colors, delay = 100) {
        this.isBlinking = true;
        this.options.delay = delay;
        while (this.isBlinking) {
            for (let i = 0; i < colors.length; i++) {
                await this.color(colors[i]);
            }
        }
    }

    stopBlinking() {
        this.isBlinking = false;
    }

    async _periphWrite(driverProp, param) {
        this._debug(`[writeHandle] using driver method '${driverProp}'${param ? ` with param ${param}` : ''}`);

        await delayPromise(this.options.delay);

        if (this.peripheral.state === 'disconnected') {
            if (this.reconnectAttempts === this.options.maxReconnectAttempts) throw new Error('unable to reconnect to device');

            this._debug(`peripheral state is disconnected, trying to reconnect (attempt #${this.reconnectAttempts + 1})`);
            await this.connect();
            this.reconnectAttempts++;
            return await this._periphWrite.apply(this, arguments);
        } else {
            this.reconnectAttempts = 0;
        }

        return this.peripheral.writeHandleAsync(
            this.driver.methods[driverProp].handle,
            this.driver.methods[driverProp].data(param),
            !this.driver.methods[driverProp].writeReq
        );
    }

    _debug(message, dump) {
        if (this.options.debug) {
            dump ? console.debug(`[DEBUG] ${message}`, dump) : console.debug(`[DEBUG] ${message}`);
        }
    }
}
