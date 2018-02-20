var express = require('express')
var app = express()
var router = express.Router()
var router = express.Router(); // 라우터처리
var path = require('path') // 상대경로

var mysql = require('mysql') //express에 가면 mysql연동 정보가 있음

// // // LOCAL DATABASE SETTING
// var connection = mysql.createConnection({
//   host: 'localhost',
//   port: 3306,
//   user: 'root',
//   password: '1111',
//   database: 'lipnus'
// })

// // AWS DATABASE SETTING
var connection = mysql.createConnection({
	host : 'hmtr-rds.cf3wzzk28tgn.ap-northeast-2.rds.amazonaws.com',
	port : 3306,
	user : 'humentory',
	password : 'humentory4132*',
	database : 'hmtr_db'
})


connection.connect();


router.get('/', function(req, res){
  console.log("test.js GET")
  // res.redirect('/test');
  res.render('android_group', {'testValue' : "안드로이드 테스트"})
});


// 1. /test , POST실험
router.post('/', function(req,res){

	var group_code = req.body.group_code;
  var responseData = {};

	var query = connection.query('select * from raw_group where group_code =?', [group_code], function(err, rows) {
		if(err) throw err;

    if(rows[0]) {

			if(rows[0].state == "open"){
				responseData.result = rows[0].name;
			}else{
				responseData.result = "close";
			}

		} else {
			responseData.result = "none";
		}
		res.json(responseData)
	})

})

module.exports = router;
