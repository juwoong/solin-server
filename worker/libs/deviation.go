package libs

import (
	"../structs"
	"fmt"
	"math"
)

//평균값 처리. 오늘 입력을 안하면 0처리.
func Average(userResult []structs.Result, duration float64) int {
	sum := 0
	now := GetNow()
	for i := len(userResult) - 1; i >= 0; i-- {
		if (now.Sub(userResult[i].Date).Hours() / 24) > duration {
			break
		}

		sum += userResult[i].Percent
	}
	return int(float64(sum) / duration)
}

//표준편차 값.
func deviation(userResult []structs.Result, duration float64) (int, int) {
	avg := Average(userResult, duration)
	sum := 0.0

	for _, value := range userResult {
		fmt.Println(value)
		sum += math.Pow(float64(value.Percent)-float64(avg), 2)
	}

	return int(math.Sqrt(sum / duration)), int(avg)
}
