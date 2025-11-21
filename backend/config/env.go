package config

import "os"

type AppConfig struct {
	WorkOSKey    string
	UpstashURL   string
	UpstashToken string
	Port         string
}

var Env AppConfig

func LoadEnv() {
	Env = AppConfig{
		WorkOSKey:    os.Getenv("WORKOS_API_KEY"),
		UpstashURL:   os.Getenv("UPSTASH_REDIS_REST_URL"),
		UpstashToken: os.Getenv("UPSTASH_REDIS_REST_TOKEN"),
		Port:         os.Getenv("PORT"),
	}
}
