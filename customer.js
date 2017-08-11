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

const query = {
  // Query to show all products
  showProducts: "SELECT prod_id AS Id, prod_name AS Product, CONCAT('$', FORMAT(price, 2)) AS Price FROM products",
  // Query to return inventory on item to be purchased
  checkQuantity: "SELECT quantity FROM products WHERE prod_id = ?",
  // Query to update products table for sale
  updateSales: "UPDATE products SET sales = sales + (price * ?), cogs = cogs + (cost * ?), quantity = quantity - ? WHERE prod_id = ?",
  // Query to get the total purchase price
  totalPurchase: "SELECT CONCAT('$', FORMAT(price * ?, 2)) AS total FROM products WHERE prod_id = ?"
};
// Field names for products table
let products = [
  ['ID', 'Product', 'Price']
];
// Store array of product IDs to validate user selection
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
  showProducts();
});

let showProducts = function () {
  connection.query(query.showProducts, function (err, results) {
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
        if (parseInt(value) > 0) {
          return true;
        } else {
          return 'Please enter a positive, whole number.';
        }
      }
    }
  ]).then(function (answers) {
    inquirer.prompt({
      type: 'confirm',
      name: 'validate',
      message: 'Process the above request?',
      default: true
    }).then(function (answer) {
      if (answer.validate) {
        // Convert validated inouts to integers
        answers.purchase = parseInt(answers.purchase);
        answers.quantity = parseInt(answers.quantity);
        checkQuantity(answers);
      } else {
        console.log(chalk.bold.red('\nTransaction has been cancelled.\n'));
        connection.end();
      }
    });
  });
};

let checkQuantity = function(a) {
  connection.query(query.checkQuantity, [a.purchase], function (err, results) {
    if (err) throw err;
    if (a.quantity > results[0].quantity) {
      console.log(chalk.bold.red('\nInsufficient quantity available.\n'));
      connection.end();
    } else {
      updateSales(a);
    }
  });
};

let updateSales = function(a) {
  let amt = a.quantity;
  let values = [amt, amt, amt, a.purchase];
  connection.query(query.updateSales, values, function (err, results) {
    if (err) throw err;
    totalPurchase(a);
  });
};

let totalPurchase = function (a) {
  let values = [a.quantity, a.purchase];
  connection.query(query.totalPurchase, values, function (err, results) {
    if (err) throw err;
    console.log(chalk.bold.cyan('\nYour total is ' + results[0].total + '. Thank you for your purchase.\n'));
    connection.end();
  });
};
