/*jslint esversion: 6, browser: true*/
const inquirer = require('inquirer');
const mysql = require('mysql');
const table = require('table').table;
const chalk = require('chalk');
const border = require('./border.js');
const messages = {
  buyWhat: 'What item would you like to purchase? Enter product ID.',
  howMany: 'How many would you like to buy?'
};
// Query to show all products
const queryShow = "SELECT prod_id AS Id, prod_name AS Product, concat('$', format(price, 2)) AS Price FROM products";
// Query to return inventory of item to be purchased
const queryCheck = "SELECT quantity FROM products WHERE ?";
// Column headings for products table
let products = [
  ['ID', 'Product', 'Price']
];
// Store array of product IDs to validate user selection
let prodIds = [];

// Add to border configuration object syles for the Price column
border.config.columns = {
  2: {
    alignment: 'right',
    width: 8
  }
};

let connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'storeDB'
});

connection.connect(function (err) {
  if (err) throw err;
  showProducts();
});

let showProducts = function () {
  connection.query(queryShow, function (err, results) {
    if (err) throw err;
    // Loop through elements in the array
    results.forEach(function (result, i) {
      // Push to products an empty array
      products.push([]);
      // Loop through each key in the element
      for (let key in result) {
        // Populate product IDs array for validating product ID selection
        if (key === 'Id') prodIds.push(result[key]);
        // Start pushing at index 1 as index 0 contains field names
        // Push key's value into empty array
        products[i + 1].push(result[key]);
      }
    });
    let output = table(products, border.config);
    console.log(output);
    prompts();
  });
};

let prompts = function () {
  inquirer.prompt([
    {
      type: 'input',
      name: 'purchase',
      message: messages.buyWhat,
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
      message: messages.howMany,
      validate: function (value) {
        value = parseInt(value);
        if (Number.isInteger(value) && parseInt(value) > 0) {
          return true;
        } else {
          return 'Please enter a positive whole number.';
        }
      }
    }
]).then(function (answers) {
    checkQuantity(answers);
  });
};

let checkQuantity = function(answers) {
  connection.query(queryCheck, {prod_Id: answers.purchase}, function (err, results) {
    if (err) throw err;
    if (parseInt(answers.quantity) > results[0].quantity) {
      console.log(chalk.bold.red('\nInsufficient quantity available.\n'));
      connection.end();
    } else {
      updateSales();
    }
  });
};

let updateSales = function() {

};
