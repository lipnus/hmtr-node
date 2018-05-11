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

var balance_weight = [
/*learning*/	[[0,0], [8, 9], [8, 9], [5, 6], [2, 10], [8, 9], [3, 7], [6, 10], [2, 4], [8, 10], [2, 3], [1, 7], [4, 9]],
/*course*/	[[0,0], [1, 4], [5, 9], [6, 7], [8, 10], [1, 4], [5, 9], [6, 7], [8, 3], [1, 10], [5, 9], [4, 7], [1, 10]],
/*entrance*/	[[0,0], [4, 10], [2, 7], [3, 6], [9, 1], [4, 10], [2, 7], [1, 3], [8, 9], [1, 8], [3, 7], [5, 9], [6, 10]]
];
var min_score = [0, 97,  91, 82, 68, 52, 37, 29, 23, 20];
var max_score = [0, 100, 97, 91, 82, 68, 52, 37, 29, 23];

var balance_learning = [
	[0, 50, 48, 44.5, 33.5, 29, 17, 11, 7.5, 5.5],
	[0, 40, 38, 34, 27, 15.5, 8.5, 4.5, 2.5, 2],
	[30, 27, 23, 14, 10, 7, 5, 4, 3.5]
];
var balance_course = [
	[0, 30, 29, 27.5, 24.5, 19.5, 11.5, 6.5, 3.5, 2],
	[0, 30, 28, 24.5, 20.5, 13, 9, 6.5, 4.5, 3.5],
	[0, 20, 19, 17, 14, 8, 5, 3, 2, 1]
];
var balance_entrance = [
	[0, 20, 19.5, 18.5, 16.5, 13.5, 7.5, 4.5, 2.5, 1.5],
	[0, 30, 28, 24.5, 20.5, 13, 9, 6.5, 4.5, 3.5],
	[0, 50, 46, 37.5, 26, 17.5, 13.5, 9.5, 6.5, 4.5]
];

var behavior_type = {
	cw : ['책임', '현실', '대비', '조언', '체계'],
	sw : ['감정', '타인', '목표', '조화', '주제'],
	kw : ['변화', '조작', '주체', '탐색', '합리'],
	dw : ['창의', '예술', '자아', '활동', '분석']
};

function find_max(A, B, C, D, E){
	var F = Math.max(A, B, C, D, E);
	if(A==F) return 0;
	else if(B==F) return 1;
	else if(C==F) return 2;
	else if(D==F) return 3;
	else return 4;
}
function find_max_array(A){
	var max=-1;
	for(var i=0; i<A.length; i++){
		max=Math.max(max, A[i]);
	}
	for(var i=0; i<A.length; i++){
		if(A[i]==max) return i;
	}
}
var bahavior_category = ['채움', '세움', '키움', '돋움'];
var pnc_category = ['실천', '주도', '열정', '계획', '창의', '관심'];
var stress_category = ['언어', '논리수학', '시각공간', '신체운동', '음악', '자연', '자기이해', '대인관계'];

