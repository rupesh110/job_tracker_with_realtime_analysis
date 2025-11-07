package models

type Session struct {
	ID        string `json:"id"`
	Status    string `json:"status"`
	Email     string `json:"email,omitempty"`
	Token     string `json:"token,omitempty"`
	UserID    string `json:"userID,omitempty"`
	CreatedAt int64  `json:"created_at"`
}
