
# Tally-JS

## About
This is a simple inventory scanning application that allows you to use an HID device to scan typical sku's and barcodes. Stores them in a flat file database ([Lowdb](https://github.com/typicode/lowdb)) and allows you to export them to an excel spreed sheet when ready.

This was born out of my need to speed up year end inventory at a retail store.

### Getting Started

Download and extract the repo, then run the following commands.

```
npm install
npm run start
```
Then follow the questions from the command prompt. 

> Please note that sudo access is needed in order to access the HID device, you may also have to allow your terminal permission extend to reading the keyboard.

> Currently this is setup to use my Symbol LS2208 USB Barcode scanner. This can be updated to use any scanning device, you can find all external HID Devices by extending the code and calling `getDevices()`.

### Find All Devices
```
const scanner = new UsbScanner();
console.log(scanner.getDevices());
```

This will return all connected HID devices connected. Get the `vendorId` and `productId` from the logged output and pass them as arguments when initializing the `UsbScanner` class.
