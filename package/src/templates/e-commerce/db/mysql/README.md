# MySQL Database Template for E-Commerce

This is a placeholder for the MySQL database configuration for E-commerce projects.

## Features

- Open-source relational database management system
- ACID-compliant transactions
- Support for stored procedures and triggers
- Comprehensive SQL implementation

## Schema

The E-commerce database includes the following tables:

- **Users**: Customer information and authentication
- **Products**: Product catalog information
- **Categories**: Product categories and hierarchy
- **Orders**: Order information and status
- **OrderItems**: Individual items in each order
- **Carts**: Shopping cart information
- **CartItems**: Items in shopping carts
- **Payments**: Payment processing information

## Getting Started

```bash
# Start MySQL service
sudo service mysql start

# Create a new database
mysql -u root -p -e "CREATE DATABASE ecommerce;"

# Create a new user and grant privileges
mysql -u root -p -e "CREATE USER 'ecomuser'@'localhost' IDENTIFIED BY 'password';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON ecommerce.* TO 'ecomuser'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"
```

## Connection String

```
DATABASE_URL=mysql://ecomuser:password@localhost:3306/ecommerce
```
