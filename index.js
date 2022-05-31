const express = require("express");
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const fetch = require("node-fetch");
const saltRounds = 12;
const session = require('express-session');
const app = express();
const pool = dbConnection();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'topsecret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))
//routes


app.get("/", async function(req, res) {
	res.render("home", {"message": ""});
});

function isAuthenticated(req, res, next){
    if (!req.session.authenticated) {
				req.session.destroy();
        res.redirect("/"); 
        //user is not authenticated
    } else {
      next();
    }

}

function adminAuthenticated(req, res, next){
    if (!req.session.adminAuthenticated) {
				req.session.destroy();
        res.redirect("/"); 
        //admin is not authenticated
    } else {
      next();
    }

}

app.get("/sign_up", async function(req, res) {
	res.render("signUp");
});

app.get("/sign_in", async function(req, res) {
	res.render("signInChoice");
});

app.get("/adminIn", async function(req, res) {
	res.render("signInAdmin", {"error":""});
});

app.post("/api/adminIn", async function(req, res){
	let ssn = req.session;
	let username = req.body.username;
	let password = req.body.password;

	let hashedPwd = "";

  let sql = "SELECT * FROM o_admin WHERE username = ?";  
  let rows = await executeSQL(sql, [username]);

  if (rows.length > 0) {
    // hashedPwd = "$2a$10$Zr7WyM2tGnm3rIL0rgC5GelS9FCGkWz0ZmzfZBRCi.I5wx0oSgogW";
     hashedPwd = rows[0].password;
  }

	let pwdMatch = await bcrypt.compare(password, hashedPwd);

	if(pwdMatch == true){
		req.session.adminAuthenticated = true;
		res.send({"adminAuthentication" : "successful"});
	} else {
		res.send({"adminAuthentication" : "fail"});
	}
});

app.get("/admin", adminAuthenticated, async function(req, res){
	let sql = `SELECT userId, postId, post, image, DATE_FORMAT(dop, '%Y-%m-%d') dopISO, username, portrait, likes, dislikes FROM o_posts NATURAL JOIN o_users NATURAL JOIN o_likes ORDER BY dop DESC`;

	let rows = await executeSQL(sql);

	res.render("admin", {"posts" : rows});
});

app.get("/admin/delete", adminAuthenticated, async function(req, res){

	let postId = req.query.postId;

	let sql = `DELETE FROM o_posts WHERE postId = ${postId}`;
	let hold = `DELETE FROM o_likes WHERE postId = ${postId}`;

	let rows = await executeSQL(sql);
	let holder = await executeSQL(hold);
	res.redirect("/admin");
});

app.get("/userIn", async function(req, res) {
	res.render("signInUser");
});

app.post("/api/userIn", async function(req, res){
	let ssn = req.session;
	let username = req.body.username;
	let password = req.body.password;

	let hashedPwd = "";

  let sql = "SELECT * FROM o_users WHERE username = ?";  
  let rows = await executeSQL(sql, [username]);

  if (rows.length > 0) {
    // hashedPwd = "$2a$10$Zr7WyM2tGnm3rIL0rgC5GelS9FCGkWz0ZmzfZBRCi.I5wx0oSgogW";
     hashedPwd = rows[0].password;
  }

	let pwdMatch = await bcrypt.compare(password, hashedPwd);

	if(pwdMatch == true){
		req.session.authenticated = true;
		ssn.username = username;
		res.send({"authentication" : "successful"});
	} else {
		res.send({"authentication" : "fail"});
	}
});

app.get("/weather", isAuthenticated, async function(req, res) {
	res.render("weather");
});

app.get("/news", isAuthenticated, async function(req, res){
  res.render("news");
})

app.get("/api/news", isAuthenticated, async function(req, res){
  let search = req.query.search;
  // console.log(search);
  let url = `https://free-news.p.rapidapi.com/v1/search?q=${search}&lang=en`;
  let response = await fetch(url, {
		method: "GET",
		headers: {
			"x-rapidapi-key": "6812c20388msh6faf986c03ee6d9p15b4e2jsnbfafdebd288b",
			"x-rapidapi-host": "free-news.p.rapidapi.com"
		}
	})
	let data = await response.json();
	let articles = data.articles;
	if(typeof(articles) == "undefined"){
		articles = "empty";
	}
	// console.log(articles);
	res.render("results", {"articles" : articles});

});

app.post("/user/new/check", async function(req, res) {
	let sql = `SELECT username FROM o_users`;
	let data = await executeSQL(sql);
	res.send({"users" : data})

});

app.post("/user/new", async function(req, res) {

  let fName = req.body.firstName;
  let lName = req.body.lastName;
  let username = req.body.username;
	let password = req.body.password;
	let email = req.body.email;
	let phone = req.body.phoneNumber;
	let gender = req.body.gender;
	let dob = req.body.dob;
	let portrait = req.body.portrait;

	if(portrait == null){
		portrait = "http://s3.amazonaws.com/37assets/svn/765-default-avatar.png";
	}

	password = await bcrypt.hash(password, saltRounds);

  let sql = "INSERT INTO o_users (firstName, lastName, userName, password, email, phoneNumber, gender, dob, portrait) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)";

  let params = [fName, lName, username, password, email, phone, gender, dob, portrait];
  let rows = await executeSQL(sql, params);

  res.render("home", {"message":"Account Created"});

});

