/*********************************************************************************
*		WEB322	– Assignment 05
*		I	declare	that	this	assignment	is	my	own	work	in	accordance	with	Seneca		Academic	Policy.		No	part	
*		of	this	assignment	has	been	copied	manually	or	electronically	from	any	other	source	
*		(including	3rd	party	web	sites)	or	distributed	to	other	students.
*	
*		Name:	Fernando Henrique Zavalloni Proto	Student	ID:	128133154	Date:	07/Jul/17
*
*		Online	(Heroku)	Link:	https://blooming-brushlands-58927.herokuapp.com/
*
********************************************************************************/
const dataService = require("./data-service.js");
const express = require("express");
const app = express();
const path = require("path");
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');

var HTTP_PORT = process.env.PORT || 8081;

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));

app.engine(".hbs", exphbs({
    extname: ".hbs",
    defaultLayout: 'layout',
    helpers: {
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));
app.set("view engine", ".hbs");

function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.get("/", function (req, res) {
    res.render("home");
})

app.get("/about", function (req, res) {
    res.render("about");
})


app.get("/employees", (req, res) => {
    if (req.query.status) {
        dataService.getEmployeesByStatus(req.query.status).then((data) => {
            res.render("employeeList", { data: data, title: "Employees" });
        }).catch((errorMessage) => {
            res.render("employeeList", { data: {}, title: "Employees" })
        });;
    } else if (req.query.manager) {
        dataService.getEmployeesByManager(req.query.manager).then((data) => {
            res.render("employeeList", { data: data, title: "Employees" });
        }).catch((errorMessage) => {
            res.render("employeeList", { data: {}, title: "Employees" })
        });;
    } else if (req.query.department) {
        dataService.getEmployeesByDepartment(req.query.department).then((data) => {
            res.render("employeeList", { data: data, title: "Employees" });
        }).catch((errorMessage) => {
            res.render("employeeList", { data: {}, title: "Employees" })
        });;
    } else {
        dataService.getAllEmployees().then((data) => {
            res.render("employeeList", { data: data, title: "Employees" });
        }).catch((errorMessage) => {
            res.render("employeeList", { data: {}, title: "Employees" })
        });
    }
});

app.get("/employee/:empNum", (req, res) => {

    // initialize an empty object to store the values
    let viewData = {};
    dataService.getEmployeeByNum(req.params.empNum)
        .then((data) => {
            viewData.data = data; //store employee data in the "viewData" object as "data"
        }).catch(() => {
            viewData.data = null; // set employee to null if there was an error
        }).then(dataService.getDepartments)
        .then((data) => {
            viewData.departments = data; // store department data in the "viewData" object as "departments" 
            // loop through viewData.departments and once we have found the departmentId that matches       
            // the employee's "department" value, add a "selected" property to the matching        
            // viewData.departments object 

            for (let i = 0; i < viewData.departments.length; i++) {
                if (viewData.departments[i].departmentId == viewData.data.department) {
                    viewData.departments[i].selected = true;
                }
            }
        }).catch(() => {
            viewData.departments = []; // set departments to empty if there was an error 
        }).then(() => {
            if (viewData.data == null) { // if no employee - return an error
                res.status(404).send("Employee Not Found");
            } else {
                res.render("employee", { viewData: viewData }); // render the "employee" view       
            }
        });
});

app.get("/employees/add", (req, res) => {
    dataService.getDepartments().then((data) => {
        res.render("addEmployee", { departments: data });
    }).catch((errorMessage) => {
        res.render("addEmployee", { departments: [] });
    });
});


app.post("/employees/add", (req, res) => {
    console.log(req.body);
    dataService.addEmployee(req.body).then(() => {
        res.redirect("/employees");
    });
});


app.get("/employee/delete/:empNum", (req, res) => {
    dataService.deleteEmployeeByNum(req.params.empNum).then(() => {
        res.redirect("/employees");
    }).catch((errorMessage) => {
        res.status(500).send("Unable to Remove Employee / Employee not found");
    });
});


app.post("/employee/update", (req, res) => {
    console.log(req.body);
    dataService.updateEmployee(req.body).then(() => {
        res.redirect("/employees");
    });
});

app.post("/department/update", (req, res) => {
    console.log(req.body);
    dataService.updateDepartment(req.body).then(() => {
        res.redirect("/departments");
    });
});

app.get("/managers", (req, res) => {
    dataService.getManagers().then((data) => {
        res.render("employeeList", { data: data, title: "Employees (Managers)" });
    }).catch((errorMessage) => {
        res.render("employeeList", { data: {}, title: "Employees (Managers)" });
    });
});

app.get("/departments", (req, res) => {
    dataService.getDepartments().then((data) => {
        res.render("departmentList", { data: data, title: "Departments" });
    }).catch((errorMessage) => {
        res.render("departmentList", { data: {}, title: "Departments" });
    });
});

app.get("/departments/add", (req, res) => {
    res.render("addDepartment");
});

app.post("/departments/add", (req, res) => {
    console.log(req.body);
    dataService.addDepartment(req.body).then(() => {
        res.redirect("/departments");
    });
});


app.get("/department/:departmentId", (req, res) => {
    dataService.getDepartmentById(req.params.departmentId).then((data) => {
        res.render("department", { data: data });
    }).catch((errorMessage) => {
        res.status(404).send("Department Not Found");
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

