package routes

import (
	"backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes1(r *gin.Engine) {
	r.GET("/test", handlers.HomeHandler)
}
