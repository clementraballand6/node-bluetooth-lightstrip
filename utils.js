module.exports = {
    createProps: (handle, data, writeReq) => {
        return {
            handle,
            data,
            writeReq
        };
    },
    delayPromise: (delay = 0, cb = () => {}) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(cb());
            }, delay);
        });
    },
    timeoutPromise: (delay, forward = true) => {
        return (promise) => {
            return new Promise((resolve, reject) =>{
               const onTimeout = () => {
                   forward ? resolve() : reject('promise timed out');
               };
               setTimeout(onTimeout, delay);

               promise.then((res) => {
                   clearTimeout(onTimeout);
                   resolve(res);
               });
            });
        }
    }
}
