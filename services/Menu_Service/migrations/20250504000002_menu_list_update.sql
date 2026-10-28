-- +goose Up
-- +goose StatementBegin
ALTER TABLE menu_list
    ADD discount NUMERIC NOT NULL DEFAULT 0;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE menu_list
    DROP COLUMN discount;
-- +goose StatementEnd
