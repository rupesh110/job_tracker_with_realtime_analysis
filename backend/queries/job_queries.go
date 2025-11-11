package queries

const (
	CreateJobsItems = `
		CREATE TABLE IF NOT EXISTS jobs (
			id SERIAL PRIMARY KEY,
			user_id TEXT,
			company TEXT,
			title TEXT,
			location TEXT,
			platform TEXT,
			status TEXT,
			date TEXT,
			updated_at DATE DEFAULT CURRENT_DATE,
			work_type TEXT,
			url TEXT,
			notes TEXT,
			CONSTRAINT unique_user_job_url UNIQUE (user_ID, url)
		);
	`

	InsertJob = `
		INSERT INTO jobs (
			user_id, company, title, location, platform, status, date, updated_at, work_type, url, notes)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id;
	`

	GetJobsByUser = `
		SELECT id, user_id, company, title, location, platform, status,date, updated_at, work_type, url, notes
		FROM jobs
		WHERE user_id = $1;
	`

	UpdateJob = `
		UPDATE jobs
		SET status = $1, updated_at = $2, notes = $3
		WHERE id = $4 AND user_id = $5;
	`

	DeleteJob = `
		DELETE FROM jobs
		WHERE id = $1 AND user_id = $2;
	`

	GetStatusByID = `
		SELECT status, COUNT(*) AS count
			FROM jobs
			WHERE user_id = $1
			GROUP BY status
			ORDER BY count DESC;

	`
)
