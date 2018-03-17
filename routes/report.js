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

function find_max(A, B, C, D){
	var F = Math.max(A, B, C, D);
	if(A==F) return 0;
	else if(B==F) return 1;
	else if(C==F) return 2;
	else if(D==F) return 3;
}
var bahavior_category = ['채움', '세움', '키움', '돋움'];

var behavior_type = {
	cw : ['책임', '현실', '대비', '조언', '체계'],
	sw : ['감정', '타인', '목표', '조화', '주제'],
	kw : ['변화', '조작', '주체', '탐색', '합리'],
	dw : ['창의', '예술', '자아', '활동', '분석']
};
var min_score = [0, 97,  91, 82, 68, 52, 37, 29, 23, 20];
var max_score = [0, 100, 97, 91, 82, 68, 52, 37, 29, 23];

var uns_value = { 매우높음 : 5,  높음 : 4,  보통 : 3,  낮음 : 2,  매우낮음 : 1 };
var internet_value = { '1시간' : '1h', '2시간' : '2h', '3시간' : '3h', '4시간' : '4h', '5시간 이상' : '5h'};
var connect_weight = {중1:1, 중2:1, 중3:1, 고1:1, 고2:2, 고3:3, N수:3};
var learning_question = ['', '전과목 평균내신', '교과성적 향상도', '전공관련 교과성적', '전공관련 교과목 교내수상', '방과후학교 활동', '교과관련 동아리 및 멘토링 활동', '교과연계 주제활동(프로젝트, 보고서)', '플래너 및 노트 작성(오답,정리)', '자기주도학습', '학습상황 및 시험결과 분석'];
var course_question = ['', '진로관련 독서활동', '진로관련 자격증', '진로관련 수상', '진로탐색 체험활동', '진로관련 동아리 및 멘토링 활동', '진로관련 봉사 활동', '전공주제탐구(프로젝트,보고서)', '진로포트폴리오(산출물,일지)', '진로관련 전공연계 강의', '진로관련 특기사항'];
var entrance_question = ['', '진로희망 일치도', '공동체 의식과 협동심', '리더십', '학업의지', '교우관계 및 의사소통능력', '인성평가', '자기극복의지', '다양한 활동경험', '생활기록부 매칭도', '진학관련 활동'];


