package controllers

import (
	"backend/models"
	"backend/repositories"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// CreateJob godoc
// @Summary Create a new job
// @Description Add a new job entry to the database
// @Tags jobs
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param job body models.Job true "Job object"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Router /api/jobs [post]
func CreateJob(c *gin.Context) {
	var job models.Job
	userID := c.GetString("user_id")

	log.Printf("from create job:")
	if err := c.ShouldBindJSON(&job); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "UserID is required"})
		return
	}

	job.UserID = userID
	job.UpdatedAt = time.Now()

	if err := repositories.CreateJob(&job); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Job Created", "data": job})
}

// GetJobsByUser godoc
// @Summary Get jobs by user ID
// @Description Retrieve all job entries for a specific user
// @Tags jobs
// @Security BearerAuth
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]string
// @Router /api/jobs [get]
func GetJobsByUser(c *gin.Context) {
	userID := c.GetString("user_id")

	jobs, err := repositories.GetJobsByUser(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": jobs})
}

// UpdateJob godoc
// @Summary Update job details
// @Description Update the status, notes, and updated date of a job
// @Tags jobs
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "Job ID"
// @Param job body models.Job true "Updated job info"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Router /api/jobs/{id} [put]
func UpdateJob(c *gin.Context) {
	jobID := c.Param("id")
	userID := c.GetString("user_id")
	var job models.Job
	if err := c.ShouldBindJSON(&job); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	job.ID = jobID
	job.UserID = userID
	job.UpdatedAt = time.Now()

	if job.UserID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing user_id"})
		return
	}

	if err := repositories.UpdateJob(&job); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Job Updated", "data": job})
}

// DeleteJob godoc
// @Summary Delete a job
// @Description Remove a job entry from the database
// @Tags jobs
// @Security BearerAuth
// @Produce json
// @Param id path string true "Job ID"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /api/jobs/{id} [delete]
func DeleteJob(c *gin.Context) {
	jobID := c.Param("id")
	userID := c.GetString("user_id")

	if jobID == "" || userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing job_id or user_id"})
		return
	}

	if err := repositories.DeleteJob(jobID, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Job deleted successfully"})
}
