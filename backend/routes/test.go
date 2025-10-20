package routes

import (
	"github.com/gin-gonic/gin"
)

func TestRoutes(r *gin.Engine) {
	r.GET("/test", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Test route",
		})
	})
}
