//mongodb://<assignment6>:<assignment6>@ds157712.mlab.com:57712/web322_a6

const mongoose = require('mongoose');
let Schema = mongoose.Schema;

var commentSchema = new Schema({
    "authorName": String,
    "authorEmail": String,
    "subject": String,
    "commentText": String,
    "postedDate": Date,
    "replies": {
        "comment_id": String,
        "authorName": String,
        "authorEmail": String,
        "commentText": String,
        "repliedDate": Date
    }
});

let Comment; // to be defined on new connection (see initialize) 

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb://assignment6:assignment6@ds157712.mlab.com:57712/web322_a6");
        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error         
        });
        db.once('open', () => {
            Comment = db.model("comments", commentSchema);
            resolve();
        });
    });
};


module.exports.addComment = function (data) {
    return new Promise(function (resolve, reject) {
        data.postedDate = Date.now();
        newComment = new Comment(data);
        newComment.save((err) => {
            if (err) {
                // there was an error
                console.log(err);
                reject("There was an error saving the comment: " + err);
            } else {
                // everything good
                console.log(data);
                resolve(newComment._id)
            }
            //process.exit();
        });
    });
}

module.exports.getAllComments = function () {
    return new Promise(function (resolve, reject) {
        Comment.find()
            .sort({ postedDate: "asc" })
            .exec()
            .then((comments) => {
                resolve(comments);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

module.exports.addReply = function (data) {
    return new Promise(function (resolve, reject) {
        data.repliedDate = Date.now();
        Comment.update({ _id: data.comment_id },
            { $addToSet: { replies: data } },
            { multi: false })
            .exec()
            .then(() => {
                console.log("Comment updated");
                resolve();
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            });
    });
}