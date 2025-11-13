package tests

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/middleware"
	"backend/routes"

	"github.com/stretchr/testify/assert"
)

func TestHealthRoute(t *testing.T) {
	router := routes.SetupRouter(middleware.NoopMiddleware())

	req, _ := http.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "ok")
}

func TestNotFoundRoute(t *testing.T) {
	router := routes.SetupRouter(middleware.NoopMiddleware())
	req, _ := http.NewRequest("GET", "/nonexistent", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusNotFound, w.Code)
	assert.Contains(t, w.Body.String(), "404 page not found")
}
