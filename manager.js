/*jslint esversion: 6, browser: true*/
const inquirer = require('inquirer');
const mysql = require('mysql');
const table = require('table').table;
const border = require('./border.js');

const query = {
  // Query to show all products
  viewProducts: "SELECT prod_id AS Id, prod_name AS Product, CONCAT('$', FORMAT(price, 2)) AS Price, quantity AS Quantity FROM products",
  // Query to show low inventory items
  lowInventory: "SELECT prod_id AS Id, prod_name AS Product, CONCAT('$', FORMAT(price, 2)) AS Price, quantity AS Quantity FROM products WHERE quantity <= 5 ORDER BY quantity ASC, price ASC",
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
    let a = parseInt(answer.options.charAt(0));
    switch (a) {
      case 1:
        products(query.viewProducts);
        break;
      case 2:
        products(query.lowInventory);
        break;
      case 3:
        addInventory();
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

let products = function (view) {
  connection.query(view, function (err, results) {
    if (err) throw err;
    // Field names for products table
    let fieldNames = [ ['ID', 'Product', 'Price', 'quantity'] ];
    // Loop through elements in the array
    let products = tableData(fieldNames, results);
    let output = table(products, border.config);
    console.log(output);
    prompts();
  });
};

let tableData = function (data, results) {
  // Loop through elements in the array
  results.forEach(function (result, i) {
    // Push to data an empty array
    data.push([]);
    // Loop through each key in the element
    for (let key in result) {
      // Start pushing at index 1 as index 0 contains field names
      // Push key's value into empty array
      data[i + 1].push(result[key]);
    }
  });
  return data;
};

prompts();
