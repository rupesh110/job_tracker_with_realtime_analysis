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

	log.Printf("Received user creation request: %s\n", user)

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
