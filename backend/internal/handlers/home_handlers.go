package handlers

import (
	"time"

	"github.com/gin-gonic/gin"
)

func HomeHandler(c *gin.Context) {
	c.JSON(200, gin.H{
		"status":  "ok",
		"message": "CORS fixed — extension can access backend FINALLY✅",
		"time":    time.Now(),
	})
}
