SELECT * FROM products;
SELECT * FROM departments;

SELECT products.prod_name, departments.dept_name, products.price, products.cost, products.quantity, products.sales, products.cogs
FROM products
INNER JOIN departments ON products.dept_id = departments.dept_id;

SELECT prod_id AS Id, prod_name AS Product, CONCAT('$', FORMAT(price, 2)) AS Price FROM products;

SELECT quantity FROM products WHERE prod_id = 5;

UPDATE products SET sales = sales + (price * 3), cogs = cogs + (cost * 3), quantity = quantity - 3 WHERE prod_id = 7;

SELECT CONCAT('$', FORMAT(price * 2, 2)) AS total FROM products WHERE prod_id = 4;

SELECT prod_id AS Id, prod_name AS Product, CONCAT('$', FORMAT(price, 2)) AS Price, quantity AS Quantity FROM products;

SELECT prod_id AS Id, prod_name AS Product, CONCAT('$', FORMAT(price, 2)) AS Price, quantity AS Quantity FROM products WHERE quantity <= 5 ORDER BY quantity ASC, price ASC;

UPDATE products SET quantity = quantity + 1 WHERE prod_id = 3;

INSERT INTO products (prod_name, dept_id, price, cost, quantity) VALUES ("Samsung Galaxy S8", 1, 749.99, 385.25, 4);
