package repositories

import (
	"backend/config"
	"backend/models"
	"backend/queries"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgconn"
)

func CreateJob(job *models.Job) error {
	err := config.DB.QueryRow(
		queries.InsertJob,
		job.UserID,
		job.Company,
		job.Title,
		job.Location,
		job.Platform,
		job.Status,
		job.Date,
		job.UpdatedAt,
		job.WorkType,
		job.URL,
		job.Notes,
	).Scan(&job.ID)

	if err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok && pgErr.Code == "23505" {
			return fmt.Errorf("job with this URL already exists for this user")
		}
		return err
	}

	return nil
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
			&j.Date,
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
	fields := []string{}
	values := []interface{}{}
	i := 1

	// Add only non-empty fields
	if job.Status != "" {
		fields = append(fields, fmt.Sprintf("status=$%d", i))
		values = append(values, job.Status)
		i++
	}

	if job.Notes != "" {
		fields = append(fields, fmt.Sprintf("notes=$%d", i))
		values = append(values, job.Notes)
		i++
	}

	if job.Date != "" {
		fields = append(fields, fmt.Sprintf("date=$%d", i))
		values = append(values, job.Date)
		i++
	}

	// Always update timestamp
	fields = append(fields, "updated_at=$"+fmt.Sprint(i))
	values = append(values, time.Now())
	i++

	// If no fields provided, skip update
	if len(fields) == 1 { // only updated_at
		return fmt.Errorf("no valid fields to update")
	}

	query := fmt.Sprintf(`
		UPDATE jobs
		SET %s
		WHERE id=$%d AND user_id=$%d;
	`, strings.Join(fields, ", "), i, i+1)

	values = append(values, job.ID, job.UserID)

	_, err := config.DB.Exec(query, values...)
	if err != nil {
		return fmt.Errorf("failed to update job: %v", err)
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

func GetStatusByID(userId string) (map[string]int, error) {
	rows, err := config.DB.Query(queries.GetStatusByID, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	statusCounts := make(map[string]int)
	for rows.Next() {
		var status string
		var count int
		if err := rows.Scan(&status, &count); err != nil {
			return nil, err
		}
		statusCounts[status] = count
	}
	return statusCounts, nil
}
