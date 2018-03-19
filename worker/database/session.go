package database

import (
	"fmt"
	"gopkg.in/mgo.v2"
)

var session *mgo.Session

func GetCollection(db, collection string) *mgo.Collection {
	var err error
	if session == nil {
		session, err = mgo.Dial("mongodb://localhost:27017/test")
	}
	if err != nil {
		fmt.Println(err)
		return nil
	}

	session.SetMode(mgo.Monotonic, true)
	return session.DB(db).C(collection)
}

func FreeSession() {
	if session != nil {
		fmt.Println("끝!")
		session.Close()
		session = nil
	}
}
