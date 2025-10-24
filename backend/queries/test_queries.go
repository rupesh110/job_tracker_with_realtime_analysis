package queries

const (
	CreateTableTestItems = `
		CREATE TABLE IF NOT EXISTS test_items (
			id SERIAL PRIMARY KEY,
			title TEXT NOT NULL,
			note TEXT
		);
	`

	InsertTestItem = `
		INSERT INTO test_items (title, note)
		VALUES ($1, $2)
		RETURNING id;
	`

	GetAllTestItems = `
		SELECT id, title, note FROM test_items;
	`
)
