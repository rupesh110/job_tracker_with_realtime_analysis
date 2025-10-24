package repositories

import (
	"backend/config"
	"backend/models"
	"backend/queries"
	"fmt"
)

func CreateJob(job *models.Job) error {
	return config.DB.QueryRow(
		queries.InsertJob,
		job.UserID,
		job.Company,
		job.Title,
		job.Location,
		job.Platform,
		job.Status,
		job.UpdatedAt,
		job.WorkType,
		job.URL,
		job.Notes,
	).Scan(&job.ID)
}

func GetJobsByUser(userID string) ([]models.Job, error) {
	rows, err := config.DB.Query(queries.GetJobsByUser, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jobs []models.Job
	for rows.Next() {
		var j models.Job
		if err := rows.Scan(
			&j.ID,
			&j.UserID,
			&j.Company,
			&j.Title,
			&j.Location,
			&j.Platform,
			&j.Status,
			&j.UpdatedAt,
			&j.WorkType,
			&j.URL,
			&j.Notes,
		); err != nil {
			return nil, err
		}
		jobs = append(jobs, j)
	}

	return jobs, nil
}

func UpdateJob(job *models.Job) error {
	result, err := config.DB.Exec(
		queries.UpdateJob,
		job.Status,
		job.UpdatedAt,
		job.Notes,
		job.ID,
		job.UserID,
	)
	if err != nil {
		return err
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("no job found with id=%s for user_id=%s", job.ID, job.UserID)
	}
	return nil
}

func DeleteJob(jobID, userID string) error {
	result, err := config.DB.Exec(queries.DeleteJob, jobID, userID)
	if err != nil {
		return err
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("no job found with id=%s for user_id=%s", jobID, userID)
	}
	return nil
}
