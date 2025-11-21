package config

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"
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

// ✔ FIXED VERSION — uses correct Upstash REST format
func (r *RedisClient) Command(cmd string, args ...interface{}) (map[string]interface{}, error) {

	// Build raw command array for Upstash
	fullCmd := append([]interface{}{cmd}, args...)

	body, _ := json.Marshal(fullCmd)

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

// GET
func (r *RedisClient) Get(key string) (string, error) {
	res, err := r.Command("GET", key)
	if err != nil {
		return "", err
	}

	if res["result"] == nil {
		return "", nil
	}

	return res["result"].(string), nil
}

// SETEX
func (r *RedisClient) Set(key string, value string, ttl time.Duration) error {
	seconds := int(ttl.Seconds())

	res, err := r.Command("SETEX", key, seconds, value)
	log.Println("DEBUG Redis SETEX →", "Key:", key, "TTL:", seconds, "Result:", res, "Err:", err)

	return err
}

func (r *RedisClient) Del(key string) error {
	_, err := r.Command("DEL", key)
	return err
}
