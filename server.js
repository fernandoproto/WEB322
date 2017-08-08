/*********************************************************************************
*		WEB322	– Assignment 08
*		I	declare	that	this	assignment	is	my	own	work	in	accordance	with	Seneca		Academic	Policy.		No	part	
*		of	this	assignment	has	been	copied	manually	or	electronically	from	any	other	source	
*		(including	3rd	party	web	sites)	or	distributed	to	other	students.
*	
*		Name:	Fernando Henrique Zavalloni Proto	Student	ID:	128133154	Date:	11/Ago/17
*
*		Online	(Heroku)	Link:	https://blooming-brushlands-58927.herokuapp.com/
*
********************************************************************************/



const dataServiceComments = require("./data-service-comments.js");
const dataService = require("./data-service.js");
const express = require('express');
const app = express();
const path = require("path");
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const clientSessions = require('client-sessions');  
const dataServiceAuth = require('./data-service-auth.js');

var HTTP_PORT = process.env.PORT || 8081;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(clientSessions({
  cookieName: "session", // this is the object name that will be added to 'req'
  secret: "assignment7web322secret", // this should be a long un-guessable string.
  duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
  activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}))

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
};

app.use(function(req, res, next) {   
    res.locals.session = req.session;   
    next(); 
}); 


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
        },
        counter: function (index){
            return index+1;
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
    console.log(req.body);
    dataServiceComments.getAllComments().then((dataFromPromise) => {
        console.log(dataFromPromise);
        res.render("about", { data: dataFromPromise });
    }).catch((err) => {
        if (err) {
            console.log(err);
            res.render("about");
        }
    });
});

app.post("/about/addComment", (req, res) => {
    console.log(req.body);
    dataServiceComments.addComment(req.body).then(() => {
        res.redirect("/about");
    }).catch((err) => {
        if (err) {
            console.log(err);
            res.redirect("/about");
        }
    });
});

app.post("/about/addReply", (req, res) => {
    console.log(req.body);
    dataServiceComments.addReply(req.body).then(() => {
        console.log(req.body);
        res.redirect("/about");
    }).catch((err) => {
        if (err) {
            console.log(err);
            res.redirect("/about");
        }
    });
});


app.get("/employees", ensureLogin, (req, res) => {
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

app.get("/employee/:empNum", ensureLogin, (req, res) => {

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

app.get("/employees/add", ensureLogin, (req, res) => {
    dataService.getDepartments().then((data) => {
        res.render("addEmployee", { departments: data });
    }).catch((errorMessage) => {
        res.render("addEmployee", { departments: [] });
    });
});


app.post("/employees/add", ensureLogin, (req, res) => {
    console.log(req.body);
    dataService.addEmployee(req.body).then(() => {
        res.redirect("/employees");
    });
});


app.get("/employee/delete/:empNum", ensureLogin,(req, res) => {
    dataService.deleteEmployeeByNum(req.params.empNum).then(() => {
        res.redirect("/employees");
    }).catch((errorMessage) => {
        res.status(500).send("Unable to Remove Employee / Employee not found");
    });
});


app.post("/employee/update", ensureLogin, (req, res) => {
    console.log(req.body);
    dataService.updateEmployee(req.body).then(() => {
        res.redirect("/employees");
    });
});

app.post("/department/update", ensureLogin, (req, res) => {
    console.log(req.body);
    dataService.updateDepartment(req.body).then(() => {
        res.redirect("/departments");
    });
});

app.get("/managers", ensureLogin, (req, res) => {
    dataService.getManagers().then((data) => {
        res.render("employeeList", { data: data, title: "Employees (Managers)" });
    }).catch((errorMessage) => {
        res.render("employeeList", { data: {}, title: "Employees (Managers)" });
    });
});

app.get("/departments", ensureLogin, (req, res) => {
    dataService.getDepartments().then((data) => {
        res.render("departmentList", { data: data, title: "Departments" });
    }).catch((errorMessage) => {
        res.render("departmentList", { data: {}, title: "Departments" });
    });
});

app.get("/departments/add", ensureLogin, (req, res) => {
    res.render("addDepartment");
});

app.post("/departments/add", ensureLogin, (req, res) => {
    console.log(req.body);
    dataService.addDepartment(req.body).then(() => {
        res.redirect("/departments");
    });
});


app.get("/department/:departmentId", ensureLogin, (req, res) => {
    dataService.getDepartmentById(req.params.departmentId).then((data) => {
        res.render("department", { data: data });
    }).catch((errorMessage) => {
        res.status(404).send("Department Not Found");
    });
});

app.post("/about/addComment", (req, res) => {
    console.log(req.body);
    dataServiceComments.addComment(req.body).then(() => {
        res.redirect("/about");
    }).catch((err) => {
        if (err) {
            console.log(err);
            res.redirect("/about");
        }
    });
});

app.post("/about/addReply", (req, res) => {
    console.log(req.body);
    dataServiceComments.addReply(req.body).then(() => {
        res.redirect("/about");
    }).catch((err) => {
        if (err) {
            console.log(err);
            res.redirect("/about");
        }
    });
});


app.get("/login", (req, res)=>{
    res.render("login");
})

app.get("/register", (req, res) =>{
    res.render("register")
})

app.post("/register", (req, res) =>{
    dataServiceAuth.registerUser(req.body)
    .then(()=>{
        res.render("register", { successMessage:"User Created" })
    }).catch((err) =>{
        res.render("register", {errorMessage: err, user: req.body.user})
    });
})

app.post("/login", (req, res) =>{
    dataServiceAuth.checkUser(req.body)
    .then(() => {
        req.session.user = { username: req.body.user}
        res.redirect("employees");
    }).catch((err)=>{
        res.render("login", {errorMessage: err, user: req.body.user})
    })
})

app.get("/logout", (req, res) =>{
    req.session.reset();
    res.redirect("/");
})

app.post("/api/updatePassword" , (req, res) =>{
    console.log(req.body);
    dataServiceAuth.checkUser({ user: req.body.user, password: req.body.currentPassword })
    .then(() => {
        dataServiceAuth.updatePassword(req.body)
        .then(() => {
            res.json({successMessage: "Password changed successfully for user: " + req.body.user });
        })
        .catch((err)=>{
            res.json({errorMessage: err});
        });
    })
    .catch((err)=>{
         res.json({errorMessage: err});
    })
})


app.use((req, res) => {
    res.status(404).send("Page Not Found");
})

dataService.initialize()
    .then(dataServiceComments.initialize())
    .then(dataServiceAuth.initialize())
    .then(() => {
        app.listen(HTTP_PORT, onHttpStart);
    }).catch((err) => {
        console.log("error: " + err);
    });


/*dataServiceComments.initialize().then(() => { 
    dataServiceComments.addComment({ 
        authorName: "Comment 1 Author", 
        authorEmail: "comment1@mail.com", 
        subject: "Comment 1", 
        commentText: "Comment Text 1" 
    }).then((id) => { 
        dataServiceComments.addReply({ 
            comment_id: id,
            authorName: "Reply 1 Author",
            authorEmail: "reply1@mail.com",
            commentText: "Reply Text 1" 
        }).then(dataServiceComments.getAllComments)
        .then((data) => { 
            console.log("comment: " + data[data.length - 1]); process.exit();
        }); 
    }); 
}).catch((err) => {
    console.log("Error: " + err); 
    process.exit();
});
*/