router.post('/', function(req, res){
  var userinfo_pk = req.body.userinfo_pk;
  result = {};
  sql = "SELECT raw_userinfo.date, raw_user.name, raw_user.birth, raw_group.name AS group_name, cal_behavior.cw_score, cal_behavior.sw_score, cal_behavior.kw_score, cal_behavior.dw_score, cal_aptitude.pnc_A, cal_aptitude.pnc_B, cal_aptitude.pnc_C, cal_aptitude.pnc_D, cal_aptitude.pnc_E, cal_aptitude.pnc_F, cal_aptitude.stress_A, cal_aptitude.stress_B, cal_aptitude.stress_C, cal_aptitude.stress_D, cal_aptitude.stress_E, cal_aptitude.stress_F, cal_aptitude.stress_G, cal_aptitude.stress_H, cal_balance.learning_score, cal_balance.course_score, cal_balance.entrance_score, cal_behavior.best_score_cskd, cal_aptitude.best_score_pnc, cal_aptitude.best_score_stress, cal_balance.learning_best, cal_balance.learning_worst, cal_balance.course_best, cal_balance.course_worst, cal_balance.entrance_best, cal_balance.entrance_worst, cal_balance.total_score_cpr, cal_balance.total_score_lce FROM raw_userinfo, raw_user, raw_group, raw_basicinfo, choice_basic, cal_behavior, cal_aptitude, cal_balance WHERE raw_userinfo.pk=? AND raw_userinfo.user_fk=raw_user.pk AND raw_basicinfo.user_fk=raw_userinfo.pk AND raw_basicinfo.answer=choice_basic.pk AND raw_userinfo.group_fk=raw_group.pk AND raw_userinfo.pk=cal_behavior.user_fk AND raw_userinfo.pk=cal_aptitude.user_fk AND raw_userinfo.pk=cal_balance.user_fk GROUP BY raw_userinfo.pk";
  query = connection.query(sql, userinfo_pk, function(err, rows){
    if(err) throw err;
    result.date = [rows[0].date.slice(0, 4), '-', rows[0].date.slice(4,6), '-', rows[0].date.slice(6)].join('');
    result.name = rows[0].name;
    result.birth = [rows[0].birth.slice(0, 2), '-', rows[0].birth.slice(2, 4), '-', rows[0].birth.slice(4)].join('');
    result.group_name = rows[0].group_name;
    result.cw_standard_score = rows[0].cw_score;
    result.cw_raw_score = Math.round(rows[0].cw_score/4*3);
    result.sw_standard_score = rows[0].sw_score;
    result.sw_raw_score = Math.round(rows[0].sw_score/4*3);
    result.kw_standard_score = rows[0].kw_score;
    result.kw_raw_score = Math.round(rows[0].kw_score/4*3);
    result.dw_standard_score = rows[0].dw_score;
    result.dw_raw_score = Math.round(rows[0].dw_score/4*3);
		result.best_score_cskd = rows[0].best_score_cskd;
		result.best_score_pnc = rows[0].best_score_pnc;
		result.best_score_stress = rows[0].best_score_stress;
		result.total_score_lce = rows[0].total_score_lce;
		result.total_score_cpr = rows[0].total_score_cpr;
    var best_behavior_category = behavior_type[find_max(result.cw_standard_score, result.sw_standard_score, result.kw_standard_score, result.dw_standard_score)];
    result.pnc_A = rows[0].pnc_A;
    result.pnc_B = rows[0].pnc_B;
    result.pnc_C = rows[0].pnc_C;
    result.pnc_D = rows[0].pnc_D;
    result.pnc_E = rows[0].pnc_E;
    result.pnc_F = rows[0].pnc_F;
    result.stress_A = rows[0].stress_A;
    result.stress_B = rows[0].stress_B;
    result.stress_C = rows[0].stress_C;
    result.stress_D = rows[0].stress_D;
    result.stress_E = rows[0].stress_E;
    result.stress_F = rows[0].stress_F;
    result.stress_G = rows[0].stress_G;
    result.stress_H = rows[0].stress_H;
    result.learning_score = rows[0].learning_score;
    result.course_score = rows[0].course_score;
    result.entrance_score = rows[0].entrance_score;
		result.learning_best = rows[0].learning_best;
		result.learning_worst = rows[0].learning_worst;
		result.course_best = rows[0].course_best;
		result.course_worst = rows[0].course_worst;
		result.entrance_best = rows[0].entrance_best;
		result.entrance_worst = rows[0].entrance_worst;
		for(var i=1; i<=9; i++){
			if(result.learning_score>=min_score[i] && result.learning_score<=max_score[i]) result.learning_grade = i;
			if(result.course_score>=min_score[i] && result.course_score<=max_score[i]) result.course_grade = i;
			if(result.entrance_score>=min_score[i] && result.entrance_score<=max_score[i]) result.entrance_grade = i;
		}
    sql = "SELECT raw_basicinfo.question_fk AS question, choice_basic.choice AS answer FROM raw_basicinfo, choice_basic WHERE raw_basicinfo.user_fk=? AND raw_basicinfo.answer=choice_basic.pk";
    var query = connection.query(sql, userinfo_pk, function(err, rows){
        if(err) throw err;
        for(var i=0; i<rows.length; i++){
          if(rows[i].question == 2) result.gender = rows[i].answer;
          else if(rows[i].question == 3) result.grade = rows[i].answer;
          else if(rows[i].question == 4) result.field = rows[i].answer;
          else if(rows[i].question == 5) result.occupation = rows[i].answer;
          else if(rows[i].question == 8) result.performance = ((rows[i].answer.slice(0,2) - 1)*1 + rows[i].answer.slice(3,5)*1)/2;
          else if(rows[i].question == 10) result.goal_achieve_element = rows[i].answer;
          else if(rows[i].question == 9) result.goal_achieve_way = rows[i].answer;
          else if(rows[i].question == 13) result.interesting_plan = rows[i].answer;
          else if(rows[i].question == 14) result.goal_completion_period = rows[i].answer;
          else if(rows[i].question == 15) result.goal_reason = rows[i].answer;
        }
        result.job_group = '해당분야 직업군 멘트가 들어갈 자리입니다.';
        result.exp_comment = '경험이력탐색 부분에 들어갈 멘트가 위치할 자리입니다.';
        result.goal_comment = '목표설정탐색 부분에 들어갈 멘트가 위치할 자리입니다.';

        sql = "SELECT script_behavior.script AS question, script_behavior.category_high AS category_high, script_behavior.category_low AS category_low, raw_behavior.answer AS answer_pk, choice_behavior.choice AS answer FROM script_behavior, choice_behavior, raw_behavior WHERE raw_behavior.question_fk = script_behavior.pk AND raw_behavior.answer = choice_behavior.pk AND raw_behavior.user_fk = ? UNION SELECT script_aptitude.script AS question, script_aptitude.category_high AS category_high, script_aptitude.category_low AS category_low, raw_aptitude.answer AS answer_pk, choice_aptitude.choice AS answer FROM script_aptitude, choice_aptitude, raw_aptitude WHERE raw_aptitude.user_fk = ? AND raw_aptitude.question_fk = script_aptitude.pk AND ( raw_aptitude.answer = choice_aptitude.pk OR raw_aptitude.answer = 0 OR raw_aptitude.answer = -1 ) GROUP BY raw_aptitude.question_fk";
        factor = [userinfo_pk, userinfo_pk];
        var query = connection.query(sql, factor, function(err, rows){
          if(err) throw err;
          if(best_behavior_category == '채움') [result.type1_name, result.type2_name, result.type3_name, result.type4_name, result.type5_name] = behavior_type.cw;
          else if(best_behavior_category == '세움') [result.type1_name, result.type2_name, result.type3_name, result.type4_name, result.type5_name] = behavior_type.sw;
          else if(best_behavior_category == '키움') [result.type1_name, result.type2_name, result.type3_name, result.type4_name, result.type5_name] = behavior_type.kw;
          else if(best_behavior_category == '돋움') [result.type1_name, result.type2_name, result.type3_name, result.type4_name, result.type5_name] = behavior_type.dw;
          for(var i=0; i<rows.length; i++){
            if(rows[i].category_low == result.type1_name) result.type1_value += rows[i].answer_pk;
            else if(rows[i].category_low == result.type2_name) result.type2_value += rows[i].answer_pk;
            else if(rows[i].category_low == result.type3_name) result.type3_value += rows[i].answer_pk;
            else if(rows[i].category_low == result.type4_name) result.type4_value += rows[i].answer_pk;
            else if(rows[i].category_low == result.type5_name) result.type5_value += rows[i].answer_pk;
            if(rows[i].category_high == '이해도만족도'){
              if(rows[i].category_low == '성적') result.uns_grade = uns_value[rows[i].answer];
              else if(rows[i].category_low == '전공') result.uns_course = uns_value[rows[i].answer];
              else if(rows[i].category_low == '자기관리') result.uns_self_care = uns_value[rows[i].answer];
              else if(rows[i].category_low == '대인관계') result.uns_relationship = uns_value[rows[i].answer];
              else if(rows[i].category_low == '밸런스') result.uns_balance = uns_value[rows[i].answer];
            }
            if(rows[i].category_high == '인터넷'){
              if(rows[i].category_low == '사용시간') result.internet_time = internet_value[rows[i].answer];
              else if(rows[i].category_high == '사용영역') result.internet_type = rows[i].answer;
            }
          }
          result.type_comment = '학습행동유형 분석 우측 최 하단에 들어갈 멘트가 위치할 자리입니다.';
          result.pnc_comment = '장단점 멘트가 위치할 자리입니다.';
          result.stress_comment = '스트레스 멘트가 위치할 자리입니다.';
          result.learning_comment = '학습유형 관련 멘트가 위치할 자리입니다.';
          result.course_comment = '진로유형 관련 멘트가 위치할 자리입니다.';
          result.entrance_comment = '진학유형 관련 멘트가 위치할 자리입니다.';
					sql = "SELECT report_behavior.comment AS behavior_comment, report_aptitude.comment AS aptitude_comment FROM report_behavior, report_aptitude WHERE report_behavior.group_high=? AND report_behavior.group_low='일반' AND report_aptitude.category=? AND report_aptitude.sequence=0";
					factor = [result.best_score_cskd, result.best_score_pnc];
					query = connection.query(sql, factor, function(err, rows){
						if(err) throw err;
						result.behavior_comment = rows[0].behavior_comment;
						result.aptitude_comment = rows[0].aptitude_comment;
						sql = "SELECT report_balance.category AS category, report_balance.comment AS comment FROM report_balance WHERE (report_balance.category='learning' AND report_balance.sequence=?) OR (report_balance.category='course' AND report_balance.sequence=?) OR (report_balance.category='entrance' AND report_balance.sequence=?)";
						factor = [result.learning_worst, result.course_worst, result.entrance_worst];
						console.log(factor);
						query = connection.query(sql, factor, function(err, rows){
							if(err) throw err;
							for(var i=0; i<rows.length; i++){
									if(rows[i].category=='learning'){
										result.learning_comment = learning_question[result.learning_best] + ' 항목의 성취도 결과가 우수하게 평가되었습니다. 반대로, ' + learning_question[result.learning_worst] + '항목의 성취도가 다소 낮은 경향이 있습니다.' + rows[i].comment;
									}
									if(rows[i].category=='course'){
										result.course_comment = course_question[result.course_best] + ' 항목의 성취도 결과가 우수하게 평가되었습니다. 반대로, ' + course_question[result.course_worst] + '항목의 성취도가 다소 낮은 경향이 있습니다.' + rows[i].comment;
									}
									if(rows[i].category=='entrance'){
										result.entrance_comment = entrance_question[result.entrance_best] + ' 항목의 성취도 결과가 우수하게 평가되었습니다. 반대로, ' + entrance_question[result.entrance_worst] + '항목의 성취도가 다소 낮은 경향이 있습니다.' + rows[i].comment;
									}
							}
							res.json(result);
						});
					});
        });
    });
  });
});


module.exports = router;
