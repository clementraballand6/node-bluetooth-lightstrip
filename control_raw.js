const bluetooth = require('node-bluetooth');
const device = new bluetooth.DeviceINQ();

device.findSerialPortChannel('0E:1A:02:00:14:A6', function(channel){
    console.log(channel);
    // make bluetooth connect to remote device
    bluetooth.connect('0E-1A-02-00-14-A6', channel, function(err, connection){
        if(err) return console.error(err);
        connection.write(new Buffer('0000020b000e000a00040012090056ff0000001000f0aa', 'hex'), () => {
            console.log("wrote");
        });
    });

});

