package models

import (
	"time"
)

type Job struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Company   string    `json:"company"`
	Title     string    `json:"title"`
	Location  string    `json:"location"`
	Platform  string    `json:"platform"`
	Status    string    `json:"status"`
	Date      string    `json:"date"`
	UpdatedAt time.Time `json:"updated_at"`
	WorkType  string    `json:"work_type"`
	URL       string    `json:"url"`
	Notes     string    `json:"notes,omitempty"`
}
