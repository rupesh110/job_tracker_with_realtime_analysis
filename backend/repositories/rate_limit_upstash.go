package repositories

import (
	"fmt"
	"time"

	"backend/upstash"
)

type RateLimitRepository interface {
	Increment(key string, window time.Duration) (count int, ttl int, err error)
}

type UpstashRateLimitRepository struct {
	client *upstash.UpstashClient
}

func NewUpstashRateLimitRepository(url, token string) RateLimitRepository {
	return &UpstashRateLimitRepository{
		client: upstash.New(url, token),
	}
}

func (r *UpstashRateLimitRepository) Increment(key string, window time.Duration) (int, int, error) {
	// INCR key
	res, err := r.client.Post("/incr/"+key, nil)
	if err != nil {
		return 0, 0, fmt.Errorf("redis incr failed: %v", err)
	}

	// parse "result"
	floatVal, ok := res["result"].(float64)
	if !ok {
		return 0, 0, fmt.Errorf("unexpected incr response: %v", res)
	}
	count := int(floatVal)

	// First request → set expiry
	if count == 1 {
		ttlSeconds := int(window.Seconds())
		_, err := r.client.Post("/expire/"+key+"/"+fmt.Sprint(ttlSeconds), nil)
		if err != nil {
			return 0, 0, fmt.Errorf("expire failed: %v", err)
		}
	}

	// TTL
	ttlRes, err := r.client.Post("/ttl/"+key, nil)
	if err != nil {
		return 0, 0, fmt.Errorf("ttl failed: %v", err)
	}

	floatTTL, ok := ttlRes["result"].(float64)
	if !ok {
		// Upstash returns -1 or -2 sometimes
		return count, 0, nil
	}

	ttl := int(floatTTL)

	return count, ttl, nil
}