router.post('/', function(req, res){
  var userinfo_pk = req.body.userinfo_pk;
  var query;
	var date = new Date();
  query = connection.query("UPDATE raw_userinfo SET raw_userinfo.finish='done' WHERE raw_userinfo.pk = ?", userinfo_pk, function(err, rows){
		if(err) throw err;
		result = {};
		//cal_behavior
		sql = 'SELECT script_behavior.category_high AS category_high, script_behavior.category_low AS category_low, choice_behavior.pk AS score FROM choice_behavior, raw_behavior, script_behavior WHERE raw_behavior.user_fk = ? AND script_behavior.pk=raw_behavior.question_fk AND raw_behavior.answer=choice_behavior.pk GROUP BY raw_behavior.question_fk';
		query = connection.query(sql, userinfo_pk, function(err, rows){
			if(err) throw err;

			for(var i=0; i<rows.length; i++){
				if(rows[i].category_high=='채움'){
					if(result.cw_score == undefined) result.cw_score = 0;
					result.cw_score += rows[i].score;
					if(rows[i].category_low=='책임'){
						if(result.cw_ci_score == undefined) result.cw_ci_score = 0;
						result.cw_ci_score += rows[i].score;
					}
					if(rows[i].category_low=='현실'){
						if(result.cw_hs_score == undefined) result.cw_hs_score = 0;
						result.cw_hs_score += rows[i].score;
					}
					if(rows[i].category_low=='대비'){
						if(result.cw_db_score == undefined) result.cw_db_score = 0;
						result.cw_db_score += rows[i].score;
					}
					if(rows[i].category_low=='조언'){
						if(result.cw_ju_score == undefined) result.cw_ju_score = 0;
						result.cw_ju_score += rows[i].score;
					}
					if(rows[i].category_low=='체계'){
						if(result.cw_cg_score == undefined) result.cw_cg_score = 0;
						result.cw_cg_score += rows[i].score;
					}
				}
				if(rows[i].category_high=='세움'){
					if(result.sw_score == undefined) result.sw_score = 0;
					result.sw_score += rows[i].score;
					if(rows[i].category_low=='감정'){
						if(result.sw_gj_score == undefined) result.sw_gj_score = 0;
						result.sw_gj_score += rows[i].score;
					}
					if(rows[i].category_low=='타인'){
						if(result.sw_ti_score == undefined) result.sw_ti_score = 0;
						result.sw_ti_score += rows[i].score;
					}
					if(rows[i].category_low=='목표'){
						if(result.sw_mp_score == undefined) result.sw_mp_score = 0;
						result.sw_mp_score += rows[i].score;
					}
					if(rows[i].category_low=='조화'){
						if(result.sw_jh_score == undefined) result.sw_jh_score = 0;
						result.sw_jh_score += rows[i].score;
					}
					if(rows[i].category_low=='주제'){
						if(result.sw_jj_score == undefined) result.sw_jj_score = 0;
						result.sw_jj_score += rows[i].score;
					}
				}
				if(rows[i].category_high=='키움'){
					if(result.kw_score == undefined) result.kw_score = 0;
					result.kw_score += rows[i].score;
					if(rows[i].category_low=='변화'){
						if(result.kw_bh_score == undefined) result.kw_bh_score = 0;
						result.kw_bh_score += rows[i].score;
					}
					if(rows[i].category_low=='조작'){
						if(result.kw_jj_score == undefined) result.kw_jj_score = 0;
						result.kw_jj_score += rows[i].score;
					}
					if(rows[i].category_low=='주체'){
						if(result.kw_jc_score == undefined) result.kw_jc_score = 0;
						result.kw_jc_score += rows[i].score;
					}
					if(rows[i].category_low=='탐색'){
						if(result.kw_ts_score == undefined) result.kw_ts_score = 0;
						result.kw_ts_score += rows[i].score;
					}
					if(rows[i].category_low=='합리'){
						if(result.kw_hl_score == undefined) result.kw_hl_score = 0;
						result.kw_hl_score += rows[i].score;
					}
				}
				if(rows[i].category_high=='돋움'){
					if(result.dw_score == undefined) result.dw_score = 0;
					result.dw_score += rows[i].score;
					if(rows[i].category_low=='창의'){
						if(result.dw_ce_score == undefined) result.dw_ce_score = 0;
						result.dw_ce_score += rows[i].score;
					}
					if(rows[i].category_low=='예술'){
						if(result.dw_ys_score == undefined) result.dw_ys_score = 0;
						result.dw_ys_score += rows[i].score;
					}
					if(rows[i].category_low=='자아'){
						if(result.dw_ja_score == undefined) result.dw_ja_score = 0;
						result.dw_ja_score += rows[i].score;
					}
					if(rows[i].category_low=='활동'){
						if(result.dw_hd_score == undefined) result.dw_hd_score = 0;
						result.dw_hd_score += rows[i].score;
					}
					if(rows[i].category_low=='분석'){
						if(result.dw_bs_score == undefined) result.dw_bs_score = 0;
						result.dw_bs_score += rows[i].score;
					}
				}
			}
			result.cw_best_keyword = behavior_type.cw[find_max(result.cw_ci_score, result.cw_hs_score, result.cw_db_score, result.cw_ju_score, result.cw_cg_score)];
			result.sw_best_keyword = behavior_type.sw[find_max(result.sw_gj_score, result.sw_ti_score, result.sw_mp_score, result.sw_jh_score, result.sw_jj_score)];
			result.kw_best_keyword = behavior_type.kw[find_max(result.kw_bh_score, result.kw_jj_score, result.kw_jc_score, result.kw_ts_score, result.kw_hl_score)];
			result.dw_best_keyword = behavior_type.dw[find_max(result.dw_ce_score, result.dw_ys_score, result.dw_ja_score, result.dw_hd_score, result.dw_bs_score)];
			sql2 = 'INSERT INTO cal_behavior SET ?';
			result.cw_score *= 4; result.cw_score /= 3; result.cw_score = Math.round(result.cw_score*1000)/1000;
			result.sw_score *= 4; result.sw_score /= 3;	result.sw_score = Math.round(result.sw_score*1000)/1000;
			result.kw_score *= 4; result.kw_score /= 3; result.kw_score = Math.round(result.kw_score*1000)/1000;
			result.dw_score *= 4; result.dw_score /= 3; result.dw_score = Math.round(result.dw_score*1000)/1000;
			result.best_score_cskd=bahavior_category[find_max(result.cw_score, result.sw_score, result.kw_score, result.dw_score, 0)];
			factor = {user_fk:userinfo_pk, best_score_cskd:result.best_score_cskd,
				cw_score:result.cw_score, sw_score:result.sw_score, kw_score:result.kw_score, dw_score:result.dw_score,
				cw_best_keyword:result.cw_best_keyword, sw_best_keyword:result.sw_best_keyword, kw_best_keyword:result.kw_best_keyword, dw_best_keyword:result.dw_best_keyword};
			query = connection.query(sql2, factor, function(err, row){
				if(err) throw err;
			});
		}); // 학습행동유형 (II) caldata 테이블 입력

		result2 = {};
		//cal_aptitude
		sql = 'SELECT script_aptitude.script AS question, script_aptitude.category_high AS category_high, script_aptitude.category_low AS category_low, raw_aptitude.answer AS answer FROM script_aptitude, raw_aptitude WHERE raw_aptitude.user_fk = ? AND raw_aptitude.question_fk = script_aptitude.pk';
		query = connection.query(sql, userinfo_pk, function(err, rows){
			if(err) throw err;
			result2.pnc_A = result2.pnc_B = result2.pnc_C = result2.pnc_D = result2.pnc_E = result2.pnc_F = 0;
			result2.stress_A = result2.stress_B = result2.stress_C = result2.stress_D = result2.stress_E = result2.stress_F = result2.stress_G = result2.stress_H = 0;
			for(let i=0; i<rows.length; i++){
				if(rows[i].category_high == '장단점'){
					if(rows[i].category_low == '실천'){
						if(rows[i].answer != 0){
							if(result2.pnc_A == undefined) result2.pnc_A = 0;
							result2.pnc_A +=1;
						}
					}
					else if(rows[i].category_low == '주도'){
						if(rows[i].answer != 0){
							if(result2.pnc_B == undefined) result2.pnc_B = 0;
							result2.pnc_B +=1;
						}
					}
					else if(rows[i].category_low == '열정'){
						if(rows[i].answer != 0){
							if(result2.pnc_C == undefined) result2.pnc_C = 0;
							result2.pnc_C +=1;
						}
					}
					else if(rows[i].category_low == '계획'){
						if(rows[i].answer != 0){
							if(result2.pnc_D == undefined) result2.pnc_D = 0;
							result2.pnc_D +=1;
						}
					}
					else if(rows[i].category_low == '창의'){
						if(rows[i].answer != 0){
							if(result2.pnc_E == undefined) result2.pnc_E = 0;
							result2.pnc_E +=1;
						}
					}
					else if(rows[i].category_low == '관심'){
						if(rows[i].answer != 0){
							if(result2.pnc_F == undefined) result2.pnc_F = 0;
							result2.pnc_F +=1;
						}
					}
				}
				if(rows[i].category_high == '스트레스'){
					if(rows[i].category_low == '언어' && rows[i].answer == 1){
						if(result2.stress_A == undefined) result2.stress_A = 0;
						result2.stress_A +=1;
					}
					else if(rows[i].category_low == '논리수학' && rows[i].answer == 1){
						if(result2.stress_B == undefined) result2.stress_B = 0;
						result2.stress_B +=1;
					}
					else if(rows[i].category_low == '시각공간' && rows[i].answer == 1){
						if(result2.stress_C == undefined) result2.stress_C = 0;
						result2.stress_C +=1;
					}
					else if(rows[i].category_low == '신체운동' && rows[i].answer == 1){
						if(result2.stress_D == undefined) result2.stress_D = 0;
						result2.stress_D +=1;
					}
					else if(rows[i].category_low == '음악' && rows[i].answer == 1){
						if(result2.stress_E == undefined) result2.stress_E = 0;
						result2.stress_E +=1;
					}
					else if(rows[i].category_low == '자연' && rows[i].answer == 1){
						if(result2.stress_F == undefined) result2.stress_F = 0;
						result2.stress_F +=1;
					}
					else if(rows[i].category_low == '자기이해' && rows[i].answer == 1){
						if(result2.stress_G == undefined) result2.stress_G = 0;
						result2.stress_G +=1;
					}
					else if(rows[i].category_low == '대인관계' && rows[i].answer == 1){
						if(result2.stress_H == undefined) result2.stress_H = 0;
						result2.stress_H +=1;
					}
				}
			}
			result2.best_score_pnc = pnc_category[find_max_array([result2.pnc_A, result2.pnc_B, result2.pnc_C, result2.pnc_D, result2.pnc_E, result2.pnc_F])];
			result2.best_score_stress = stress_category[find_max_array([result2.stress_A, result2.stress_B, result2.stress_C, result2.stress_D, result2.stress_E, result2.stress_F, result2.stress_G, result2.stress_H])];

			factor2 = {user_fk:userinfo_pk,
				best_score_pnc:result2.best_score_pnc,
				 pnc_A:result2.pnc_A,
				 pnc_B:result2.pnc_B,
				 pnc_C:result2.pnc_C,
				 pnc_D:result2.pnc_D,
				 pnc_E:result2.pnc_E,
				 pnc_F:result2.pnc_F,
				 best_score_stress:result2.best_score_stress,
				 stress_A:result2.stress_A,
				 stress_B:result2.stress_B,
				 stress_C:result2.stress_C,
				 stress_D:result2.stress_D,
				 stress_E:result2.stress_E,
				 stress_F:result2.stress_F,
				 stress_G:result2.stress_G,
				 stress_H:result2.stress_H};
			query = connection.query('INSERT INTO cal_aptitude SET ?', factor2, function(err, rows){
				if(err) throw err;
			});
		});

		//cal_balance
		sql = 'SELECT choice_basic.pk AS grade FROM choice_basic, raw_basicinfo WHERE raw_basicinfo.user_fk = ? AND raw_basicinfo.question_fk = 3 AND raw_basicinfo.answer=choice_basic.pk';
		query = connection.query(sql, userinfo_pk, function(err, rows){
			result.grade = rows[0].grade;
			result.month = date.getMonth();
			var quater, weight = 1.875;
			if(result.month <= 2) quater = 1;
			else if(result.month <= 5) quater = 2;
			else if(result.month <= 8) quater = 3;
			else if(result.month <= 11) quater = 4;
			if(result.grade <= 7){
				quater += 0;
				grade_temp = 0;
			}
			else if(result.grade == 8){
				quater += 4;
				grade_temp = 1;
			}
			else if(result.grade >= 9){
				quater += 8;
				grade_temp = 2;
			}
			sql = 'SELECT script_balance.category AS category, raw_balance.answer AS score FROM script_balance, raw_balance WHERE raw_balance.user_fk = ? AND script_balance.sequence = raw_balance.question_fk GROUP BY raw_balance.question_fk ORDER BY raw_balance.question_fk ASC';
			query = connection.query(sql, userinfo_pk, function(err, rows){
				if(err) throw err;
				result.learning_best_score = 0;
				result.learning_worst_score = 6;
				result.course_best_score = 0;
				result.course_worst_score = 6;
				result.entrance_best_score = 0;
				result.entrance_worst_score = 6;
				result.learning_score = result.course_score = result.entrance_score = 0;
				for(var i=0; i<rows.length; i++){
					if(i<10){
						if(result.learning_best_score < rows[i].score){
							result.learning_best = i+1;
							result.learning_best_score = rows[i].score;
						}
						if(result.learning_worst_score > rows[i].score){
							result.learning_worst = i+1;
							result.learning_worst_score = rows[i].score;
						}
						if(i+1 != balance_weight[0][quater][0] && i+1 != balance_weight[0][quater][1]) result.learning_score += (rows[i].score*weight);
						else result.learning_score += (rows[i].score*2.5);
					}
					else if(i<20){
						if(result.course_best_score < rows[i].score){
							result.course_best = i-9;
							result.course_best_score = rows[i].score;
						}
						if(result.course_worst_score > rows[i].score){
							result.course_worst = i-9;
							result.course_worst_score = rows[i].score;
						}
						if(i-9 != balance_weight[1][quater][0] && i-9 != balance_weight[1][quater][1]) result.course_score += (rows[i].score*weight);
						else result.course_score += (rows[i].score*2.5);
					}
					else if(i<30){
						if(result.entrance_best_score < rows[i].score){
							result.entrance_best = i-19;
							result.entrance_best_score = rows[i].score;
						}
						if(result.entrance_worst_score > rows[i].score){
							result.entrance_worst = i-19;
							result.entrance_worst_score = rows[i].score;
						}
						if(i-19 != balance_weight[2][quater][0] && i-19 != balance_weight[2][quater][1]) result.entrance_score += (rows[i].score*weight);
						else result.entrance_score += (rows[i].score*2.5);
					}
				}
				result.check_score = 2 * (rows[7].score + rows[8].score + rows[9].score + rows[11].score + rows[12].score + rows[20].score + rows[23].score + rows[25].score + rows[26].score + rows[28].score);
				result.process_score = 2 * (rows[4].score + rows[5].score + rows[6].score + rows[10].score + rows[13].score + rows[14].score + rows[15].score + rows[18].score + rows[21].score + rows[29].score);
				result.result_score = 2 * (rows[0].score + rows[1].score + rows[2].score + rows[3].score + rows[16].score + rows[17].score + rows[19].score + rows[22].score + rows[24].score + rows[27].score);
				for(var i=1; i<=9; i++){
					if(result.learning_score>=min_score[i] && result.learning_score<=max_score[i]) result.learning_grade = i;
					if(result.course_score>=min_score[i] && result.course_score<=max_score[i]) result.course_grade = i;
					if(result.entrance_score>=min_score[i] && result.entrance_score<=max_score[i]) result.entrance_grade = i;
					if(result.check_score>=min_score[i] && result.check_score<=max_score[i]) result.check_grade = i;
					if(result.process_score>=min_score[i] && result.process_score<=max_score[i]) result.process_grade = i;
					if(result.result_score>=min_score[i] && result.result_score<=max_score[i]) result.result_grade = i;
				}
				result.total_score_lce = balance_learning[grade_temp][result.learning_grade] + balance_course[grade_temp][result.course_grade] + balance_entrance[grade_temp][result.entrance_grade];
				result.total_score_cpr = balance_learning[grade_temp][result.check_grade] + balance_course[grade_temp][result.process_grade] + balance_entrance[grade_temp][result.result_grade];
				sql2 = 'INSERT INTO cal_balance SET ?';
				factor = {user_fk:userinfo_pk, learning_score:result.learning_score, course_score:result.course_score,
					 entrance_score:result.entrance_score, learning_best:result.learning_best, learning_worst:result.learning_worst,
					 course_best:result.course_best, course_worst:result.course_worst, entrance_best:result.entrance_best,
					 entrance_worst:result.entrance_worst, check_score:result.check_score, process_score:result.process_score,
					 result_score:result.result_score, total_score_lce:result.total_score_lce, total_score_cpr:result.total_score_cpr};
				query = connection.query(sql2, factor, function(err, rows){
					if(err) throw err;
				});
			});
		});
		var response = {result : "ok"};
		res.json(response);
	}); // 설문을 완료했으므로 raw_userinfo의 finish 항목을 done으로 바꿔준다.


});





module.exports = router;
