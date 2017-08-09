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
const queryStr = "SELECT prod_id as Id, prod_name as Product, concat('$', format(price, 2)) as Price FROM products";
let output;
let products = [
  ['ID', 'Product', 'Price']
];

let connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'storeDB'
});

connection.connect(function (err) {
  if (err) throw err;
  console.log('Connected as ID ' + connection.threadId);
  runQuery();
});

let runQuery = function () {
  connection.query(queryStr, function (err, results) {
    if (err) throw err;
    // Loop through elements in the array
    results.forEach(function (result, i) {
      // Push to products an empty array
      products.push([]);
      // Loop through each key in the element
      for (let key in result) {
        // Start pushing at index 1 as index 0 contains field names
        // Push key's value into empty array
        products[i + 1].push(result[key]);
      }
    });
    output = table(products, border.config);
    console.log(output);
  });
};

let prompt = function () {
  inquirer.prompt({
    type: 'input',
    name: 'purchase',
    message: messages.buyWhat
  }).then(function (answer) {

  });
};
