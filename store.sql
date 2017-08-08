drop database if exists storeDB;
create database storeDB;

use storeDB;

create table departments (
  dept_id smallint auto_increment not null,
  dept_name varchar(50) not null,
  overhead decimal(8,2) not null,
  primary key (dept_id)
);

create table products (
  prod_id integer auto_increment not null,
  prod_name varchar(50) not null,
  dept_id smallint(10) not null,
  price decimal(5,2) not null,
  cost decimal(5,2) not null,
  quantity integer not null,
  sales decimal(8,2) default 0,
  cogs decimal(8,2) default 0,
  primary key (prod_id),
  foreign key (dept_id) references departments(dept_id)
);
