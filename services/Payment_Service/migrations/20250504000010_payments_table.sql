-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd

-- Make you migrations here
-- to run
-- goose -dir migrations postgres "supabase database url connection(user the session connection)" up