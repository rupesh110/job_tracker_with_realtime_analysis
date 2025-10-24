package routes

import (
	"backend/controllers"

	"github.com/gin-gonic/gin"
)

func JobRoutes(r *gin.Engine) {
	jobs := r.Group("/jobs")
	{
		jobs.POST("/", controllers.CreateJob)
		jobs.GET("/:user_id", controllers.GetJobsByUser)
		jobs.PUT("/:id", controllers.UpdateJob)
		jobs.DELETE("/:id", controllers.DeleteJob)
	}
}
