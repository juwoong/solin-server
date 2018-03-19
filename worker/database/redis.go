package database

import (
	"gopkg.in/redis.v3"
)

var redis *redis.Client

func CreateRedis() *redis.Client {
	if redis == nil {
		redis = redis.NewClient(&redis.Options{
			Addr:     "localhost:6379",
			Password: "",
			DB:       0,
		})
	}

	return redis
}
