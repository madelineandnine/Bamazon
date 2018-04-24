var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    start();
});

function start() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.log("Welcome to Bamazon! Here's what's for sale: ")
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].item_id + " | " + res[i].product_name + " | " + res[i].price)
        }
    });
    purchase();
}

var purchase = function () {
    connection.query("SELECT * FROM products", function (err, res) {
        inquirer.prompt({
            name: "productId",
            type: "userInput",
            message: "What is the ID number of the product that you would like to buy (enter a number from 1 to 9)"
        }).then(function (answer) {
            var idnumber = answer.productId;
            product(idnumber);
        })
    });
};

var product = function (idnumber) {
    var stockIndex = idnumber;
    console.log("Selected Item ID: " + stockIndex);
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        inquirer.prompt({
            name: "stock",
            type: "userInput",
            message: "How many units of the product would you like to buy?"
        }).then(function (answer) {
            if (answer.stock == 0) {
                console.log("Please input a quantity greater than 0. Returning to store front..");

                setTimeout(function () {
                    start();
                }, 2000);
            } else if (answer.stock < res[stockIndex - 1].stock_quantity) {
                var updatedStock = res[stockIndex - 1].stock_quantity - answer.stock;
                console.log("You're allowed to buy that many!");

                connection.query("UPDATE products SET ? WHERE ?", [{
                        stock_quantity: updatedStock
                    },
                    {
                        item_id: stockIndex
                    }
                ]);

                console.log("Total Cost of Purchase: " + (res[stockIndex - 1].price) * answer.stock);
                console.log("Cost: " + (res[stockIndex - 1].price) * answer.stock);
                connection.end();
            } else {
                console.log("Insufficient quantity!");
                start();
            }
        })
    })
}

