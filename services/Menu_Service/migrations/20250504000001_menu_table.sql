-- +goose Up
-- +goose StatementBegin
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    image_url TEXT,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    item_status TEXT NOT NULL CHECK (item_status IN ('Available', 'Not Available')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE menu_items;
-- +goose StatementEnd

