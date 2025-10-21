package routes

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/workos/workos-go/v5/pkg/usermanagement"
)

// --- Simple in-memory session store (replace with Redis for prod) ---
type Session struct {
	ID        string `json:"id"`
	Status    string `json:"status"` // "pending" | "complete" | "error"
	Email     string `json:"email,omitempty"`
	Token     string `json:"token,omitempty"`
	CreatedAt int64  `json:"created_at"`
}

var (
	sessions = map[string]*Session{}
	mu       sync.Mutex
)

// --- Public routes setup ---

func RegisterAuthRoutes(r *gin.Engine) {
	r.GET("/auth/test", testAuth)
	r.GET("/auth/session/start", startSession)
	r.GET("/auth/login", loginHandler)
	r.GET("/auth/callback", callbackHandler)
	r.GET("/auth/session/:id", getSessionStatus)
}

// --- Handlers ---

func testAuth(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "WorkOS management ready"})
}

// 1️⃣  Start a new login session (called by extension)
func startSession(c *gin.Context) {
	id := uuid.NewString()

	mu.Lock()
	sessions[id] = &Session{
		ID:        id,
		Status:    "pending",
		CreatedAt: time.Now().Unix(),
	}
	mu.Unlock()

	loginURL := fmt.Sprintf("http://localhost:8080/auth/login?session_id=%s", id)
	c.JSON(http.StatusOK, gin.H{
		"session_id": id,
		"login_url":  loginURL,
	})
}

// 2️⃣  Redirect to WorkOS login UI
func loginHandler(c *gin.Context) {
	sessionID := c.Query("session_id")
	if sessionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing session_id"})
		return
	}

	authURL, err := usermanagement.GetAuthorizationURL(usermanagement.GetAuthorizationURLOpts{
		ClientID:    os.Getenv("WORKOS_CLIENT_ID"),
		RedirectURI: os.Getenv("WORKOS_REDIRECT_URI"), // e.g. http://localhost:8080/auth/callback
		Provider:    "authkit",
		State:       sessionID,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	log.Println("Redirecting to WorkOS:", authURL.String())
	c.Redirect(http.StatusFound, authURL.String())
}

// 3️⃣  Handle WorkOS callback → store token and show success page
func callbackHandler(c *gin.Context) {
	code := c.Query("code")
	sessionID := c.Query("state")

	if code == "" || sessionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing code/state"})
		return
	}

	res, err := usermanagement.AuthenticateWithCode(
		c.Request.Context(),
		usermanagement.AuthenticateWithCodeOpts{
			ClientID: os.Getenv("WORKOS_CLIENT_ID"),
			Code:     code,
		},
	)
	if err != nil {
		markSession(sessionID, "error", "", "")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	email := res.User.Email
	token := res.AccessToken
	log.Printf("✅ User %s authenticated successfully", email)

	markSession(sessionID, "complete", email, token)

	// Friendly HTML so user can close the tab
	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(`
		<!DOCTYPE html>
		<html><body style="font-family:sans-serif;text-align:center;margin-top:50px">
			<h2>You’re signed in!</h2>
			<p>You can close this tab and return to Job Tracker.</p>
		</body></html>
	`))
}

// 4️⃣  Return session status for polling (called by extension)
func getSessionStatus(c *gin.Context) {
	id := c.Param("id")

	mu.Lock()
	s, ok := sessions[id]
	mu.Unlock()

	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "session not found"})
		return
	}

	if time.Now().Unix()-s.CreatedAt > 600 && s.Status == "pending" {
		markSession(id, "error", "", "")
	}

	c.JSON(http.StatusOK, s)
}

// --- Helper functions ---

func markSession(id, status, email, token string) {
	mu.Lock()
	defer mu.Unlock()
	if s, ok := sessions[id]; ok {
		s.Status = status
		s.Email = email
		s.Token = token
	} else {
		sessions[id] = &Session{
			ID:        id,
			Status:    status,
			Email:     email,
			Token:     token,
			CreatedAt: time.Now().Unix(),
		}
	}
}
