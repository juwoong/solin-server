package libs

import (
	"../structs"
)

/*func TotalScore(userResult []structs.Result, duration float64) {
	dev, avg := deviation(userResult, duration)
}*/

//지속성 점수로 매기기
func ContinuousScore(userResult []structs.Result, duration float64) int {
	dev, _ := deviation(userResult, duration)

	if dev > 50 {
		dev = 50
	}

	return int(((50 - dev) / 50) * 100)
}

//도대체 얘는 몇개 실패한거야? 리스트로 보내기.
func ReasonPercentage(userResult []structs.Result, duration float64) ([4]int, int) {
	var result [4]int
	cnt := 0
	now := GetNow()
	for i := len(userResult) - 1; i >= 0; i-- {
		if (now.Sub(userResult[i].Date).Hours() / 24) > duration {
			break
		}

		if userResult[i].Reason != -1 {
			result[userResult[i].Reason]++
			cnt++
		}
	}

	return result, cnt
}

//결과값 계산하기 (개노답 ~ 개과천선)
func ResultScore(userResult []structs.Result, duration float64) int {
	sum := 0
	now := GetNow()
	for i := len(userResult) - 1; i >= 0; i-- {
		if (now.Sub(userResult[i].Date).Hours() / 24) > duration {
			break
		}

		if userResult[i].Percent > 100 {
			sum += 100
		} else {
			sum += userResult[i].Percent
		}
	}
	return int(float64(sum) / duration)
}

//총
func Amount(user structs.UserInGoal, duration float64) int {
	now := GetNow()
	sum := 0.0
	for i := len(user.Result) - 1; i >= 0; i-- {
		if (now.Sub(user.Result[i].Date).Hours() / 24) > duration {
			break
		}
		sum += (float64(user.Result[i].Percent) / 100.0) * float64(user.Target.Score)
	}

	return int(sum)
}
