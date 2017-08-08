const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
let Schema = mongoose.Schema;

var userSchema = new Schema({
    "user": {
        "type": String,
        "unique": true
    },
    "password": String
});

let User;



module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb://assignment7:assignment7@ds047050.mlab.com:47050/web322_a7");
        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error         
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            //User.remove({ }, function (err) { }); to remove all users
            resolve();
        });
    });
};



module.exports.registerUser = function (userData) {
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            reject("Passwords don't match");
        } else {
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(userData.password, salt, function (err, hash) {
                    if (err) {
                        reject("There was an error encrypting the password")
                    } else {
                        // TODO: Store the resulting "hash" value in the DB 
                        userData.password = hash;
                        var newUser = new User(userData);
                        newUser.save((err) => {
                            if (err) {
                                if (err.code == 11000) {
                                    reject("Username already taken");
                                } else {
                                    reject("Cannot create a new user: " + err.message);
                                }
                            } else {
                                resolve();
                            }
                        });
                    }
                });
            });
        }
    });
}

module.exports.checkUser = function (userData) {
    return new Promise((resolve, reject) => {
        User.find({ "user": userData.user })
            .exec()
            .then((users) => {
                bcrypt.compare(userData.password, users[0].password)
                    .then((res) => {
                        if (res) {
                            resolve();
                        } else {
                            if (users.length == 0) {
                                reject(userData.user + " not found");
                            } else if (userData.password != users[0].password) {
                                reject("Incorrect Password for: " + userData.user);
                            }
                        }
                    })
                    .catch((err) => {
                        reject("Unable to find " + userData.user);
                    });
            });
    });
}

module.exports.updatePassword = function (userData) {
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            reject("Passwords don't match");
        } else {
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(userData.password, salt, function (err, hash) {
                    if (err) {
                        reject("There was an error encrypting the password")
                    } else {
                        userData.password = hash;
                        User.update({ user: userData.user },
                            { $set: { password: userData.password } },
                            { multi: false })
                            .exec()
                            .then(() => {
                                console.log("Password updated");
                                resolve();
                            })
                            .catch((err) => {
                                console.log(err);
                                reject( "There was an error updating the password for user " + userData.user);
                            })
                    }
                });
            });
        }
    })
}