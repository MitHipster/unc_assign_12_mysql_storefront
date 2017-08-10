/*jslint esversion: 6, browser: true*/
const inquirer = require('inquirer');
const mysql = require('mysql');
const table = require('table').table;
const chalk = require('chalk');
const border = require('./border.js');
const messages = {
  lowItem: 'Which item would you like to restock? Enter product ID.',
  lowAmount: 'How many items should be added? (enter 0 to cancel)'
};

const query = {
  // Query to show all products
  viewProducts: "SELECT prod_id AS Id, prod_name AS Product, CONCAT('$', FORMAT(price, 2)) AS Price, quantity AS Quantity FROM products",
  // Query to show low inventory items
  lowInventory: "SELECT prod_id AS Id, prod_name AS Product, CONCAT('$', FORMAT(price, 2)) AS Price, quantity AS Quantity FROM products WHERE quantity <= 5 ORDER BY quantity ASC, price ASC",
  // Query to add inventory to a selected item
  addInventory: "UPDATE products SET quantity = quantity + ? WHERE prod_id = ?;"
};

// Store array of product IDs to validate manager selection
let prodIds = [];

let connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'storeDB'
});

connection.connect(function (err) {
  if (err) throw err;
});

let prompts = function () {
  inquirer.prompt({
    type: 'list',
    name: 'options',
    message: 'Enter menu item number.',
    choices: [
      '1. View Products for Sale',
      '2. View Low Inventory',
      '3. Add to Inventory',
      '4. Add New Product',
      '5. Quit'
    ]
  }).then(function (answer) {
    let option = parseInt(answer.options.charAt(0));
    switch (option) {
      case 1:
        products(query.viewProducts, prompts);
        break;
      case 2:
        products(query.lowInventory, prompts);
        break;
      case 3:
        products(query.viewProducts, function () {
          addInventory(query.addInventory);
        });
        break;
      case 4:
        addProduct();
        break;
      default:
        connection.end();
        return false;
    }
  });
};

let products = function (view, callback) {
  connection.query(view, function (err, results) {
    if (err) throw err;
    // Field names for products table
    let fieldNames = [ ['ID', 'Product', 'Price', 'quantity'] ];
    // Loop through elements in the array
    let products = tableData(fieldNames, results);
    let output = table(products, border.config);
    console.log(output);
    if (callback) callback();
  });
};

let tableData = function (data, results) {
  // Loop through elements in the array
  results.forEach(function (result, i) {
    // Push to data an empty array
    data.push([]);
    // Loop through each key in the element
    for (let key in result) {
      // Populate product IDs array for validating product ID selection
      if (key === 'Id') prodIds.push(result[key]);
      // Start pushing at index 1 as index 0 contains field names
      // Push key's value into empty array
      data[i + 1].push(result[key]);
    }
  });
  return data;
};

let addInventory = function (view) {
  inquirer.prompt([
    {
      type: 'input',
      name: 'item',
      message: messages.lowItem,
      validate: function (value) {
        value = parseInt(value);
        if (prodIds.indexOf(value) !== -1) {
          return true;
        } else {
          return 'Please enter a valid product ID.';
        }
      }
    },
    {
      type: 'input',
      name: 'quantity',
      message: messages.lowAmount,
      validate: function (value) {
        value = parseInt(value);
        if (Number.isInteger(value) && parseInt(value) >= 0) {
          return true;
        } else {
          return 'Please enter a positive, whole number.';
        }
      }
    }
  ]).then(function (answers) {
    // Convert validated inouts to integers
    let item = parseInt(answers.item);
    let amt = parseInt(answers.quantity);
    if (amt === 0) {
      console.log(chalk.bold.red('\nRequest has been cancelled.\n'));
      prompts();
    } else {
      connection.query(view, [amt, item], function (err, results) {
        if (err) throw err;
        console.log(chalk.bold.cyan('\nUpdate successful.\n'));
        prompts();
      });
    }
  });
};

let addItem = function () {

};

prompts();
