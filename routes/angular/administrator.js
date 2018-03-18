var express = require('express')
var app = express()
var router = express.Router(); // 라우터처리
var path = require('path') // 상대경로
const http = require('http');

var mysql = require('mysql') //express에 가면 mysql연동 정보가 있음

var connection = mysql.createConnection({
	host : 'hmtr-rds.cf3wzzk28tgn.ap-northeast-2.rds.amazonaws.com',
	port : 3306,
	user : 'humentory',
	password : 'humentory4132*',
	database : 'hmtr_db'
});
connection.connect();

router.post('/', function(req, res){
	var name = req.body.name;
	var path = req.body.path;
	sql = "UPDATE raw_serverinfo SET ? WHERE 1";
	factor = {nickname:name, imgpath:path};
	query = connection.query(sql, factor, function(err, rows){
		if(err) throw err;
		res.json({msg:"적용 완료"});
	});
});
module.exports = router;
