package repositories

import (
	"backend/models"
)

type JobRepository interface {
	CreateJob(job *models.Job) error
	GetJobsByUser(userID string) ([]models.Job, error)
	UpdateJob(job *models.Job) error
	DeleteJob(jobID, userID string) error
	GetStatusByID(userID string) (map[string]int, error)
}

var JobRepo JobRepository
