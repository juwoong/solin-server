package structs

import (
	"gopkg.in/mgo.v2/bson"
	_ "time"
)

type Social struct {
	FacebookId string `bson:"facebookId"`
	KakaoId    string `bson:"kakaoId"`
}

type Activity struct {
	Image    string `bson:"image"`
	Info     string `bson:"info"`
	CreateAt string `bson:"createAt"`
}

type Item struct {
	Type  string `bson:"type"`
	Image string `bson:"image"`
	Name  string `bson:"name"`
}

type User struct {
	Id            bson.ObjectId   `bson:"_id,omitempty" json:"id"`
	RefreshToken  string          `bson:"refreshToken"`
	Social        Social          `bson:"social"`
	ProfileImage  string          `bson:"profileImage"`
	Name          string          `bson:"name"`
	StatusMessage string          `bson:"statusMessage"`
	CurrnetGoals  []bson.ObjectId `bson:"currentGoals"`
	Friends       []bson.ObjectId `bson:"friends"`
	Activities    []Activity      `bson:"activities"`
	Personality   string          `bson:"personality"`
}
