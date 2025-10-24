package controllers

import (
	"backend/config"
	"backend/models"
	"backend/queries"
	"net/http"

	"github.com/gin-gonic/gin"
)

// TestController godoc
// @Tags test
// @Summary Test endpoint
// @Description A simple test endpoint to verify the server is running
// @Produce json
// @Success 200 {object} map[string]string
// @Router /api/test/ping [get]
func TestController(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Test endpoint is working!"})
}

// AddTestItem godoc
// @Tags test
// @Summary Add a test item
// @Description Adds a new test item to the database
// @Accept json
// @Produce json
// @Param item body models.TestItem true "Test Item"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Router /api/test/items [post]
func AddTestItem(c *gin.Context) {
	var item models.TestItem
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := config.DB.QueryRow(queries.InsertTestItem, item.Title, item.Note).Scan(&item.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item added", "data": item})
}

// GetTestItems godoc
// @Tags test
// @Summary Get all test items
// @Description Retrieves all test items from the database
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]string
// @Router /api/test/items [get]
func GetTestItems(c *gin.Context) {
	rows, err := config.DB.Query(queries.GetAllTestItems)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var items []models.TestItem
	for rows.Next() {
		var item models.TestItem
		if err := rows.Scan(&item.ID, &item.Title, &item.Note); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		items = append(items, item)
	}
	c.JSON(http.StatusOK, gin.H{"data": items})
}
