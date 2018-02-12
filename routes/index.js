var express = require('express')
var app = express()
var router = express.Router()

//경로설정
var path = require('path');
var test = require('./test/test');
var dbtest = require('./test/test_db');



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


// 라우터설정
router.use('/test/test', test);
router.use('/test/test_db', dbtest);

module.exports = router;
