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
  var id = req.body.id;
  var password = req.body.password;
  sql = 'SELECT admin_user.id AS id, admin_user.password AS password FROM admin_user WHERE ?';
  factor = {id:id};
  var user;
  var query = connection.query(sql, factor, function(err, rows){
    if(err) throw err;
    console.log(rows);
    if(rows.length>0){
      if(rows[0].password == password){
        user = {state:'success', id:rows[0].id, password:rows[0].password, msg:''};
        res.json(user);
      }
      else{
        user = {state:'failure', id:'', password:'', msg:'비밀번호가 다르거나 존재하지 않는 아이디 입니다.'};
        res.json(user);
      }
    }
    else{
      user = {state:'failure', id:'', password:'', msg:'비밀번호가 다르거나 존재하지 않는 아이디 입니다.'};
      res.json(user);
    }
  });
})

module.exports = router;
