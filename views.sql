SELECT * FROM products;
SELECT * FROM departments;

SELECT products.prod_name, departments.dept_name, products.price, products.cost, products.quantity, products.sales, products.cogs
FROM products
INNER JOIN departments ON products.dept_id = departments.dept_id;

-- SELECT prod_id AS ID, prod_name AS Product, CONCAT('$', FORMAT(price, 2)) AS Price FROM products;

SELECT products.prod_id AS ID, products.prod_name AS Product, departments.dept_name AS Department,CONCAT('$', FORMAT(products.price, 2)) AS Price FROM products INNER JOIN departments ON products.dept_id = departments.dept_id ORDER BY departments.dept_id, products.prod_id;

SELECT quantity FROM products WHERE prod_id = 5;

UPDATE products SET sales = sales + (price * 3), cogs = cogs + (cost * 3), quantity = quantity - 3 WHERE prod_id = 7;

SELECT CONCAT('$', FORMAT(price * 2, 2)) AS total FROM products WHERE prod_id = 4;

SELECT prod_id AS ID, prod_name AS Product, CONCAT('$', FORMAT(price, 2)) AS Price, quantity AS Quantity FROM products;

SELECT prod_id AS ID, prod_name AS Product, CONCAT('$', FORMAT(price, 2)) AS Price, quantity AS Quantity FROM products WHERE quantity <= 5 ORDER BY quantity ASC, price ASC;

UPDATE products SET quantity = quantity + 1 WHERE prod_id = 3;

INSERT INTO products (prod_name, dept_id, price, cost, quantity) VALUES ("Samsung Galaxy S8", 1, 749.99, 385.25, 4);

SELECT departments.dept_name AS Department, CONCAT('$', FORMAT(SUM(products.sales), 2)) AS Sales, CONCAT('$', FORMAT(SUM(products.cogs), 2)) AS COGS, CONCAT('$', FORMAT(departments.overhead, 2)) AS Overhead, CONCAT('$', FORMAT(SUM(products.sales) - SUM(products.cogs) - departments.overhead, 2)) AS Profit FROM products INNER JOIN departments ON products.dept_id = departments.dept_id GROUP BY departments.dept_name, departments.overhead ORDER BY SUM(products.sales) - SUM(products.cogs) - departments.overhead DESC;
