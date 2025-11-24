package repositories

import (
	"backend/models"
	"fmt"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestPgRespository_GetJobsByUser(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewPgRepositoryWithDB(db)
	updatedAt := time.Now()

	rows := sqlmock.NewRows([]string{"id", "user_id", "company", "title", "location", "platform", "status", "date", "updated_at", "work_type", "url", "notes"}).
		AddRow("1", "user1", "CompanyA", "Engineer", "Sydney", "LinkedIn", "Applied", "2024-01-01", updatedAt, "Full-time", "http://job1.com", "Notes1")

	mock.ExpectQuery(`SELECT id, user_id`).
		WithArgs("user1").
		WillReturnRows(rows)

	jobs, err := repo.GetJobsByUser("user1")
	assert.NoError(t, err)
	assert.Len(t, jobs, 1)
	assert.Equal(t, "CompanyA", jobs[0].Company)
	assert.Equal(t, "Engineer", jobs[0].Title)
	assert.NoError(t, mock.ExpectationsWereMet())

}

func TestPgRepository_CreateJob(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewPgRepositoryWithDB(db)
	updatedAt := time.Now()

	mock.ExpectQuery(`INSERT INTO jobs`).
		WithArgs("user1", "CompanyA", "Engineer", "Sydney", "LinkedIn", "Applied", "2024-01-01", updatedAt, "Remote", "http://job1.com", "Notes1").
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow("job123"))
	job := &models.Job{
		UserID:    "user1",
		Company:   "CompanyA",
		Title:     "Engineer",
		Location:  "Sydney",
		Platform:  "LinkedIn",
		Status:    "Applied",
		Date:      "2024-01-01",
		UpdatedAt: updatedAt,
		WorkType:  "Remote",
		URL:       "http://job1.com",
		Notes:     "Notes1",
	}
	err = repo.CreateJob(job)

	assert.NoError(t, err)
	assert.Equal(t, "job123", job.ID)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestPgRepository_CreateJob_Fail_DBError(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewPgRepositoryWithDB(db)

	updatedAt := time.Now()

	// Simulate INSERT failing
	mock.ExpectQuery(`INSERT INTO jobs`).
		WithArgs(
			"user1", "CompanyA", "Engineer", "Sydney", "LinkedIn",
			"Applied", "2024-01-01", updatedAt, "Remote", "http://job1.com", "Notes1",
		).
		WillReturnError(fmt.Errorf("insert failed"))

	job := &models.Job{
		UserID:    "user1",
		Company:   "CompanyA",
		Title:     "Engineer",
		Location:  "Sydney",
		Platform:  "LinkedIn",
		Status:    "Applied",
		Date:      "2024-01-01",
		UpdatedAt: updatedAt,
		WorkType:  "Remote",
		URL:       "http://job1.com",
		Notes:     "Notes1",
	}

	err = repo.CreateJob(job)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "insert failed")
	assert.NoError(t, mock.ExpectationsWereMet())
}
