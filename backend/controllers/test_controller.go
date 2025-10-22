package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func TestController(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Test endpoint is working!"})
}
