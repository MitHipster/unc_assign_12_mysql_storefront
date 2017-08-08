select * from products;
select * from departments;

select products.prod_name, departments.dept_name, products.price, products.cost, products.quantity, products.sales, products.cogs
from products
inner join departments on products.dept_id = departments.dept_id;
