/*jslint esversion: 6, browser: true*/
const inquirer = require('inquirer');
const mysql = require('mysql');
const table = require('table').table;
const chalk = require('chalk');
const border = require('./border.js');
// inquirer prompt messages
const messages = {
  lowItem: 'Which item would you like to restock? Enter product ID.',
  lowAmount: 'Add how many items to current stock?',
  addItem: 'What is the name of the item you would like to add?',
  addDept: 'In which department does the item belong? Enter ID from table above.',
  addPrice: 'What is the retail price of that item?',
  addCost: 'What is the cost of that item?',
  addAmount: 'Set initial stock to how many items?'
};

const query = {
  // Query to show all products
  viewProducts: "SELECT products.prod_id AS ID, products.prod_name AS Product, departments.dept_name AS Department, CONCAT('$', FORMAT(products.price, 2)) AS Price, products.quantity AS Quantity FROM products INNER JOIN departments ON products.dept_id = departments.dept_id ORDER BY departments.dept_id, products.prod_id",
  // Query to show low inventory items
  lowInventory: "SELECT products.prod_id AS ID, products.prod_name AS Product, departments.dept_name AS Department, CONCAT('$', FORMAT(products.price, 2)) AS Price, products.quantity AS Quantity FROM products INNER JOIN departments ON products.dept_id = departments.dept_id WHERE quantity <= 5 ORDER BY quantity ASC, price ASC;",
  // Query to add inventory to a selected item
  addInventory: "UPDATE products SET quantity = quantity + ? WHERE prod_id = ?",
  // Query to show available departments
  viewDepartments: "SELECT dept_id AS ID, dept_name AS Department FROM departments",
  // Query to add a new product
  addProduct: "INSERT INTO products (prod_name, dept_id, price, cost, quantity) VALUES (?, ?, ?, ?, ?);"
};

// Store array of IDs to validate user selection
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
});

// Function to display menu options and return selection
let prompts = function () {
  inquirer.prompt({
    type: 'list',
    name: 'options',
    message: 'Select menu item or enter item number.',
    choices: [
      '1. View Products for Sale',
      '2. View Low Inventory',
      '3. Add to Inventory',
      '4. Add New Product',
      '5. Quit'
    ]
  }).then(function (answer) {
    let option = parseInt(answer.options.charAt(0));
    // Field names for products and departments tables
    let prodFields = [ ['ID', 'Product', 'Department', 'Price', 'Quantity'] ];
    let departFields = [ ['ID', 'Department'] ];
    switch (option) {
      // Call functions based on user selection by passing query, field names in array, and callback function
      case 1:
        tableDisplay(query.viewProducts, prodFields, prompts);
        break;
      case 2:
        tableDisplay(query.lowInventory, prodFields, prompts);
        break;
      case 3:
        tableDisplay(query.viewProducts, prodFields, function () {
          addInventory(query.addInventory);
        });
        break;
      case 4:
        tableDisplay(query.viewDepartments, departFields, function () {
          addProduct(query.addProduct);
        });
        break;
      default:
        connection.end();
        return false;
    }
  });
};

// Function for displaying table data
let tableDisplay = function (view, fields, callback) {
  connection.query(view, function (err, results) {
    if (err) throw err;
    // Call tableData to create table array
    let records = tableData(fields, results);
    // Use table node to create a formatted table
    let output = table(records, border.config);
    console.log(output);
    if (callback) callback();
  });
};

// Function for compiling table data
let tableData = function (data, results) {
  // Store array of IDs to validate manager selection
  ids = [];
  // Loop through elements in the array
  results.forEach(function (result, i) {
    // Push to data an empty array
    data.push([]);
    // Loop through each key in the element
    for (let key in result) {
      // Populate IDs array for validating ID selection
      if (key === 'ID') ids.push(result[key]);
      // Start pushing at index 1 as index 0 contains field names
      // Push key values into empty array
      data[i + 1].push(result[key]);
    }
  });
  return data;
};

// Function to display prompts for adding inventory
let addInventory = function (view) {
  inquirer.prompt([
    {
      type: 'input',
      name: 'item',
      message: messages.lowItem,
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
      message: messages.lowAmount,
      // Validate inventory amount
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
      message: 'Process the above information?',
      default: true
    }).then(function (answer) {
      // If 'yes', process request
      if (answer.validate) {
        // Convert validated inouts to integers
        let item = parseInt(answers.item);
        let amt = parseInt(answers.quantity);
        // Pass query with quantity and product Id as parameter
        connection.query(view, [amt, item], function (err, results) {
          if (err) throw err;
          console.log(chalk.bold.cyan('\nUpdate successful.\n'));
          prompts();
        });
      } else {
        // If 'no', cancel request
        console.log(chalk.bold.red('\nProcess has been cancelled.\n'));
        prompts();
      }
    });
  });
};

// Function to add a new product
let addProduct = function (view) {
  inquirer.prompt([
    {
      type: 'input',
      name: 'item',
      message: messages.addItem,
      // Validate that a product name was entered
      validate: function (value) {
        if (value.length > 0) {
          return true;
        } else {
          return 'Please enter product name.';
        }
      }
    },
    {
      type: 'input',
      name: 'department',
      message: messages.addDept,
      // Validate department ID
      validate: function (value) {
        value = parseInt(value);
        if (ids.indexOf(value) !== -1) {
          return true;
        } else {
          return 'Please enter a valid department ID.';
        }
      }
    },
    {
      type: 'input',
      name: 'price',
      message: messages.addPrice,
      // Validate retail price
      validate: function (value) {
        if (parseFloat(value) > 0) {
          return true;
        } else {
          return 'Please enter a positive number for the price.';
        }
      }
    },
    {
      type: 'input',
      name: 'cost',
      message: messages.addCost,
      // Validate wholesale cost
      validate: function (value) {
        if (parseFloat(value) > 0) {
          return true;
        } else {
          return 'Please enter a positive number for the cost.';
        }
      }
    },
    {
      type: 'input',
      name: 'quantity',
      message: messages.addAmount,
      // Validate inventory amount
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
      message: 'Process the above information?',
      default: true
    }).then(function (answer) {
      // If 'yes', process request
      if (answer.validate) {
        let name = answers.item.trim();
        let dept = parseInt(answers.department);
        let price = parseFloat(answers.price);
        let cost = parseFloat(answers.cost);
        let amt = parseInt(answers.quantity);
        // Pass query with product name, department ID, retail price, wholesale cost, and quantity as parameters
        connection.query(view, [name, dept, price, cost, amt], function (err, results) {
          if (err) throw err;
          console.log(chalk.bold.cyan('\nAddition successful.\n'));
          prompts();
        });
      } else {
        // If 'no', cancel request
        console.log(chalk.bold.red('\nProcess has been cancelled.\n'));
        prompts();
      }
    });
  });
};

prompts();
