package queries

const (
	CreateUsersTable = `
		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			email TEXT UNIQUE
		);
	`

	InsertUser = `
		INSERT INTO users (id, email)
		VALUES ($1, $2)
		ON CONFLICT (id) DO NOTHING;
	`
	GetUserByID = `
		SELECT id, email
		FROM users
		WHERE id = $1;
	`
	DeleteUser = `
		DELETE FROM users
		WHERE id = $1;
	`
)
