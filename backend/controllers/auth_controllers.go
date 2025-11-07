package controllers

import (
	"backend/services"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// StartSession godoc
// @Summary Start a new login session
// @Description Initiates a new WorkOS login session and returns the login URL
// @Tags auth
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]string
// @Router /api/auth/start/session [post]
// StartSession - Creates a pending login session
func StartSession(c *gin.Context) {
	session, err := services.CreateSession()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	loginURL, err := services.GetWorkOSAuthURL(session.ID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"session_id": session.ID,
		"login_url":  loginURL,
	})
}

// HandleLogin godoc
// @Summary Redirect to WorkOS login
// @Description Redirects the user to the WorkOS authentication page
// @Tags auth
// @Produce json
// @Param session_id query string true "Session ID"
// @Success 302
// @Failure 500 {object} map[string]string
// @Router /api/auth/login [get]
// HandleLogin - redirects user to WorkOS auth page
func HandleLogin(c *gin.Context) {
	sessionID := c.Query("session_id")
	url, err := services.GetWorkOSAuthURL(sessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Redirect(http.StatusFound, url)
}

// HandleCallback godoc
// @Summary Handle WorkOS callback
// @Description Handles the callback from WorkOS after authentication
// @Tags auth
// @Produce html
// @Param state query string true "Session ID"
// @Param code query string true "Authorization Code"
// @Success 200 {string} string "HTML content"
// @Failure 500 {object} map[string]string
// @Router /api/auth/callback [get]
// HandleCallback - WorkOS redirects here after login/athentication
func HandleCallback(c *gin.Context) {
	sessionID := c.Query("state")
	code := c.Query("code")

	if err := services.HandleWorkOSCallback(sessionID, code); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	session, err := services.GetSession(sessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch session"})
		return
	}

	email := session.Email
	token := session.Token
	userID := session.UserID

	log.Printf("Authenticated WorkOS user: %s (%s) %s %s\n", token, email, "____", userID)

	c.Data(http.StatusOK, "text/html", []byte(`
		<html><body style="font-family:sans-serif;text-align:center;margin-top:50px">
		<h2>You're signed in!</h2>
		<p>You can close this tab and return to Job Tracker.</p>
		</body></html>
	`))
}

// GetSessionStatus godoc
// @Summary Get session status
// @Description Retrieves the status of a login session
// @Tags auth
// @Produce json
// @Param id path string true "Session ID"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]string
// @Router /api/auth/session/{id} [get]
// GetSessionStatus - check if session is complete (used for polling)
func GetSessionStatus(c *gin.Context) {
	sessionID := c.Param("id")
	session, err := services.GetSession(sessionID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, session)
}
