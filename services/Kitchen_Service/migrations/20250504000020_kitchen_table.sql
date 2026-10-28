-- +goose Up
-- +goose StatementBegin
CREATE TABLE order_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    status TEXT CHECK (status IN ('preparing', 'ready', 'complete')) NOT NULL DEFAULT 'preparing',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE menu_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_id UUID NOT NULL,
    available_servings INT NOT NULL DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS menu_stock;
DROP TABLE IF EXISTS order_queue;
-- +goose StatementEnd