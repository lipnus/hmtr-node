var express = require('express');
var app = express();
var router = express.Router();
var path = require('path');
const http = require('http');
var mysql = require('mysql');

var connection = mysql.createConnection({
	host : 'hmtr-rds.cf3wzzk28tgn.ap-northeast-2.rds.amazonaws.com',
	port : 3306,
	user : 'humentory',
	password : 'humentory4132*',
	database : 'hmtr_db'
});
connection.connect();

function score_to_grade(score){
  if(score>=97 && score<=100) return 1;
  else if(score>=91) return 2;
  else if(score>=82) return 3;
  else if(score>=68) return 4;
  else if(score>=52) return 5;
  else if(score>=37) return 6;
  else if(score>=29) return 7;
  else if(score>=23) return 8;
  else return 9;
}
var min_score = [0, 97,  91, 82, 68, 52, 37, 29, 23, 20];
var max_score = [0, 100, 97, 91, 82, 68, 52, 37, 29, 23];

// function nnv(name, value){
// 	this.name = name;
// 	this.value = value;
// }
router.post('/', function(req, res){
  input = {};
	// console.log(req.body);
  input.groups = req.body.groups; // 복수입력
  input.gender = req.body.gender; // 남/녀/무관 중 택1
  input.grade = req.body.grade; // 중1, 중2, 중3, 고1, 고2, 고3, N수생 복수입력
  input.field = req.body.field; // 인문, 사회과학, 자연과학, 간호/의학, 경영, 예/체능, 법학, 교육, 공학, 미정 복수선택
  input.interesting_plan = req.body.interesting_plan; // 학습/진로/진학 복수선택
  input.attainment = req.body.attainment; // 목표달성경험 여부
  // // input.attainment2 = req.body.attainment2; // 2차 이상 설문에서 목표달성경험 여부
  input.goal_reason = req.body.goal_reason; // 관심, 연습, 목적, 희망
  input.best_score_cskd = req.body.best_score_cskd;
  input.best_type = req.body.best_type;
  input.pnc_best = req.body.pnc_best;
  input.support = req.body.support;
  input.demand = req.body.demand;
  input.activity_helpful = req.body.activity_helpful;
  input.activity_wish = req.body.activity_wish;
  input.learning_grade = req.body.learning_grade;
  input.course_grade = req.body.course_grade;
  input.entrance_grade = req.body.entrance_grade;
  input.check_grade = req.body.check_grade;
  input.process_grade = req.body.process_grade;
  input.result_grade = req.body.result_grade;
	sql = "SELECT raw_userinfo.pk AS userinfo_pk FROM raw_userinfo WHERE 1"
	where = '';
	temp_userinfo1 = [];
	temp_userinfo2 = [];
	temp_userinfo3 = [];
	if(input.gender!=''){
		where = where + " AND raw_userinfo.pk IN(SELECT raw_basicinfo.user_fk AS userinfo_pk FROM choice_basic, raw_basicinfo WHERE choice_basic.pk=raw_basicinfo.answer AND raw_basicinfo.question_fk=2 AND choice_basic.choice='" + input.gender + "' GROUP BY userinfo_pk ) ";
	}
	if(input.grade.length!=0){
		where = where + " AND raw_userinfo.pk IN(SELECT raw_basicinfo.user_fk AS userinfo_pk FROM choice_basic, raw_basicinfo WHERE choice_basic.pk=raw_basicinfo.answer AND raw_basicinfo.question_fk=3 AND choice_basic.choice IN('" + input.grade[0] + "'";
		for(var i=1; i<input.grade.length; i++){
			where = where + ", '" + input.grade[i] + "'";
		}
		where = where + ") GROUP BY userinfo_pk)";
	}
	if(input.field.length!=0){
		where = where + " AND raw_userinfo.pk IN(SELECT raw_basicinfo.user_fk AS userinfo_pk FROM choice_basic, raw_basicinfo WHERE choice_basic.pk=raw_basicinfo.answer AND raw_basicinfo.question_fk=4 AND choice_basic.choice IN('" + input.field[0] + "'";
		for(var i=1; i<input.field.length; i++){
			where = where + ", '" + input.field[i] + "'";
		}
		where = where + ") GROUP BY userinfo_pk)";
	}
	sql = sql + where + " GROUP BY raw_userinfo.pk";
	// console.log("sql1:" + sql);
	query = connection.query(sql, function(err, rows){
		if(err) throw err;
		for(var i=0; i<rows.length; i++){
			temp_userinfo1[i]=rows[i].userinfo_pk;
		}
		// console.log("1:"+temp_userinfo1);
		if(temp_userinfo1.length==0){
			res.json({msg:"No result."});
		}
		else{
		sql = "SELECT raw_userinfo.pk AS userinfo_pk FROM raw_userinfo WHERE raw_userinfo.pk IN("+temp_userinfo1+")"
		where = '';
		if(input.interesting_plan.length!=0){
	    where = where + " AND raw_userinfo.pk IN(SELECT raw_basicinfo.user_fk AS userinfo_pk FROM choice_basic, raw_basicinfo WHERE choice_basic.pk=raw_basicinfo.answer AND raw_basicinfo.question_fk=13 AND choice_basic.choice IN('" + input.interesting_plan[0] + "'";
	    for(var i=1; i<input.interesting_plan.length; i++){
	      where = where + ", '" + input.interesting_plan[i] + "'";
	    }
	    where = where + ") GROUP BY userinfo_pk)";
	  }
	  if(input.attainment!=''){
	    where = where + " AND raw_userinfo.pk IN(SELECT raw_basicinfo.user_fk AS userinfo_pk FROM choice_basic, raw_basicinfo WHERE choice_basic.pk=raw_basicinfo.answer AND raw_basicinfo.question_fk=7 AND choice_basic.choice='" + input.attainment + "' GROUP BY userinfo_pk)";
	  }
	  if(input.goal_reason.length!=0){
	    where = where + " AND raw_userinfo.pk IN(SELECT raw_basicinfo.user_fk AS userinfo_pk FROM choice_basic, raw_basicinfo WHERE choice_basic.pk=raw_basicinfo.answer AND raw_basicinfo.question_fk=15 AND choice_basic.choice IN('" + input.goal_reason[0] + "'";
	    for(var i=1; i<input.goal_reason.length; i++){
	      where = where + ", '" + input.goal_reason[i] + "'";
	    }
	    where = where + ") GROUP BY userinfo_pk)";
	  }
		sql = sql + where + " GROUP BY raw_userinfo.pk";
		// console.log("sql2:" + sql);
		query = connection.query(sql, temp_userinfo1, function(err, rows){
			if(err) throw err;
			for(var i=0; i<rows.length; i++){
				temp_userinfo2[i]=rows[i].userinfo_pk;
			}
			// console.log("2:"+temp_userinfo2);
			if(temp_userinfo2.length==0){
				res.json({msg:"No result."});
			}
			else{
			sql = "SELECT raw_userinfo.pk AS userinfo_pk FROM raw_userinfo WHERE raw_userinfo.pk IN("+temp_userinfo2+")";
			where = '';
		  if(input.support!=''){
		    where = where + " AND raw_userinfo.pk IN(SELECT raw_aptitude.user_fk AS userinfo_pk FROM choice_aptitude, raw_aptitude WHERE choice_aptitude.pk=raw_aptitude.answer AND raw_aptitude.question_fk=109 AND choice_aptitude.choice='" + input.support + "' GROUP BY userinfo_pk)";
		  }
		  if(input.demand!=''){
		    where = where + " AND raw_userinfo.pk IN(SELECT raw_aptitude.user_fk AS userinfo_pk FROM choice_aptitude, raw_aptitude WHERE choice_aptitude.pk=raw_aptitude.answer AND raw_aptitude.question_fk=119 AND choice_aptitude.choice='" + input.demand + "' GROUP BY userinfo_pk)";
		  }
			sql = sql + where + " GROUP BY raw_userinfo.pk";
			// console.log("sql3:" + sql);
			query = connection.query(sql, temp_userinfo2, function(err, rows){
				if(err) throw err;
				for(var i=0; i<rows.length; i++){
					temp_userinfo3[i]=rows[i].userinfo_pk;
				}
				// console.log("3:"+temp_userinfo3);
				if(temp_userinfo3.length==0){
					res.json({msg:"No result."});
				}
				else{
				sql = "SELECT raw_userinfo.pk AS userinfo_pk, raw_user.name AS name, raw_user.birth AS birth, raw_userinfo.phone AS phone, raw_userinfo.count AS count, cal_behavior.best_score_cskd, cal_behavior.cw_score AS cw_score, cal_behavior.sw_score AS sw_score, cal_behavior.kw_score AS kw_score, cal_behavior.dw_score AS dw_score, cal_behavior.cw_best_keyword, cal_behavior.sw_best_keyword, cal_behavior.kw_best_keyword, cal_behavior.dw_best_keyword, cal_aptitude.best_score_pnc, cal_aptitude.pnc_A AS pnc_A, cal_aptitude.pnc_B AS pnc_B, cal_aptitude.pnc_C AS pnc_C, cal_aptitude.pnc_D AS pnc_D, cal_aptitude.pnc_E AS pnc_E, cal_aptitude.pnc_F AS pnc_F, cal_aptitude.best_score_stress, cal_aptitude.stress_A AS stress_A, cal_aptitude.stress_B AS stress_B, cal_aptitude.stress_C AS stress_C, cal_aptitude.stress_D AS stress_D, cal_aptitude.stress_E AS stress_E, cal_aptitude.stress_F AS stress_F, cal_aptitude.stress_G AS stress_G, cal_aptitude.stress_H AS stress_H, cal_balance.learning_score, cal_balance.course_score, cal_balance.entrance_score, cal_balance.check_score, cal_balance.process_score, cal_balance.result_score, cal_balance.learning_best, cal_balance.course_best, cal_balance.entrance_best FROM raw_user, raw_userinfo, cal_behavior, cal_aptitude, cal_balance, raw_group WHERE raw_userinfo.pk IN("+temp_userinfo3+") AND raw_user.pk=raw_userinfo.user_fk AND cal_behavior.user_fk=raw_userinfo.pk AND cal_aptitude.user_fk=raw_userinfo.pk AND cal_balance.user_fk=raw_userinfo.pk";
				where = '';
				if(input.groups.length!=0){
			    where = where + " AND raw_userinfo.group_fk=raw_group.pk AND raw_group.name IN('" + input.groups[0] + "'";
			    for(var i=1; i<input.groups.length; i++){
			      where = where + ", '" + input.groups[i] + "'";
			    }
			    where = where + ")";
			  }
			  if(input.best_score_cskd!=''){
			    where = where + " AND cal_behavior.best_score_cskd='" + input.best_score_cskd + "'";
			    if(input.best_type!=''){
			      if(input.best_score_cskd=='채움') where = where + " AND cal_behavior.cw_best_keyword='" + input.best_type + "'";
			      else if(input.best_score_cskd=='세움') where = where + " AND cal_behavior.sw_best_keyword='" + input.best_type + "'";
			      else if(input.best_score_cskd=='키움') where = where + " AND cal_behavior.kw_best_keyword='" + input.best_type + "'";
			      else if(input.best_score_cskd=='돋움') where = where + " AND cal_behavior.dw_best_keyword='" + input.best_type + "'";
			    }
			  }
			  if(input.pnc_best.length!=0){
			    where = where + " AND cal_aptitude.best_score_pnc IN('" + input.pnc_best[0] + "'";
			    for(var i=1; i<input.pnc_best.length; i++){
			      where = where + ", '" + input.pnc_best[i] + "'";
			    }
			    where = where + ")";
			  }
			  if(input.activity_helpful!=''){
			    where = where + " AND raw_userinfo.pk IN(SELECT raw_aptitude.user_fk AS userinfo_pk FROM choice_aptitude, raw_aptitude WHERE choice_aptitude.pk-raw_aptitude.answer AND raw_aptitude.question_fk=" + input.activity_helpful + " AND raw_aptitude.answer=1 GROUP BY userinfo_pk)";
			  }
			  if(input.activity_wish!=''){
			    where = where + " AND raw_userinfo.pk IN(SELECT raw_aptitude.user_fk AS userinfo_pk FROM choice_aptitude, raw_aptitude WHERE choice_aptitude.pk-raw_aptitude.answer AND raw_aptitude.question_fk=" + input.activity_wish + " AND raw_aptitude.answer=1 GROUP BY userinfo_pk)";
			  }
			  if(input.learning_grade!=''){
			    where = where + " AND cal_balance.learning_score >=" + min_score[input.learning_grade[0]] + " AND cal_balance.learning_score <=" + max_score[input.learning_grade[1]];
			  }
			  if(input.course_grade!=''){
			    where = where + " AND cal_balance.course_score >=" + min_score[input.course_grade[0]] + " AND cal_balance.course_score <=" + max_score[input.course_grade[1]];
			  }
			  if(input.entrance_grade!=''){
			    where = where + " AND cal_balance.entrance_score >=" + min_score[input.entrance_grade[0]] + " AND cal_balance.entrance_score <=" + max_score[input.entrance_grade[1]];
			  }
			  if(input.check_grade!=''){
			    where = where + " AND cal_balance.check_score >=" + min_score[input.check_grade[0]] + " AND cal_balance.check_score <=" + max_score[input.check_grade[1]];
			  }
			  if(input.process_grade!=''){
			    where = where + " AND cal_balance.process_score >=" + min_score[input.process_grade[0]] + " AND cal_balance.process_score <=" + max_score[input.process_grade[1]];
			  }
			  if(input.result_grade!=''){
			    where = where + " AND cal_balance.result_score >=" + min_score[input.result_grade[0]] + " AND cal_balance.result_score <=" + max_score[input.result_grade[1]];
			  }
			  sql = sql + where + " GROUP BY raw_userinfo.pk";
				result = {};
				// console.log("sql4:" + sql);
				var query = connection.query(sql, temp_userinfo3, function(err, rows){
			    if(err) throw err;
					if(rows.length==0){
						res.json({msg:"No result."});
					}
					else{
						result.msg = "Complete.";
						result.students=rows;
						var userinfo_pk = [];
						for(var i=0; i<rows.length; i++){
							userinfo_pk[i] = rows[i].userinfo_pk;
						}
						saved_rows=rows;
						// console.log("4:"+userinfo_pk);
						sql = "SELECT raw_basicinfo.question_fk, script_basicinfo.script AS question, script_basicinfo.category AS category_high, '' AS category_low, raw_basicinfo.answer AS answer_pk, choice_basic.choice AS answer	FROM script_basicinfo, choice_basic, raw_basicinfo WHERE raw_basicinfo.question_fk = script_basicinfo.pk AND raw_basicinfo.answer = choice_basic.pk AND raw_basicinfo.user_fk IN("+userinfo_pk+")	UNION ALL SELECT raw_aptitude.question_fk, script_aptitude.script AS question, script_aptitude.category_high AS category_high, script_aptitude.category_low AS category_low, raw_aptitude.answer AS answer_pk, choice_aptitude.choice AS answer FROM script_aptitude, choice_aptitude, raw_aptitude WHERE raw_aptitude.user_fk IN("+userinfo_pk+") AND raw_aptitude.question_fk = script_aptitude.pk AND ( (raw_aptitude.answer = choice_aptitude.pk AND raw_aptitude.answer>=1) OR (raw_aptitude.answer < 1 AND raw_aptitude.answer+2 = choice_aptitude.pk) ) UNION ALL SELECT raw_balance.question_fk, script_balance.script AS question, script_balance.category AS category_high, '' AS category_low, raw_balance.answer AS answer_pk, choice_balance.result AS answer FROM script_balance, choice_balance, raw_balance	WHERE raw_balance.user_fk IN("+userinfo_pk+") AND raw_balance.question_fk = script_balance.sequence AND raw_balance.answer = choice_balance.pk ORDER BY category_high ASC"
						// console.log(sql);
						var query = connection.query(sql, function(err, rows){
							if(err) throw err;
							result.interesting_plan = {learning_count:0, course_count:0, entrance_count:0};
							var nv = {contents:'', count:0};
							var connect_uns = {'매우 높아요':5, 높아요:4, 보통이에요:3, 낮아요:2, '매우 낮아요':1};
							var connect_snd = {'매우 높아요':'a', 높아요:'b', 보통이에요:'c', 낮아요:'d', '매우 낮아요':'e'};
							var connect_snd_object = {'나(자신 스스로)':'a', '부모님':'b', 선배:'c', 친구:'d', 학교선생님:'e', '학원,과외선생님':'f', 형제:'g', 후배:'h'};
							var connect_more_needs = {'응원(지지)이 더 필요해요':'support', '요구가 더 필요해요':'demand', '현재 상황에 만족해요':'satisfied'};
							var connect_activity_helpful = {'강연,행사,박람회':'a', '공모전 참가':'b', '교내,외 동아리':'c', '교내,외 멘토링':'d', '독서,연구활동':'e', '자격증 취득':'f', '종합 컨설팅':'g', '학원,온라인 강의 수강':'h'};
							var connect_activity_wish = {'논,구술 대비':'a', '독서활동':'b', '동아리활동':'c', '면접 대비':'d', '생활기록부,자기소개서':'e', '자기주도학습':'f', '전문가 멘토링':'g', '종합 컨설팅':'h', '진로정보':'i', '진학정보':'j', '포트폴리오':'k', '학습법,필기법':'l'};
							var connect_balance = [0, 0, 0, 1, 0, 2, 3, 4, 5, 0, 6, 0, 7, 8, 9, 10, 0, 0, 0, 0, 11, 12, 13, 14, 0, 15, 16, 17, 18, 19, 20, 0, 0, 21, 22, 23, 24, 0, 0, 25, 0, 26, 27, 28, 0, 29, 0, 30, 0];
							result.field = {a:0, b:0, c:0, d:0, e:0, f:0, g:0, h:0, i:0, j:0};
							result.occupation = {a:0, b:0, c:0, d:0, e:0, f:0, g:0, h:0, i:0, j:0, k:0, l:0, m:0, n:0, o:0};
							result.goal_achieve_way = {a:0, b:0, c:0, d:0, e:0, f:0, g:0};
							result.goal_achieve_element = {a:0, b:0, c:0, d:0, e:0, f:0, g:0, h:0, i:0, j:0};
							result.goal_completion_period = {short:0, middle:0, long:0};
							result.goal_reason = {attention:0, practice:0, purpose:0, wish:0};
							result.average_uns = {grade:0, course:0, self_care:0, relationship:0, balance:0};
							result.count_support = {a:0, b:0, c:0, d:0, e:0};
							result.count_support_object = {a:0, b:0, c:0, d:0, e:0, f:0, g:0, h:0};
							result.count_demand = {a:0, b:0, c:0, d:0, e:0};
							result.count_demand_object = {a:0, b:0, c:0, d:0, e:0, f:0, g:0, h:0};
							result.more_needs = {support:0, demand:0, satisfied:0};
							result.activity_helpful = {a:0, b:0, c:0, d:0, e:0, f:0, g:0, h:0};
							result.activity_wish = {a:0, b:0, c:0, d:0, e:0, f:0, g:0, h:0, i:0, j:0, k:0, l:0};
							result.score_questions = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
							for(var i=0; i<rows.length; i++){
								if(rows[i].category_high=='3_목표설정정보' && rows[i].question_fk==13){
									if(rows[i].answer=='학습플래닝(학습이력관리,교과별 학습법)') result.interesting_plan.leaning_count++;
									else if(rows[i].answer=='진로플래닝(진로포트폴리오,연구 및 동아리 활동 기획)') result.interesting_plan.course_count++;
									else if(rows[i].answer=='진학플래닝(생활기록부,자기소개서)') result.interesting_plan.entrance_count++;
								}
								if(rows[i].category_high=='1_기본정보' && rows[i].question_fk==4){
									if(rows[i].answer=='간호,의학') result.field.a++;
									else if(rows[i].answer=='경영') result.field.b++;
									else if(rows[i].answer=='공학') result.field.c++;
									else if(rows[i].answer=='교육') result.field.d++;
									else if(rows[i].answer=='법학') result.field.e++;
									else if(rows[i].answer=='사회과학') result.field.f++;
									else if(rows[i].answer=='예,체능') result.field.g++;
									else if(rows[i].answer=='인문') result.field.h++;
									else if(rows[i].answer=='자연과학') result.field.i++;
									else if(rows[i].answer=='아직 결정하지 못했어요') result.field.j++;
								}
								if(rows[i].category_high=='1_기본정보' && rows[i].question_fk==5){
									if(rows[i].answer=='경영,사무') result.occupation.a++;
									else if(rows[i].answer=='영업,고객상담') result.occupation.b++;
									else if(rows[i].answer=='IT,인터넷') result.occupation.c++;
									else if(rows[i].answer=='디자인') result.occupation.d++;
									else if(rows[i].answer=='전기,기계') result.occupation.e++;
									else if(rows[i].answer=='서비스') result.occupation.f++;
									else if(rows[i].answer=='연구,개발,전문직') result.occupation.g++;
									else if(rows[i].answer=='의료') result.occupation.h++;
									else if(rows[i].answer=='생산,제조') result.occupation.i++;
									else if(rows[i].answer=='건설,건축') result.occupation.j++;
									else if(rows[i].answer=='유통,무역') result.occupation.k++;
									else if(rows[i].answer=='미디어') result.occupation.l++;
									else if(rows[i].answer=='교수,교사') result.occupation.m++;
									else if(rows[i].answer=='특수계층,공공') result.occupation.n++;
									else if(rows[i].answer=='아직 결정하지 못했어요') result.occupation.o++;
								}
								if(rows[i].category_high=='2_경험이력정보' && rows[i].question_fk==9){
									if(rows[i].answer=='문제풀이') result.goal_achieve_way.a++;
									else if(rows[i].answer=='발명,실험') result.goal_achieve_way.b++;
									else if(rows[i].answer=='생활관리') result.goal_achieve_way.c++;
									else if(rows[i].answer=='암기') result.goal_achieve_way.d++;
									else if(rows[i].answer=='예술,체육') result.goal_achieve_way.e++;
									else if(rows[i].answer=='정보,개념습득') result.goal_achieve_way.f++;
									else if(rows[i].answer=='토론,발표') result.goal_achieve_way.g++;
								}
								if(rows[i].category_high=='2_경험이력정보' && rows[i].question_fk==10){
									if(rows[i].answer=='공동체') result.goal_achieve_element.a++;
									else if (rows[i].answer == '글로벌') result.goal_achieve_element.b++;
									else if (rows[i].answer == '리더십') result.goal_achieve_element.c++;
									else if (rows[i].answer == '문제해결') result.goal_achieve_element.d++;
									else if (rows[i].answer == '성적향상') result.goal_achieve_element.e++;
									else if (rows[i].answer == '심미적감성') result.goal_achieve_element.f++;
									else if (rows[i].answer == '의사소통') result.goal_achieve_element.g++;
									else if (rows[i].answer == '자기관리') result.goal_achieve_element.h++;
									else if (rows[i].answer == '지식정보처리') result.goal_achieve_element.i++;
									else if (rows[i].answer == '창의적사고') result.goal_achieve_element.j++;
								}
								if(rows[i].category_high=='3_목표설정정보' && rows[i].question_fk==14){
									if(rows[i].answer=='3개월 이내') result.goal_completion_period.short++;
									else if(rows[i].answer=='4개월~6개월') result.goal_completion_period.middle++;
									else if(rows[i].answer=='7개월 이상') result.goal_completion_period.long++;
								}
								if(rows[i].category_high=='3_목표설정정보' && rows[i].question_fk==15){
									if(rows[i].answer=='관심') result.goal_reason.attention++;
									else if(rows[i].answer=='연습') result.goal_reason.practice++;
									else if(rows[i].answer=='목적') result.goal_reason.purpose++;
									else if(rows[i].answer=='희망') result.goal_reason.hope++;
								}
								if(rows[i].category_high=='이해도만족도'){
									if(rows[i].category_low=='성적') result.average_uns.grade+=(connect_uns[rows[i].answer]/saved_rows.length);
									else if(rows[i].category_low=='진로') result.average_uns.course+=(connect_uns[rows[i].answer]/saved_rows.length);
									else if(rows[i].category_low=='자기관리') result.average_uns.self_care+=(connect_uns[rows[i].answer]/saved_rows.length);
									else if(rows[i].category_low=='대인관계') result.average_uns.relationship+=(connect_uns[rows[i].answer]/saved_rows.length);
									else if(rows[i].category_low=='밸런스') result.average_uns.balance+=(connect_uns[rows[i].answer]/saved_rows.length);
								}
								if(rows[i].category_high=='지지와요구'){
									if(rows[i].category_low=='지지정도') result.count_support[connect_snd[rows[i].answer]]++;
									else if(rows[i].category_low=='지지대상') result.count_support_object[connect_snd_object[rows[i].question]]+=rows[i].answer_pk;
									else if(rows[i].category_low=='요구정도') result.count_demand[connect_snd[rows[i].answer]]++;
									else if(rows[i].category_low=='요구대상') result.count_demand_object[connect_snd_object[rows[i].question]]+=rows[i].answer_pk;
									else result.more_needs[connect_more_needs[rows[i].answer]]++;
								}
								if(rows[i].category_high=='도움이된') result.activity_helpful[connect_activity_helpful[rows[i].question]]+=rows[i].answer_pk;
								if(rows[i].category_high=='도움받을') result.activity_wish[connect_activity_wish[rows[i].question]]+=rows[i].answer_pk;
								if(rows[i].category_high=='학습' || rows[i].category_high=='진로' || rows[i].category_high=='진학'){
									result.score_questions[connect_balance[rows[i].question_fk]]+=((rows[i].answer_pk/saved_rows.length)*20);
								}
							}
							result.best_score_cskd = {cw:0, sw:0, kw:0, dw:0}
							result.best_type = {cw_A:0, cw_B:0, cw_C:0, cw_D:0, cw_E:0, sw_A:0, sw_B:0, sw_C:0, sw_D:0, sw_E:0, kw_A:0, kw_B:0, kw_C:0, kw_D:0, kw_E:0, dw_A:0, dw_B:0, dw_C:0, dw_D:0, dw_E:0}
							result.average_score_cskd = {cw:0, sw:0, kw:0, dw:0}
							result.average_pnc = {a:0, b:0, c:0, d:0, e:0, f:0};
							result.count_stress = {a:0, b:0, c:0, d:0, e:0, f:0, g:0, h:0};
							result.average_balance = {learning:0, course:0, entrance:0, total:0};
							result.average_balance2 = {check:0, process:0, result:0, total:0};
							var connect_cskd = {채움:'cw', 세움:'sw', 키움:'kw', 돋움:'dw'};
							var connect_type = {책임:'cw_A', 현실:'cw_B', 대비:'cw_C', 조언:'cw_D', 체계:'cw_E', 감정:'sw_A', 타인:'sw_B', 목표:'sw_C', 조화:'sw_D', 주제:'sw_E',	변화:'kw_A', 조작:'kw_B', 주체:'kw_C', 탐색:'kw_D', 합리:'kw_E', 창의:'dw_A', 예술:'dw_B', 자아:'dw_C', 활동:'dw_D', 분석:'dw_E',};
							var connect_stress = {언어:'a', 논리수학:'b', 시각공간:'c', 신체운동:'d', 음악:'e', 자연:'f', 자기이해:'g', 대인관계:'h'};
							for(var i=0; i<saved_rows.length; i++){
								result.best_score_cskd[connect_cskd[saved_rows[i].best_score_cskd]]++;
								result.best_type[connect_type[saved_rows[i].cw_best_keyword]]++;
								result.best_type[connect_type[saved_rows[i].sw_best_keyword]]++;
								result.best_type[connect_type[saved_rows[i].kw_best_keyword]]++;
								result.best_type[connect_type[saved_rows[i].dw_best_keyword]]++;
								result.average_score_cskd.cw += (saved_rows[i].cw_score / saved_rows.length);
								result.average_score_cskd.sw += (saved_rows[i].sw_score / saved_rows.length);
								result.average_score_cskd.kw += (saved_rows[i].kw_score / saved_rows.length);
								result.average_score_cskd.dw += (saved_rows[i].dw_score / saved_rows.length);
								result.average_pnc.a += (saved_rows[i].pnc_A / saved_rows.length);
								result.average_pnc.b += (saved_rows[i].pnc_B / saved_rows.length);
								result.average_pnc.c += (saved_rows[i].pnc_C / saved_rows.length);
								result.average_pnc.d += (saved_rows[i].pnc_D / saved_rows.length);
								result.average_pnc.e += (saved_rows[i].pnc_E / saved_rows.length);
								result.average_pnc.f += (saved_rows[i].pnc_F / saved_rows.length);
								result.count_stress[connect_stress[saved_rows[i].best_score_stress]]++;
								result.average_balance.learning += (saved_rows[i].learning_score / saved_rows.length);
								result.average_balance.course += (saved_rows[i].course_score / saved_rows.length);
								result.average_balance.entrance += (saved_rows[i].entrance_score / saved_rows.length);
								result.average_balance2.check += (saved_rows[i].check_score / saved_rows.length);
								result.average_balance2.process += (saved_rows[i].process_score / saved_rows.length);
								result.average_balance2.result += (saved_rows[i].result_score / saved_rows.length);
							}
							result.average_balance.total = (result.average_balance.learning + result.average_balance.course + result.average_balance.entrance)/3;
							result.average_balance2.total = (result.average_balance2.check + result.average_balance2.process + result.average_balance2.result)/3;
							res.json(result);
						});
					}
			  });
			}
			});
		}
		});
	}
	});
});

module.exports = router;
