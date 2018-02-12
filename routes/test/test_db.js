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
  res.render('test_db', {'testValue' : "디비테스트"})
});


// 1. /test , POST실험
router.post('/', function(req,res){

  console.log("test.js POST");
	var name = req.body.name;
	var rand_num = req.body.rand_num;
  var date = req.body.date;

  console.log("DB접속시도" + name + ", " + rand_num + ", " + date);
  var sql = {name, rand_num, date};
	var query = connection.query('insert into raw_group set ?', sql, function(err,rows) {
		if(err) {
      console.log("DB접속실패: " + err);
			return res.json({'result' : "DB입력 성공"});
      throw err
    }

		return res.json({'result' : "DB입력 성공"});
	})


  // var responseData = {'result':'ok'};
  // responseData.in1 = input1;
  // responseData.in2 = input2;
  //
	// res.json( responseData );
})



module.exports = router;
