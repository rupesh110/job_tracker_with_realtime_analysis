package models

import (
	"time"
)

type RateLimit struct {
	Token       string    `json:"token"`
	WindowStart time.Time `json:"window_start"`
	Count       int       `json:"count"`
}
