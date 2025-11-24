package tests

import (
	"database/sql"
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/config"
	"backend/controllers"
	"backend/middleware"
	"backend/repositories"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// setupTestDB creates a mock database for testing
func setupTestDB(t *testing.T) (*sql.DB, sqlmock.Sqlmock) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err, "Failed to create mock database")
	return db, mock
}

// mockAuthMiddleware creates a middleware that sets a fake user_id for testing
func mockAuthMiddleware(userID string) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set("user_id", userID)
		c.Set("user_email", "test@example.com")
		c.Next()
	}
}

func TestGetJobsByUser(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// Setup mock database
	db, mock := setupTestDB(t)
	defer db.Close()

	// Replace the global DB with mock
	originalDB := config.DB
	config.DB = db
	defer func() { config.DB = originalDB }()

	// Initialize repository with mock DB
	repositories.JobRepo = repositories.NewPgRepositoryWithDB(db)

	// Mock the SELECT query - return empty result set
	rows := sqlmock.NewRows([]string{
		"id", "user_id", "company", "title", "location",
		"platform", "status", "date", "updated_at", "work_type", "url", "notes",
	})

	mock.ExpectQuery(`SELECT (.+) FROM jobs WHERE user_id`).
		WithArgs("test-user-123").
		WillReturnRows(rows)

	// Setup router with mock auth middleware instead of real auth
	router := gin.New()
	jobs := router.Group("/api/jobs")
	jobs.Use(middleware.NoopMiddleware())
	jobs.Use(mockAuthMiddleware("test-user-123")) // Mock authentication
	jobs.GET("", controllers.GetJobsByUser)

	req, _ := http.NewRequest("GET", "/api/jobs", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "data")
	assert.NoError(t, mock.ExpectationsWereMet())
}
