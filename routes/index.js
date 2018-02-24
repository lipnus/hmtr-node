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

//엥귤러


module.exports = router;
