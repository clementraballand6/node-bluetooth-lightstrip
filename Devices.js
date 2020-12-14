module.exports = class Devices {
    constructor(devices = []) {
        this.devices = devices;
    }

    add(device) {
        this.devices.push(device);
    }

    list() {
        return this.devices;
    }

    triggerAsyncMethod(method, params) {
        const promises = this.devices.map((device) => {
            return device[method].apply(device, params);
        });

        return Promise.all(promises);
    }

    triggerSyncMethod(method, params) {
        this.devices.forEach((device) => {
            device[method].apply(device, params);
        });
    }

    connect() {
        Object.keys(this.devices[0].driver.methods).forEach((method) => {
            this[method] = (param) => this.triggerAsyncMethod(method, param);
        });
        return this.triggerAsyncMethod('connect', arguments);
    }

    disconnect(delay = 0) {
        console.log('lel');
        return this.triggerAsyncMethod('disconnect', arguments);
    }

    setDelay(delay) {
        return this.triggerSyncMethod('setDelay', arguments);
    }

    startBlinking(colors, delay = 100) {
        return this.triggerAsyncMethod('startBlinking', arguments);
    }

    stopBlinking() {
        return this.triggerSyncMethod('stopBlinking', arguments);
    }

    _debug(message, dump) {
        if (this.options.debug) {
            dump ? console.debug(`[DEBUG] ${message}`, dump) : console.debug(`[DEBUG] ${message}`);
        }
    }
}
