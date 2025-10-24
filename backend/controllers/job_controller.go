package controllers

import (
	"backend/models"
	"backend/repositories"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func CreateJob(c *gin.Context) {
	var job models.Job
	if err := c.ShouldBindJSON(&job); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if job.UserID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "UserID is required"})
		return
	}

	job.UpdatedAt = time.Now()

	if err := repositories.CreateJob(&job); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Job Created", "data": job})
}

func GetJobsByUser(c *gin.Context) {
	userID := c.Param("user_id")
	jobs, err := repositories.GetJobsByUser(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": jobs})
}

func UpdateJob(c *gin.Context) {
	jobID := c.Param("id")
	var job models.Job
	if err := c.ShouldBindJSON(&job); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	job.ID = jobID
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

func DeleteJob(c *gin.Context) {
	jobID := c.Param("id")
	userID := c.Query("user_id") // or from token in future

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
