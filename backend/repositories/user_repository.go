package repositories

import (
	"backend/config"
	"backend/models"
	"backend/queries"
)

func CreateUser(user *models.User) error {
	_, err := config.DB.Exec(
		queries.InsertUser,
		user.ID, user.Email,
	)
	return err
}

func GetUserByID(id string) (*models.User, error) {
	row := config.DB.QueryRow(queries.GetUserByID, id)
	var user models.User
	if err := row.Scan(&user.ID, &user.Email); err != nil {
		return nil, err
	}
	return &user, nil
}
