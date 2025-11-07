package models

type JobCreateRequest struct {
	UserID   string `json:"user_id"`
	Company  string `json:"company"`
	Title    string `json:"title"`
	Location string `json:"location"`
	Platform string `json:"platform"`
	Status   string `json:"status"`
	WorkType string `json:"work_type"`
	URL      string `json:"url"`
	Notes    string `json:"notes,omitempty"`
}
