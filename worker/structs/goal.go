package structs

import (
	"gopkg.in/mgo.v2/bson"
	"time"
)

type Target struct {
	Score int    `bson:"score"`
	Type  string `bson:"type"`
}

type Result struct {
	Date    time.Time `bson:"date"`
	Reason  int       `bson:"result"`
	Percent int       `bson:"percent"`
}

type UserInGoal struct {
	Id           bson.ObjectId `bson:"Id"`
	Name         string        `bson:"name"`
	ProfileImage string        `bson:"profileImage"`
	Target       Target        `bson:"target"`
	StartAt      time.Time     `bson:"startAt"`
	Result       []Result      `bson:"result"`
}

type Goal struct {
	Id          bson.ObjectId `bson:"_id,omitempty" json:"id"`
	Name        string        `bson:"name"`
	StartDate   time.Time     `bson:"startDate"`
	EndDate     time.Time     `bson:"endDate"`
	Category    string        `bson:"category"`
	ThreeLegged bool          `bson:"threeLegged"`
	Users       []UserInGoal  `bson:"users"`
}
