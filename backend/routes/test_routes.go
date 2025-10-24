package routes

import (
	"backend/controllers"

	"github.com/gin-gonic/gin"
)

func TestRoutes(r *gin.Engine) {
	test := r.Group("/api/test")
	test.GET("/ping", controllers.TestController)
	test.POST("/items", controllers.AddTestItem)
	test.GET("/items", controllers.GetTestItems)
}
