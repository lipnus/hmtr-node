var express = require('express')
var app = express()
var router = express.Router()



router.get('/', function(req, res){
  console.log("test.js GET")
  // res.redirect('/test');
  res.render('test0', {'testValue' : "하하하"})
});


// 1. /test , POST실험
router.post('/', function(req,res){

  console.log("test.js POST");
	var input1 = req.body.input1;
	var input2 = req.body.input2;

	var output1 = "반환값1";
	var output2 = "반환값2";

  var responseData = {'result':'ok'};
  responseData.input1 = input1;
  responseData.input2 = input2;
  responseData.output1 = output1;
  responseData.output2 = output2;

	res.json( responseData );
})



module.exports = router;
