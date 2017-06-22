const fs = require('fs');
var employees = [];
var departments = [];
var empCount = 0;

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/employees.json', (err, data) => {
            if (err)
                reject(err);
            else
                employees = JSON.parse(data);

            fs.readFile('./data/departments.json', (err, data) => {
                if (err)
                    reject(err);
                else
                    departments = JSON.parse(data);
                if (employees.length == 0 || departments.length == 0)
                    reject("Unable to read file");
                else
                    empCount = employees.length; 
                    resolve();
            });
        });
    });
};


module.exports.getAllEmployees = function () {
    return new Promise((resolve, reject) => { // place our code inside a "Promise" function
        if (employees.length == 0) {
            reject("no results returned");
        } else {
            resolve(employees); // call "resolve" because we have completed the function successfully
        }
    });
}

module.exports.getEmployeesByStatus = function (status) {
    var employeesTemp = [];
    return new Promise((resolve, reject) => {
        for (var i = 0; i < employees.length; i++) {
            if (employees[i].status == status) {
                employeesTemp.push(employees[i])
            }
        }
        if (employeesTemp.length == 0) {
            reject("no results returned");
        } else {
            resolve(employeesTemp); // call "resolve" because we have completed the function successfully
        }
    });
}

module.exports.getEmployeesByDepartment = function (department) {
    var employeesTemp = [];
    return new Promise((resolve, reject) => {
        for (var i = 0; i < employees.length; i++) {
            if (employees[i].department == department) {
                employeesTemp.push(employees[i]);
            }
        }
        if (employeesTemp.length == 0) {
            reject("no results returned");
        } else {
            resolve(employeesTemp); // call "resolve" because we have completed the function successfully
        }
    });
}

module.exports.getEmployeesByManager = function (manager) {
    var employeesTemp = [];
    return new Promise((resolve, reject) => {
        for (var i = 0; i < employees.length; i++) {
            if (employees[i].employeeManagerNum == manager) {
                employeesTemp.push(employees[i]);
            }
        }
        if (employeesTemp.length == 0) {
            reject("no results returned");
        } else {
            resolve(employeesTemp); // call "resolve" because we have completed the function successfully
        }
    });
}

module.exports.getEmployeeByNum = function (num) {
    var employeesTemp = "";
    return new Promise((resolve, reject) => {
        for (var i = 0; i < employees.length; i++) {
            if (employees[i].employeeNum == num) {
                employeesTemp = employees[i];
                break;
            }
        }
        if (employeesTemp == "") {
            reject("no results returned");
        } else {
            resolve(employeesTemp); // call "resolve" because we have completed the function successfully
        }
    });
}

module.exports.getManagers = function () {
    var employeesTemp = [];
    return new Promise((resolve, reject) => {
        for (var i = 0; i < employees.length; i++) {
            if (employees[i].isManager == true) {
                employeesTemp.push(employees[i])
            }
        }
        if (employeesTemp.length == 0) {
            reject("no results returned");
        } else {
            resolve(employeesTemp); // call "resolve" because we have completed the function successfully
        }
    });
}

module.exports.getDepartments = function () {
    return new Promise((resolve, reject) => { // place our code inside a "Promise" function
        if (departments.length == 0) {
            reject("no results returned");
        } else {
            resolve(departments); // call "resolve" because we have completed the function successfully
        }
    });
}

module.exports.addEmployee = function (employeeData){
     return new Promise((resolve, reject) => {
        empCount++;
        employeeData.employeeNum = empCount;
        employees.push(employeeData);
        resolve();
     });
}

module.exports.updateEmployee = function (employeeData) {
    return new Promise((resolve, reject) => {
        for (var i = 0; i < employees.length; i++) {
            if (employees[i].employeeNum  == employeeData.employeeNum) {
                employees[i] = employeeData;
                break;
            }      
        }
        resolve();       
    });
} 