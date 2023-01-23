import HID from 'node-hid';
import { EventEmitter } from 'events'

class UsbScanner extends EventEmitter {
  constructor(options) {
    super();

    this.devices = [];
    this.hidDevice = undefined;
    this.hidCharMap = {
      4: 'A',
      5: 'B',
      6: 'C',
      7: 'D',
      8: 'E',
      9: 'F',
      10: 'G',
      11: 'H',
      12: 'I',
      13: 'J',
      14: 'K',
      15: 'L',
      16: 'M',
      17: 'N',
      18: 'O',
      19: 'P',
      20: 'Q',
      21: 'R',
      22: 'S',
      23: 'T',
      24: 'U',
      25: 'V',
      26: 'W',
      27: 'X',
      28: 'Y',
      29: 'Z',
      30: '1',
      31: '2',
      32: '3',
      33: '4',
      34: '5',
      35: '6',
      36: '7',
      37: '8',
      38: '9',
      39: '0',
      40: 'enter',
      43: '\t',
      44: '  ',
      45: '-',
      46: '=',
      47: '[',
      48: ']',
      49: '\\',
      51: ';',
      52: '\'',
      53: '`',
      54: ',',
      55: '.',
      56: '/',
      85: '*',
      87: '+',
    }

    if (options.path) {
      this.getDeviceByPath(options.path);
    } else {
      this.getDeviceByIds(options.vendorId, options.productId)
    }
  }

  setHidDevice(device) {
    this.hidDevice = new HID.HID(device.path);
  }

  getDevices() {
    if (!this.devices.length) {
      this.devices = HID.devices();
      return this.devices;
    }
    return this.devices;
  }

  getDeviceByPath(path) {
    const device = this.getDevices().find((device) => device.path === path);
    this.setHidDevice(device);
  }

  getDeviceByIds(vendorId, productId) {
    const device = this.getDevices().find((device) => {
      return device.vendorId === vendorId && device.productId === productId
    });
    this.setHidDevice(device);
  }

  emitScanner(barcode) {
    this.emit('data', barcode);
  }

  startScanning() {
    let barcodeBuffer = [];
    let barcode = '';

    this.hidDevice.on('data', (data) => {
      if (this.hidCharMap[data[2]]) {
        if (data[2] !== 40) {
          barcodeBuffer.push(this.hidCharMap[data[2]]);
        } else {
          barcode = barcodeBuffer.join('');
          barcodeBuffer = [];
          this.emitScanner(barcode);
        }
      }
    });
  }

  stopScanning() {
    if (this.hidDevice) {
      this.hidDevice.close();
    }
  }
}

export default UsbScanner;
