/*********************************************************************************
*		WEB322	– Assignment 03
*		I	declare	that	this	assignment	is	my	own	work	in	accordance	with	Seneca		Academic	Policy.		No	part	
*		of	this	assignment	has	been	copied	manually	or	electronically	from	any	other	source	
*		(including	3rd	party	web	sites)	or	distributed	to	other	students.
*	
*		Name:	Fernando Henrique Zavalloni Proto	Student	ID:	128133154	Date:	07/Jun/17
*
*		Online	(Heroku)	Link:	https://blooming-brushlands-58927.herokuapp.com/
*
********************************************************************************/
var dataService = require("./data-service.js");
var express = require("express");
var app = express();
var path = require("path");

var HTTP_PORT = process.env.PORT || 8081;

function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname + "/views/home.html"));
})

app.get("/about", function (req, res) {
    res.sendFile(path.join(__dirname + "/views/about.html"));
})


app.get("/employees", (req, res) => {
    if (req.query.status) {
        dataService.getEmployeesByStatus(req.query.status).then((employeesByStatus) => {
            res.json(employeesByStatus);
        }).catch((errorMessage) => {
            res.json({ message: errorMessage });
        });;
    } else if (req.query.manager) {
        dataService.getEmployeesByManager(req.query.manager).then((employeesByManager) => {
            res.json(employeesByManager);
        }).catch((errorMessage) => {
            res.json({ message: errorMessage });
        });;
    } else if (req.query.department) {
        dataService.getEmployeesByDepartment(req.query.department).then((employeesByDepartment) => {
            res.json(employeesByDepartment);
        }).catch((errorMessage) => {
            res.json({ message: errorMessage });
        });;
    } else {
        dataService.getAllEmployees().then((employees) => {
            res.json(employees);
        }).catch((errorMessage) => {
            res.json({ message: errorMessage });
        });
    }
});

app.get("/employee/:empNum", (req, res) => {
    dataService.getEmployeeByNum(req.params.empNum).then((employee) => {
        res.json(employee);
    }).catch((errorMessage) => {
        res.json({ message: errorMessage });
    });
});

app.get("/managers", (req, res) => {
    dataService.getManagers().then((managers) => {
        res.json(managers);
    }).catch((errorMessage) => {
        res.json({ message: errorMessage });
    });
});

app.get("/departments", (req, res) => {
    dataService.getDepartments().then((departments) => {
        res.json(departments);
    }).catch((errorMessage) => {
        res.json({ message: errorMessage });
    });
});


app.use((req, res) => {
    res.status(404).send("Page Not Found");
});


dataService.initialize().then(() => {
    app.listen(HTTP_PORT, onHttpStart);
}).catch((err) => {
    console.log("error: " + err);
});

