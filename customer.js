/*jslint esversion: 6, browser: true*/
let inquirer = require('inquirer');
let mysql = require('mysql');
let table = require('table');
let chalk = require('chalk');
let questions = {
  buyWhat: 'What item would you like to purchase? Enter product ID.',
  howMany: 'How many would you like to buy?'
};

inquirer.prompt();
