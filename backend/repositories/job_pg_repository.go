package repositories

import (
	"backend/config"
	"backend/models"
	"backend/queries"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgconn"
)

// PgRepository implements the JobRepository interface
type PgRepository struct {
	DB *sql.DB
}

// Constructor - uses global DB from config
func NewPgRepository() JobRepository {
	return &PgRepository{DB: config.DB}
}

// NewPgRepositoryWithDB - constructor with custom DB (for testing)
func NewPgRepositoryWithDB(db *sql.DB) JobRepository {
	return &PgRepository{DB: db}
}

// -----------------------------------
// CREATE JOB
// -----------------------------------
func (r *PgRepository) CreateJob(job *models.Job) error {
	err := r.DB.QueryRow(
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
		// Unique constraint violation
		if pgErr, ok := err.(*pgconn.PgError); ok && pgErr.Code == "23505" {
			return fmt.Errorf("job with this URL already exists for this user")
		}
		return err
	}

	return nil
}

// -----------------------------------
// GET JOBS BY USER
// -----------------------------------
func (r *PgRepository) GetJobsByUser(userID string) ([]models.Job, error) {
	rows, err := r.DB.Query(queries.GetJobsByUser, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jobs []models.Job

	for rows.Next() {
		var j models.Job
		err := rows.Scan(
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
		)
		if err != nil {
			return nil, err
		}

		jobs = append(jobs, j)
	}

	return jobs, nil
}

// -----------------------------------
// UPDATE JOB (dynamic fields)
// -----------------------------------
func (r *PgRepository) UpdateJob(job *models.Job) error {
	fields := []string{}
	values := []interface{}{}
	i := 1

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
	fields = append(fields, fmt.Sprintf("updated_at=$%d", i))
	values = append(values, time.Now())
	i++

	// If no updatable fields provided
	if len(fields) == 1 { // only updated_at
		return fmt.Errorf("no valid fields to update")
	}

	query := fmt.Sprintf(`
        UPDATE jobs
        SET %s
        WHERE id=$%d AND user_id=$%d;
    `, strings.Join(fields, ", "), i, i+1)

	values = append(values, job.ID, job.UserID)

	_, err := r.DB.Exec(query, values...)
	if err != nil {
		return fmt.Errorf("failed to update job: %v", err)
	}

	return nil
}

// -----------------------------------
// DELETE JOB
// -----------------------------------
func (r *PgRepository) DeleteJob(jobID, userID string) error {
	result, err := r.DB.Exec(queries.DeleteJob, jobID, userID)
	if err != nil {
		return err
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("no job found with id=%s for user_id=%s", jobID, userID)
	}

	return nil
}

// -----------------------------------
// GET STATUS COUNTS
// -----------------------------------
func (r *PgRepository) GetStatusByID(userID string) (map[string]int, error) {
	rows, err := r.DB.Query(queries.GetStatusByID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	results := make(map[string]int)

	for rows.Next() {
		var status string
		var count int
		err := rows.Scan(&status, &count)
		if err != nil {
			return nil, err
		}
		results[status] = count
	}

	return results, nil
}
