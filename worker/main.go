/**
* Solin Report Worker
* Developed by Ju Woong Bae,
*
* Do this :
* Select comment of the week
* Assign scores to user activities
* -selected through mean and standard deviation indexes
**/

package main

import (
	db "./database"
	"./libs"
	"./structs"
	"fmt"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
	"os"
	"sync"
	"time"
)

var reportname string
var monthly bool
var moment time.Time
var duration float64

var wg sync.WaitGroup

func CalculateReport(goalId bson.ObjectId, userId bson.ObjectId, user structs.UserInGoal, c *mgo.Collection) {
	defer wg.Done()
	var report structs.Report
	report.Name = reportname
	report.Monthly = monthly
	report.GenerateAt = moment

	/**
	* @Total : 급간 체크를 위한 점수
	* @average : 그냥 평균...
	* @count : 몇회 했는지 환산점수
	* @fail : 실패 리스트
	**/

	report.Total = libs.ResultScore(user.Result, duration)
	report.Average = libs.Average(user.Result, duration)
	report.Fail, _ = libs.ReasonPercentage(user.Result, duration)
	report.Count = libs.Amount(user, duration)
	report.Result = libs.Array(user.Result, duration)

	query := bson.M{"goalId": goalId, "userId": userId}
	change := bson.M{"$push": bson.M{"report": &report}}

	if err := c.Update(query, change); err != nil {
		fmt.Println("Update ERROR")
		panic(err)
	}

	//Get GCM Key from Redis
	redis := db.CreateRedis()
	gcmKey, err := redis.Get(userId.String()).Result()
	if err != nil {
		panic(err)
	}

	fmt.Println(report)
}

//One user in one goal..
func generateReport(c *mgo.Collection) {
	var result []structs.Goal

	err := c.Find(bson.M{}).All(&result)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	resCol := db.GetCollection("test", "reports")

	for _, i := range result {
		for _, j := range i.Users {
			wg.Add(1)
			go CalculateReport(i.Id, j.Id, j, resCol)
			//fmt.Println(i.Name, ", ", j.Name)
		}
	}
	wg.Wait()
}

func main() {
	c := db.GetCollection("test", "goals")
	if c == nil {
		os.Exit(1)
	}
	defer db.FreeSession()
	var durate int
	reportname, monthly, durate = libs.GetReportName()
	moment = libs.GetNow()

	if monthly == true {
		durate *= 7
	} else {
		durate = 7
	}

	duration = float64(durate)
	generateReport(c)
}
