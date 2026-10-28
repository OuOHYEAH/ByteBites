-- +goose Up
-- +goose StatementBegin
ALTER TABLE menu_list
    ADD discounted_price NUMERIC NOT NULL DEFAULT 0;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE menu_list
    DROP COLUMN discounted_price;
-- +goose StatementEnd
