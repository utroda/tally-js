import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs';
import inquirer from 'inquirer';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import chalk from 'chalk';
import json2xls from 'json2xls';

import UsbScanner from './usbScanner.js';

const QUESTIONS = [
  {
    name: 'scanInventory',
    type: 'confirm',
    message: 'Do you want to start scanning inventory today?',
  },
  {
    name: 'cleanDb',
    type: 'confirm',
    message: 'Do you want to clear the database before scanning?',
    when: (answers) => answers.scanInventory
  },
  {
    name: 'exportInventory',
    type: 'confirm',
    message: 'Do you want to export your inventory?',
    when: (answers) => !answers.scanInventory
  }
];

inquirer.prompt(QUESTIONS).then(async (answers) => {
  const { scanInventory, cleanDb, exportInventory } = answers;
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const file = join(__dirname, 'db.json');

  const adapter = new JSONFile(file);
  const db = new Low(adapter);

  await db.read();
  db.data ||= { inventory: [] }


  if (cleanDb) {
    db.data = { inventory: [] };
    await db.write();
  }

  if (scanInventory && !exportInventory) {
      
    const scanner = new UsbScanner({
      vendorId: 1504,
      productId: 4608,
    });

    const findVariantBySku = (code) => {
      return db.data.inventory.find((variant) => variant.sku === code);
    };

    const findVariantIndexBySku = (code) => {
      return db.data.inventory.findIndex((variant) => variant.sku === code);
    }

    scanner.on('data', async (code) => {
      if (!!code.length) {
        if (!findVariantBySku(code)) {
          db.data.inventory.push({sku: code, count: 1});
          await db.write();
          console.log(chalk.green('✅ - You\'ve found a new variant. Adding it to the database.'));
        } else {
          const variantIndex = findVariantIndexBySku(code);
          const variant = db.data.inventory[variantIndex];
          const newCount = ++variant.count;

          db.data.inventory[variantIndex] = {
            ...variant,
            count: newCount,
          }

          await db.write();

          console.log(chalk.magenta(`👍 - Updating variant ${code} count to ${newCount}`));
        }
      }
    });

    scanner.startScanning();
  }

  if (!scanInventory && exportInventory) {
    fs.writeFileSync(`inventory-${new Date().toJSON().slice(0, 10)}`, json2xls(db.data.iventory), 'binary');
    console.log(chalk.green('📦 - Your spread sheet has been created!'));
  }
});
