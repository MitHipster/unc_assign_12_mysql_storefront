/*jslint esversion: 6, browser: true*/
const inquirer = require('inquirer');
const mysql = require('mysql');
const table = require('table').table;
const chalk = require('chalk');
const border = require('./border.js');
const messages = {
  addDept: 'What is the name of the department you would like to add?',
  addCost: 'What are the overhead costs for this department?'
};

const query = {
  // Query to show sales and profits by department
  viewProfits: "SELECT departments.dept_name AS Department, CONCAT('$', FORMAT(SUM(products.sales), 2)) AS Sales, CONCAT('$', FORMAT(SUM(products.cogs), 2)) AS COGS, CONCAT('$', FORMAT(departments.overhead, 2)) AS Overhead, CONCAT('$', FORMAT(SUM(products.sales) - SUM(products.cogs) - departments.overhead, 2)) AS Profit FROM products INNER JOIN departments ON products.dept_id = departments.dept_id GROUP BY departments.dept_name, departments.overhead ORDER BY SUM(products.sales) - SUM(products.cogs) - departments.overhead DESC",
  viewDept: "SELECT dept_id AS ID, dept_name AS Department, CONCAT('$', FORMAT(overhead, 2)) AS Overhead FROM departments",
  addDept: "INSERT INTO departments (dept_name, overhead) VALUES (?, ?)"
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
    message: 'Select menu item or enter item number.',
    choices: [
      '1. View Product Sales by Department',
      '2. Add New Department',
      '3. Quit'
    ]
  }).then(function (answer) {
    let option = parseInt(answer.options.charAt(0));
    // Field names for profits and departments tables
    let profitFields = [ ['Department', 'Sales', 'COGS', 'Overhead', 'Profit'] ];
    let departFields = [ ['ID', 'Department', 'Overhead'] ];
    switch (option) {
      case 1:
        tableDisplay(query.viewProfits, profitFields, prompts);
        break;
      case 2:
        tableDisplay(query.viewDept, departFields, function () {
          addDepartment(query.addDept);
        });
        break;
      default:
        connection.end();
        return false;
    }
  });
};

let tableDisplay = function (view, fields, callback) {
  connection.query(view, function (err, results) {
    if (err) throw err;
    // Call tableData to create table array
    let records = tableData(fields, results);
    let output = table(records, border.config);
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
      // Start pushing at index 1 as index 0 contains field names
      // Push key's value into empty array
      data[i + 1].push(result[key]);
    }
  });
  return data;
};

let addDepartment = function (view) {
  inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: messages.addDept,
      validate: function (value) {
        if (value.length > 0) {
          return true;
        } else {
          return 'Please enter department name.';
        }
      }
    },
    {
      type: 'input',
      name: 'cost',
      message: messages.addCost,
      validate: function (value) {
        if (parseFloat(value) > 0) {
          return true;
        } else {
          return 'Please enter a positive number for overhead cost.';
        }
      }
    }
  ]).then(function (answers) {
    inquirer.prompt({
      type: 'confirm',
      name: 'validate',
      message: 'Process the above information?',
      default: true
    }).then(function (answer) {
      if (answer.validate) {
        let name = answers.name.trim();
        let cost = parseFloat(answers.cost);
        connection.query(view, [name, cost], function (err, results) {
          if (err) throw err;
          console.log(chalk.bold.cyan('\nAddition successful.\n'));
          prompts();
        });
      } else {
        console.log(chalk.bold.red('\nProcess has been cancelled.\n'));
        prompts();
      }
    });
  });
};

prompts();
