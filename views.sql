SELECT * FROM products;
SELECT * FROM departments;

SELECT products.prod_name, departments.dept_name, products.price, products.cost, products.quantity, products.sales, products.cogs
FROM products
INNER JOIN departments ON products.dept_id = departments.dept_id;

SELECT prod_id AS Id, prod_name AS Product, concat('$', format(price, 2)) AS Price FROM products;

SELECT quantity FROM products WHERE prod_id = 5;
