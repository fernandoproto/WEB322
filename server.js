/*********************************************************************************
*		WEB322	– Assignment 02
*		I	declare	that	this	assignment	is	my	own	work	in	accordance	with	Seneca		Academic	Policy.		No	part	
*		of	this	assignment	has	been	copied	manually	or	electronically	from	any	other	source	
*		(including	3rd	party	web	sites)	or	distributed	to	other	students.
*	
*		Name:	Fernando Henrique Zavalloni Proto	Student	ID:	128133154	Date:	26/May/17
*
*		Online	(Heroku)	Link:	https://blooming-brushlands-58927.herokuapp.com/
*
********************************************************************************/	

var express = require("express");
var app = express();
var path = require("path");

var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart(){
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.get("/", function(req, res){
     res.sendFile(path.join(__dirname + "/views/home.html"));
})

app.get("/about", function(req, res){
     res.sendFile(path.join(__dirname + "/views/about.html"));
})

app.use(express.static('public'));	

app.listen(HTTP_PORT, onHttpStart);