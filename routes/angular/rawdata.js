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
function qna(question, answer){
	this.question = question;
	this.answer = answer;
}

connection.connect();

router.post('/', function(req, res){
  var userinfo_pk = req.body.userinfo_pk;

	result = {
		basicinfo1:[],
		basicinfo2:[],
		basicinfo3:[],
		behavior1:[],
		behavior2:[],
		behavior3:[],
		behavior4:[],
		aptitude_uns:[],
		aptitude_internet:[],
		aptitude_pnc_A:[],
		aptitude_pnc_B:[],
		aptitude_pnc_C:[],
		aptitude_pnc_D:[],
		aptitude_pnc_E:[],
		aptitude_pnc_F:[],
		aptitude_stress_A:[],
		aptitude_stress_B:[],
		aptitude_stress_C:[],
		aptitude_stress_D:[],
		aptitude_stress_E:[],
		aptitude_stress_F:[],
		aptitude_stress_G:[],
		aptitude_stress_H:[],
		aptitude_support1:[],
		aptitude_support2:[],
		aptitude_demand1:[],
		aptitude_demand2:[],
		aptitude_help1:[],
		aptitude_help2:[],
		aptitude_needs:[],
		balance_learning:[],
		balance_course:[],
		balance_entrance:[]
	}

  sql = "SELECT script_basicinfo.script AS question, script_basicinfo.category AS category_high, '' AS category_low, raw_basicinfo.answer AS answer_pk, choice_basic.choice AS answer	FROM script_basicinfo, choice_basic, raw_basicinfo WHERE raw_basicinfo.question_fk = script_basicinfo.pk AND raw_basicinfo.answer = choice_basic.pk AND raw_basicinfo.user_fk = ?	UNION	SELECT script_behavior.script AS question, script_behavior.category_high AS category_high, script_behavior.category_low AS category_low, raw_behavior.answer AS answer_pk, choice_behavior.choice AS answer FROM script_behavior, choice_behavior, raw_behavior WHERE raw_behavior.question_fk = script_behavior.pk AND raw_behavior.answer = choice_behavior.pk AND raw_behavior.user_fk = ? UNION SELECT script_aptitude.script AS question, script_aptitude.category_high AS category_high, script_aptitude.category_low AS category_low, raw_aptitude.answer AS answer_pk, choice_aptitude.choice AS answer FROM script_aptitude, choice_aptitude, raw_aptitude WHERE raw_aptitude.user_fk = ? AND raw_aptitude.question_fk = script_aptitude.pk AND ( raw_aptitude.answer = choice_aptitude.pk OR raw_aptitude.answer = 0 OR raw_aptitude.answer = -1 ) GROUP BY raw_aptitude.question_fk UNION SELECT script_balance.script AS question, script_balance.category AS category_high, '' AS category_low, raw_balance.answer AS answer_pk, choice_balance.result AS answer FROM script_balance, choice_balance, raw_balance	WHERE raw_balance.user_fk = 51 AND raw_balance.question_fk = script_balance.sequence AND raw_balance.answer = choice_balance.pk ORDER BY category_high ASC";
  var query = connection.query(sql, [userinfo_pk, userinfo_pk, userinfo_pk, userinfo_pk], function(err, rows){
    if(err) throw err;
		for(var i=0; i<rows.length; i++){
			if(rows[i].category_high == '1_기본정보'){
				result.basicinfo1[result.basicinfo1.length] = new qna(rows[i].question, rows[i].answer);
			}
			else if(rows[i].category_high == '2_경험이력정보'){
				result.basicinfo2[result.basicinfo2.length] = new qna(rows[i].question, rows[i].answer);
			}
			else if(rows[i].category_high == '3_목표설정정보'){
				result.basicinfo3[result.basicinfo3.length] = new qna(rows[i].question, rows[i].answer);
			}
			else if(rows[i].category_high == '채움'){
				result.behavior1[result.behavior1.length] = new qna(rows[i].question, rows[i].answer);
			}
			else if(rows[i].category_high == '세움'){
				result.behavior2[result.behavior2.length] = new qna(rows[i].question, rows[i].answer);
			}
			else if(rows[i].category_high == '키움'){
				result.behavior3[result.behavior3.length] = new qna(rows[i].question, rows[i].answer);
			}
			else if(rows[i].category_high == '돋움'){
				result.behavior4[result.behavior4.length] = new qna(rows[i].question, rows[i].answer);
			}
			else if(rows[i].category_high == '이해도만족도'){
				result.aptitude_uns[result.aptitude_uns.length] = new qna(rows[i].question, rows[i].answer);
			}
			else if(rows[i].category_high == '인터넷'){
				result.aptitude_internet[result.aptitude_internet.length] = new qna(rows[i].question, rows[i].answer);
			}
			else if(rows[i].category_high == '장단점'){
				if(rows[i].answer_pk == -1) var text = '단점';
				else if(rows[i].answer_pk == 0) var text = '해당없음';
				else if(rows[i].answer_pk == 1) var text = '장점';

			 	if(rows[i].category_low == '실천'){
					result.aptitude_pnc_A[result.aptitude_pnc_A.length] = new qna(rows[i].question, text);
			 	}
			 	else if(rows[i].category_low == '주도'){
					result.aptitude_pnc_B[result.aptitude_pnc_B.length] = new qna(rows[i].question, text);
			 	}
			 	else if(rows[i].category_low == '열정'){
					result.aptitude_pnc_C[result.aptitude_pnc_C.length] = new qna(rows[i].question, text);
				}
				else if(rows[i].category_low == '계획'){
					result.aptitude_pnc_D[result.aptitude_pnc_D.length] = new qna(rows[i].question, text);
				}
				else if(rows[i].category_low == '창의'){
					result.aptitude_pnc_E[result.aptitude_pnc_E.length] = new qna(rows[i].question, text);
				}
				else if(rows[i].category_low == '관심'){
					result.aptitude_pnc_F[result.aptitude_pnc_F.length] = new qna(rows[i].question, text);
				}
			}
			else if(rows[i].category_high == '스트레스' && rows[i].answer_pk == 1){
				if(rows[i].category_low == '언어'){
					result.aptitude_stress_A[result.aptitude_stress_A.length] = new qna(rows[i].question, rows[i].answer_pk);
				}
				else if(rows[i].category_low == '논리수학'){
					result.aptitude_stress_B[result.aptitude_stress_B.length] = new qna(rows[i].question, rows[i].answer_pk);
				}
				else if(rows[i].category_low == '시각공간'){
					result.aptitude_stress_C[result.aptitude_stress_C.length] = new qna(rows[i].question, rows[i].answer_pk);
				}
				else if(rows[i].category_low == '신체운동'){
					result.aptitude_stress_D[result.aptitude_stress_D.length] = new qna(rows[i].question, rows[i].answer_pk);
				}
				else if(rows[i].category_low == '음악'){
					result.aptitude_stress_E[result.aptitude_stress_E.length] = new qna(rows[i].question, rows[i].answer_pk);
				}
				else if(rows[i].category_low == '자연'){
					result.aptitude_stress_F[result.aptitude_stress_F.length] = new qna(rows[i].question, rows[i].answer_pk);
				}
				else if(rows[i].category_low == '자기이해'){
					result.aptitude_stress_G[result.aptitude_stress_G.length] = new qna(rows[i].question, rows[i].answer_pk);
				}
				else if(rows[i].category_low == '대인관계'){
					result.aptitude_stress_H[result.aptitude_stress_H.length] = new qna(rows[i].question, rows[i].answer_pk);
				}
			}
			else if(rows[i].category_high == '지지와요구'){
				if(rows[i].category_low == '지지정도'){
					result.aptitude_support1[result.aptitude_support1.length] = new qna(rows[i].question, rows[i].answer);
				}
				else if(rows[i].category_low == '지지대상'){
					if(rows[i].answer_pk == 1){
						result.aptitude_support2[result.aptitude_support2.length] = new qna(rows[i].question, '지지대상');
					}
				}
				else if(rows[i].category_low == '요구정도'){
					result.aptitude_demand1[result.aptitude_demand1.length] = new qna(rows[i].question, rows[i].answer);
				}
				else if(rows[i].category_low == '요구대상'){
					if(rows[i].answer_pk == 1){
						result.aptitude_demand2[result.aptitude_demand2.length] = new qna(rows[i].question, '요구대상');
					}
				}
			}
			else if(rows[i].category_high == '도움이된'){
				if(rows[i].answer_pk == 1) result.aptitude_help1[result.aptitude_help1.length] = new qna(rows[i].question, '');
			}
			else if(rows[i].category_high == '도움받을'){
				if(rows[i].answer_pk == 1) result.aptitude_help2[result.aptitude_help2.length] = new qna(rows[i].question, '');
			}
			else if(rows[i].category_high == '필요수업유형'){
				result.aptitude_needs[result.aptitude_needs.length] = new qna(rows[i].question, rows[i].answer);
			}
			else if(rows[i].category_high == '학습'){
				result.balance_learning[result.balance_learning.length] = new qna(rows[i].question, rows[i].answer);
			}
			else if(rows[i].category_high == '진로'){
				result.balance_course[result.balance_course.length] = new qna(rows[i].question, rows[i].answer);
			}
			else if(rows[i].category_high == '진학'){
				result.balance_entrance[result.balance_entrance.length] = new qna(rows[i].question, rows[i].answer);
			}
		}
    res.json(result);
  });
})

module.exports = router;
