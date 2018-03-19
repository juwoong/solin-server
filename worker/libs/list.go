package libs

import (
	"../structs"
)

func Array(list []structs.Result, duration float64) []int {
	res := [50]int{}
	point := 0
	now := GetNow()
	var i int

	for i = len(list) - 1; i >= 0; i-- {
		if (now.Sub(list[i].Date).Hours() / 24) >= duration {
			break
		}
	}

	n := i
	loc := FormalizeTime(now.AddDate(0, 0, -int(duration)))

	for i = n; i < len(list); i++ {
		for list[i].Date.Sub(loc).Hours() > 24 {
			loc = loc.AddDate(0, 0, 1)
			point++
		}
		res[point] = list[i].Percent
		loc = loc.AddDate(0, 0, 1)
		point++
	}
	return res[:int(duration)]
}
