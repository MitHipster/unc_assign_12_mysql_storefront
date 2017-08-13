/*jslint esversion: 6, browser: true*/
const inquirer = require('inquirer');
const mysql = require('mysql');
const table = require('table').table;
const chalk = require('chalk');
const border = require('./border.js');
// inquirer prompt messages
const messages = {
  buyWhat: 'What item would you like to purchase? Enter product ID.',
  howMany: 'How many would you like to buy?'
};

const query = {
  // Query to show all products
  showProducts: "SELECT products.prod_id AS ID, products.prod_name AS Product, departments.dept_name AS Department, CONCAT('$', FORMAT(products.price, 2)) AS Price FROM products INNER JOIN departments ON products.dept_id = departments.dept_id ORDER BY departments.dept_id, products.prod_id",
  // Query to return inventory on item to be purchased
  checkQuantity: "SELECT quantity FROM products WHERE prod_id = ?",
  // Query to update products table for sale
  updateSales: "UPDATE products SET sales = sales + (price * ?), cogs = cogs + (cost * ?), quantity = quantity - ? WHERE prod_id = ?",
  // Query to get the total purchase price
  totalPurchase: "SELECT CONCAT('$', FORMAT(price * ?, 2)) AS total FROM products WHERE prod_id = ?"
};

// Store array of product IDs to validate user selection
let ids = [];

// Define connection parameters form MySQL server
let connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'storeDB'
});

// Establish connection to MySQL server
connection.connect(function (err) {
  if (err) throw err;
  showProducts();
});

// Function for compiling products table data
let showProducts = function () {
  // Field names for products table
  let products = [ ['ID', 'Product', 'Department', 'Price'] ];
  // Store array of IDs to validate user selection
  ids = [];
  connection.query(query.showProducts, function (err, results) {
    if (err) throw err;
    // Loop through elements in the array
    results.forEach(function (result, i) {
      // Push to products an empty array
      products.push([]);
      // Loop through each key in the element
      for (let key in result) {
        // Populate IDs array for validating ID selection
        if (key === 'ID') ids.push(result[key]);
        // Start pushing at index 1 as index 0 contains field names
        // Push key values into empty array
        products[i + 1].push(result[key]);
      }
    });
    // Use table node to create a formatted table
    let output = table(products, border.config);
    console.log(output);
    // Return to menu options
    prompts();
  });
};

// Function to display prompts and store answers
let prompts = function () {
  inquirer.prompt([
    {
      type: 'input',
      name: 'purchase',
      message: messages.buyWhat,
      // Validate entered product Id
      validate: function (value) {
        value = parseInt(value);
        if (ids.indexOf(value) !== -1) {
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
      // Validate purchase quantity
      validate: function (value) {
        if (parseInt(value) > 0) {
          return true;
        } else {
          return 'Please enter a positive, whole number.';
        }
      }
    }
  ]).then(function (answers) {
    // Confirm answers before processing
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
        // Call checkQuantity to verify stock
        checkQuantity(answers);
      } else {
        // Cancel transaction is user replies 'no'
        console.log(chalk.bold.red('\nTransaction has been cancelled.\n'));
        connection.end();
      }
    });
  });
};

// Function to check on an item's inventory level
let checkQuantity = function(a) {
  // Pass query with product Id as parameter
  connection.query(query.checkQuantity, [a.purchase], function (err, results) {
    if (err) throw err;
    // If purchase quantity exceeds inventory return message and cancel purchase
    if (a.quantity > results[0].quantity) {
      console.log(chalk.bold.red('\nInsufficient quantity available.\n'));
      connection.end();
    } else {
      // Call updateSales to process sale
      updateSales(a);
    }
  });
};

// Function to update products table with with user purchase
let updateSales = function(a) {
  let amt = a.quantity;
  let values = [amt, amt, amt, a.purchase];
  // Pass query with purchase quantity and product Id as parameters
  // Update sales, COGS, and quantity
  connection.query(query.updateSales, values, function (err, results) {
    if (err) throw err;
    // Call totalPurchase to display confirmation
    totalPurchase(a);
  });
};

// Function to display confirmation message with purchase total
let totalPurchase = function (a) {
  let values = [a.quantity, a.purchase];
  // Pass query with purchase quantity and product Id as parameters
  connection.query(query.totalPurchase, values, function (err, results) {
    if (err) throw err;
    console.log(chalk.bold.cyan('\nYour total is ' + results[0].total + '. Thank you for your purchase.\n'));
    connection.end();
  });
};
