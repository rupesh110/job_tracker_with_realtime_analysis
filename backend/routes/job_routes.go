package routes

import (
	"backend/controllers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func JobRoutes(r *gin.Engine) {
	jobs := r.Group("/api/jobs")
	jobs.Use(middleware.AuthMiddleware())
	{
		jobs.POST("", controllers.CreateJob)
		jobs.GET("", controllers.GetJobsByUser)
		jobs.PUT("/:id", controllers.UpdateJob)
		jobs.DELETE("/:id", controllers.DeleteJob)
		jobs.GET("/status", controllers.GetJobsStatusCounts)
	}
}
