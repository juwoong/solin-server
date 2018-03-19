package libs

import "time"
import "fmt"
import "strconv"

func GetNow() time.Time {
	now := time.Now()
	year, month, date := now.Date()
	return time.Date(year, month, date, 9, 0, 0, 0, now.Location())
}

func FormalizeTime(now time.Time) time.Time {
	year, month, date := now.Date()
	return time.Date(year, month, date, 9, 0, 0, 0, now.Location())
}

func GetReportName() (string, bool, int) {
	now := GetNow()
	korOrdinal := [6]string{"첫번째", "두번째", "세번째", "네번째", "다섯번째", "마지막"}
	month := GetNow().Month()
	cnt := 0
	final := false

	for {
		cnt++
		now = now.AddDate(0, 0, -7)
		fmt.Println(now.String())
		if month != now.Month() {
			if temp := GetNow().AddDate(0, 0, 7); temp.Month() != month {
				final = true
			}
			break
		}
	}
	if final == true {
		cnt = 6
	}

	return strconv.Itoa(int(month)) + "월 " + korOrdinal[cnt-1] + " 리포트", final, cnt
}
