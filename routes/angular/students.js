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
  var groups;
  sql = 'SELECT raw_group.name AS group_name, raw_user.name AS name, raw_user.birth AS birth, raw_userinfo.phone AS phone, raw_userinfo.email AS email, raw_userinfo.date AS date, raw_userinfo.count AS count, raw_userinfo.pk AS userinfo_pk FROM raw_user, raw_userinfo, raw_group WHERE raw_user.pk=raw_userinfo.user_fk AND raw_userinfo.group_fk=raw_group.pk AND raw_group.name LIKE ? ORDER BY raw_group.name ASC, raw_user.name ASC;';
  factor = '%' + name + '%';
  var query = connection.query(sql, factor, function(err, rows){
    if(err) throw err;
    res.json(rows);
  });
})

module.exports = router;
