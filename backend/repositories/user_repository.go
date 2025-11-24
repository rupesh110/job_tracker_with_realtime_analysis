package repositories

import (
	"backend/models"
)

type UserRepository interface {
	CreateUser(user *models.User) error
	GetUserByID(id string) (*models.User, error)
}

var UserRepo UserRepository
