package graph

import (
	"Graphql_Service/graph/model"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"os"
	"sync"

	"github.com/CallenCaracy/ByteBites/services/User_Service/utils"
	supabase "github.com/nedpals/supabase-go"
	"github.com/supabase-community/auth-go"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.
type Resolver struct {
	DB1                        *sql.DB // Supabase Database USER
	DB2                        *sql.DB // Supabase Database MENU
	DB3                        *sql.DB // Supabase Database ORDER
	DB5                        *sql.DB
	DB7                        *sql.DB // Supabase Database KITCHEN
	AuthClient                 auth.Client
	Logger                     *utils.Logger
	MenuItemCreatedObservers   map[string]chan *model.MenuItemFull
	OrderQueueCreatedObservers map[string]chan *model.OrderQueue
	mu                         sync.Mutex
}

func (r *Resolver) Mutation() MutationResolver { return &mutationResolver{r} }

// Query returns QueryResolver implementation.
func (r *Resolver) Query() QueryResolver { return &queryResolver{r} }

// verifyToken checks a Supabase access token directly instead of calling User_Service over gRPC,
// since Render free instances can't receive private network traffic.
func verifyToken(ctx context.Context, token string) (id string, email string, err error) {
	supabaseURL := os.Getenv("SUPABASE_URL_FULL")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
	if supabaseURL == "" || supabaseKey == "" {
		return "", "", errors.New("supabase credentials are not set")
	}

	user, err := supabase.CreateClient(supabaseURL, supabaseKey).Auth.User(ctx, token)
	if err != nil {
		return "", "", fmt.Errorf("invalid or expired token: %v", err)
	}
	return user.ID, user.Email, nil
}

// checkStock returns the servings left for a menu item (formerly Kitchen_Service's CheckStock).
// A menu item with no stock row counts as zero.
func (r *Resolver) checkStock(ctx context.Context, menuItemID string) (int32, error) {
	var available int32
	err := r.DB7.QueryRowContext(ctx, `SELECT available_servings FROM public.menu_stock WHERE menu_id = $1`, menuItemID).Scan(&available)
	if errors.Is(err, sql.ErrNoRows) {
		return 0, nil
	}
	return available, err
}

// calculateDiscount applies a percentage discount (formerly Menu_Service's CalculateDiscount).
func calculateDiscount(price, discount float32) float32 {
	return price * (1 - discount/100)
}
