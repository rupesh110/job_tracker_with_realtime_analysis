package controllers

import (
	"backend/models"
	"backend/repositories"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CreateUser godoc
// @Summary Create a new user
// @Description Add a new user entry to the database
// @Tags users
// @Accept json
// @Produce json
// @Param user body models.User true "User object"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Router /api/users [post]
func CreateUser(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		// Parse the request JSON into models.User
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user already exists in DB
	createdUser, err := repositories.GetUserByID(user.ID)
	if err == nil && createdUser != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User already exists"})
		return
	}

	// Insert new user into DB
	if err := repositories.CreateUser(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return success
	log.Printf("Created user: %s (%s)\n", user.Email, user.ID)
	c.JSON(http.StatusOK, gin.H{"message": "User Created", "data": user})
}

// GetUserByID godoc
// @Summary Get user by ID
// @Description Retrieve a user entry from the database by ID
// @Tags users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]string
// @Router /api/users/{id} [get]
func GetUserByID(c *gin.Context) {
	id := c.Param("id")
	user, err := repositories.GetUserByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": user})
}
