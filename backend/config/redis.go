package config

import (
	"bytes"
	"encoding/json"
	"net/http"
	"os"
)

type RedisClient struct {
	Url   string
	Token string
}

var Redis *RedisClient

func InitRedis() {
	Redis = &RedisClient{
		Url:   os.Getenv("UPSTASH_REDIS_REST_URL"),
		Token: os.Getenv("UPSTASH_REDIS_REST_TOKEN"),
	}
}

func (r *RedisClient) Command(cmd string, args ...interface{}) (map[string]interface{}, error) {

	body, _ := json.Marshal(map[string]interface{}{
		"command": append([]interface{}{cmd}, args...),
	})

	req, _ := http.NewRequest("POST", r.Url, bytes.NewReader(body))
	req.Header.Set("Authorization", "Bearer "+r.Token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	return result, nil
}