app.get("/feed", isAuthenticated, async function(req, res) {
	let ssn = req.session;
  let sql = `SELECT userId, postId, post, image, DATE_FORMAT(dop, '%Y-%m-%d') dopISO, username, portrait, likes, dislikes FROM o_posts NATURAL JOIN o_users NATURAL JOIN o_likes ORDER BY dop DESC`;


	let hold = `SELECT * FROM o_users WHERE username = "${ssn.username}"`;

	let rows = await executeSQL(sql);
	let userInfo = await executeSQL(hold);

	ssn.userId = userInfo[0].userId;
	
	res.render("feed", {"posts" : rows, "user" : userInfo})
});

app.post("/feed/likes/add", isAuthenticated, async function(req, res){
  let sql = `UPDATE o_likes SET likes = likes + 1 WHERE postId = ?`;
  let params = [req.body.postId];
  // console.log(req.body.postId);
  let rows = await executeSQL(sql, params);
  res.send("feed");

});

app.post("/feed/dislikes/add", isAuthenticated, async function(req, res){
  let sql = `UPDATE o_likes SET dislikes = dislikes + 1 WHERE postId = ?`;
  let params = [req.body.postId];
  // console.log(req.body.postId);
  let rows = await executeSQL(sql, params);
  res.send("feed");

});

app.get("/newPost", isAuthenticated, async function(req, res) {
  res.render("newPost");
});

app.post("/new/post", isAuthenticated, async function(req, res){
	let ssn = req.session;
	let today = new Date();

	let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	let time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric"});
	
	let datetime = date + " " + time;

  let userId = ssn.userId;
  let post = req.body.post;
  let image = req.body.image;
	let dop = datetime;
	if(image == ""){
		image = null;
	}

  let sql = "INSERT INTO o_posts (userId, post, image, dop) VALUES ( ?, ?, ?, ?)";

  let params = [userId, post, image, dop];
  let rows = await executeSQL(sql, params);

	let hold = "SELECT postId, post FROM o_posts ORDER BY postId DESC";
	let holder = await executeSQL(hold);

	let postId = holder[0].postId;
	let postlike = "INSERT INTO o_likes (postId, likes, dislikes) VALUES ( ?, ?, ?)";

	let parm = [postId, 0, 0];
	let now = await executeSQL(postlike, parm);


  res.redirect("/feed");
});

app.get("/user", isAuthenticated, async function(req, res) {
	let ssn = req.session;
	let tempId = req.query.userId;
	// console.log(tempId);
	if (tempId == ssn.userId){

		let sql = `SELECT * FROM o_users WHERE userId = "${ssn.userId}"`;
		let rows = await executeSQL(sql);
		res.render("editUser", {"user" : rows});

	}
	else {

		let sql = `SELECT * FROM o_users WHERE userId = "${tempId}"`;
		let rows = await executeSQL(sql);
		// console.log(rows);
		res.render("user", {"user" : rows});
		
	}
});

app.get("/edit/user", isAuthenticated, async function(req, res) {
	let ssn = req.session;
	let sql = `SELECT * FROM o_users WHERE userId = "${ssn.userId}"`;
	let rows = await executeSQL(sql);
	res.render("editUser", {"user" : rows});
});

app.post("/edit/user", isAuthenticated, async function(req, res){
	let ssn = req.session;
	let userId = ssn.userId;
	
	let sql = `UPDATE o_users SET firstName = ?, lastName = ?, username = ?, email = ?, phoneNumber = ?, bio = ?, portrait = ?, gender = ? WHERE userId = ${userId}`;

	let params=[req.body.firstName, req.body.lastName, req.body.username, req.body.email, req.body.phoneNumber, req.body.bio, req.body.portrait, req.body.gender];
	let rows = await executeSQL(sql, params);
	// res.send(rows);
	res.redirect(`/edit/user`);
});

app.get("/edit/posts", isAuthenticated, async function(req, res) {
	let ssn = req.session;
	let userId = ssn.userId;
	let sql = `SELECT userId, postId, post, image, DATE_FORMAT(dop, '%Y-%m-%d') dopISO, username, portrait, likes, dislikes FROM o_posts NATURAL JOIN o_users NATURAL JOIN o_likes WHERE userId = ${userId} ORDER BY dop DESC`;
	let rows = await executeSQL(sql);
	res.render("editPosts", {"posts" : rows});
});

app.get("/post/delete", isAuthenticated, async function(req, res){

	let postId = req.query.postId;

	let sql = `DELETE FROM o_posts WHERE postId = ${postId}`;
	let hold = `DELETE FROM o_likes WHERE postId = ${postId}`;

	let rows = await executeSQL(sql);
	let holder = await executeSQL(hold);
	res.redirect("/edit/posts");
});

app.get("/logout", isAuthenticated, function(req, res){

  req.session.destroy();
  res.redirect("/sign_in");

});




app.get("/dbTest", async function(req, res){
	let sql = "SELECT CURDATE()";
	let rows = await executeSQL(sql);
	res.send(rows);
});//dbTest

//functions
async function executeSQL(sql, params){
	return new Promise (function (resolve, reject) {
		pool.query(sql, params, function (err, rows, fields) {
		if (err) throw err;
			resolve(rows);
		});
	});
}//executeSQL
//values in red must be updated
function dbConnection(){

   const pool  = mysql.createPool({

      connectionLimit: 10,
      host: "lyn7gfxo996yjjco.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
      user: "kqlcf1nkfp31vd79",
      password: "vav9q6udaa4eqnxr",
      database: "b36clx1msbh23po4"

   }); 

   return pool;

} //dbConnection

//start server
app.listen(3000, () => {
	console.log("Express server running...")
} )


