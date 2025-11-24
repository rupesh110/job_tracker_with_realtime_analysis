package repositories

import (
	"backend/config"
	"backend/models"
	"backend/queries"
	"database/sql"
)

// PgUserRepository implements the UserRepository interface
type PgUserRepository struct {
	DB *sql.DB
}

// NewPgUserRepository creates a new instance using global DB
func NewPgUserRepository() UserRepository {
	return &PgUserRepository{DB: config.DB}
}

// NewPgUserRepositoryWithDB creates a new instance with custom DB (for testing)
func NewPgUserRepositoryWithDB(db *sql.DB) UserRepository {
	return &PgUserRepository{DB: db}
}

func (r *PgUserRepository) CreateUser(user *models.User) error {
	_, err := r.DB.Exec(
		queries.InsertUser,
		user.ID, user.Email,
	)
	return err
}

func (r *PgUserRepository) GetUserByID(id string) (*models.User, error) {
	row := r.DB.QueryRow(queries.GetUserByID, id)
	var user models.User
	if err := row.Scan(&user.ID, &user.Email); err != nil {
		return nil, err
	}
	return &user, nil
}
