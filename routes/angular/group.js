var express = require('express')
var app = express()
var router = express.Router(); // 라우터처리
var path = require('path') // 상대경로
const http = require('http');

var mysql = require('mysql') //express에 가면 mysql연동 정보가 있음

var simpleFunction = require('../android/jsfile/simple_function');

var connection = mysql.createConnection({
	host : 'hmtr-rds.cf3wzzk28tgn.ap-northeast-2.rds.amazonaws.com',
	port : 3306,
	user : 'humentory',
	password : 'humentory4132*',
	database : 'hmtr_db'
})

connection.connect();

router.post('/', function(req, res){
  var order = req.body.order;
  var name = req.body.name;
  var group_code = req.body.group_code;
  var state = req.body.state;
  var groups;
  var query;
  var date = simpleFunction.getTimeStamp();
  if(order == "select"){
    sql = 'SELECT * FROM raw_group WHERE 1';
    factor = '';
    query = connection.query(sql, factor, function(err, rows) {
      if(err){
        throw err;
      }
      // connection.end();
      res.json(rows);
    });
  }
  else if(order == "make"){
    var random;
    query = connection.query('SELECT * FROM raw_group WHERE 1', '', function(err, rows) {
      if(err) throw err;
      while(i!=rows.length){
        random = Math.floor(Math.random()*1000000);
        for(var i=0; i<rows.length; i++){
          if(rows[i].group_code == random){
            break;
          }
        }
        if(i==rows.length){
          query = connection.query("INSERT INTO raw_group SET ?", {name:name, group_code:random, state:'close', date:date}, function(err, rows){
            if(err) throw err;
            query = connection.query("SELECT * FROM raw_group WHERE 1", '', function(err, rows) {
              if(err) throw err;
              result = { groups : rows, msg : '그룹 추가 완료'};
              res.json(result);
            });
          });
          break;
        }
        break;
      }
    });
  }
  else if(order == 'delete'){
    query = connection.query("SELECT raw_group.name FROM raw_group, raw_userinfo WHERE raw_group.pk=raw_userinfo.group_fk AND ?", {group_code:group_code}, function(err, rows) {
      if(err) throw err;
      if(rows.length==0){
        query = connection.query("DELETE FROM raw_group WHERE ?", {group_code:group_code}, function(err, rows){
          if(err) throw err;
          query = connection.query("SELECT * FROM raw_group WHERE 1", '', function(err, rows) {
            result = {groups:rows, msg:'성공적으로 삭제했습니다.'};
            res.json(result);
          });
        });
      }
      else{
        query = connection.query("SELECT * FROM raw_group WHERE 1", '', function(err, rows) {
          result = {groups:rows, msg:'해당 그룹에 속한 학생이 존재하여 삭제할 수 없습니다.'};
          res.json(result);
        });
      }
    });
  }
  else if(order == 'changeState'){
    sql = 'UPDATE raw_group SET raw_group.state = ? WHERE raw_group.group_code = ?';
    if(state == 'close'){
			factor = ['open', group_code];
      query = connection.query(sql, factor, function(err, rows){
        if(err) throw err;
        query = connection.query('SELECT * FROM raw_group WHERE 1', '', function(err, rows) {
          result = {groups:rows, msg:'그룹이 열렸습니다.'};
          res.json(result);
        });
      });
    }
    else{
			factor = ['close', group_code];
      query = connection.query(sql, factor, function(err, rows){
        if(err) throw err;
        query = connection.query('SELECT * FROM raw_group WHERE 1', '', function(err, rows) {
          result = {groups:rows, msg:'그룹이 닫혔습니다.'};
          res.json(result);
        });
      });
    }
  }
})

module.exports = router;
