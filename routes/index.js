var express = require('express')
var app = express()
var router = express.Router()

//경로설정
var path = require('path');
var test = require('./test/test');
var dbtest = require('./test/test_db');
var realtest = require('./test/test_real');


var android_group = require('./android/group');
var android_user = require('./android/user');
var android_chat_basicinfo = require('./android/chat_basicinfo');
var android_chat_behavior = require('./android/chat_behavior');
var android_chat_aptitude = require('./android/chat_aptitude');
var android_chat_balance = require('./android/chat_balance');
var android_serverinfo = require('./android/serverinfo');
var android_delete_aptitude = require('./android/delete_aptitude');


var server_caldata = require('./caldata');
var server_report = require('./report');

var angular_rawdata = require('./angular/rawdata');
var angular_group = require('./angular/group');
var angular_authentication = require('./angular/authentication');
var angular_students = require('./angular/students');
var angular_statistics = require('./angular/statistics');
var angular_administrator = require('./angular/administrator');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


//테스트
router.use('/test/test', test);
router.use('/test/test_db', dbtest);
router.use('/test/test_real', realtest);

//안드로이드
router.use('/android/group', android_group);
router.use('/android/user', android_user);
router.use('/android/chat_basicinfo', android_chat_basicinfo);
router.use('/android/chat_behavior', android_chat_behavior);
router.use('/android/chat_aptitude', android_chat_aptitude);
router.use('/android/chat_balance', android_chat_balance);
router.use('/android/serverinfo', android_serverinfo);
router.use('/android/delete_aptitude', android_delete_aptitude);

//서버
router.use('/caldata', server_caldata);
router.use('/report', server_report);

//엥귤러
router.use('/angular/rawdata', angular_rawdata);
router.use('/angular/group', angular_group);
router.use('/angular/students', angular_students);
router.use('/angular/authentication', angular_authentication);
router.use('/angular/statistics', angular_statistics);
router.use('/angular/administrator', angular_administrator);

module.exports = router;
