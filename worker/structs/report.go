package structs

import (
	"gopkg.in/mgo.v2/bson"
	"time"
)

type TotalComment struct {
	Main string `bson:"main"`
	Sub  string `bson:"sub"`
}

type Endurance struct {
	Main    string `bson:"main"`
	Sub     string `bson:"sub"`
	Percent int    `bson:"percent"`
}

type Report struct {
	Id           bson.ObjectId `bson:"_id,omitempty"`
	Monthly      bool          `bson:"isMonthly"`
	Name         string        `bson:"name"`
	GenerateAt   time.Time     `bson:"generateAt"`
	Result       []int         `bson:"result"`
	Total        int           `bson:"total"`
	TotalComment TotalComment  `bson:"totalCommnet"`
	Average      int           `bson:"average"`
	Count        int           `bson:"count"`
	Fail         [4]int        `bson:"fail"`
	Endurance    Endurance     `bson:"endurance"`
}

type ReportTemplete struct {
	Id     bson.ObjectId `bson:"_id,omitempty"`
	UserId bson.ObjectId `bson:"userId"`
	GoalId bson.ObjectId `bson:"goalId"`
	report []Report      `bson:"report"`
}
