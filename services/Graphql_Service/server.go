package main

import (
	"Graphql_Service/graph"
	"Graphql_Service/graph/model"
	"Graphql_Service/middleware"
	"database/sql"
	"log"
	"net/http"
	"os"
	"strings"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/CallenCaracy/ByteBites/services/User_Service/utils"
	"github.com/gorilla/websocket"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"github.com/supabase-community/auth-go"
	"github.com/vektah/gqlparser/v2/ast"
)

const defaultPort = "8080"

func main() {
	logger, err := utils.NewLogger()
	if err != nil {
		logger.Fatal("Failed to create logger: %v", err)
	}

	if err := godotenv.Load(); err != nil {
		logger.Warn("No .env file found, using system environment variables")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_ANON_KEY")
	if supabaseURL == "" || supabaseKey == "" {
		log.Fatal("Supabase URL or Anon Key environment variable not set")
	}

	client := auth.New(supabaseURL, supabaseKey)
	if client == nil {
		log.Fatal("Failed to create auth client")
	}

	// Get database URLs from .env
	db1URL := os.Getenv("SUPABASE_DB_USERS_URL")
	db2URL := os.Getenv("SUPABASE_DB_MENU_URL")
	db3URL := os.Getenv("SUPABASE_DB_PAYMENT_URL")
	db5URL := os.Getenv("SUPABASE_DB_ORDER_URL")
	db7URL := os.Getenv("SUPABASE_DB_KITCHEN_URL")

	// Connect to Supabase DB USERS
	db1, err := sql.Open("pgx", db1URL)
	if err != nil {
		logger.Fatal("Failed to connect to Supabase DB1: %v", err)
	}
	defer db1.Close()

	// Connect to Supabase DB MENU
	db2, err := sql.Open("pgx", db2URL)
	if err != nil {
		logger.Fatal("Failed to connect to Supabase DB2: %v", err)
	}
	defer db2.Close()

	// Connect to Supabase DB PAYMENT
	db3, err := sql.Open("pgx", db3URL)
	if err != nil {
		logger.Fatal("Failed to connect to Supabase DB3: %v", err)
	}
	defer db3.Close()

	// Connect to Supabase DB ORDER
	db5, err := sql.Open("pgx", db5URL)
	if err != nil {
		logger.Fatal("Failed to connect to Supabase DB5: %v", err)
	}
	defer db5.Close()

	// Connect to Supabase DB KITCHEN
	db7, err := sql.Open("pgx", db7URL)
	if err != nil {
		logger.Fatal("Failed to connect to Supabase DB7: %v", err)
	}
	defer db7.Close()

	resolver := &graph.Resolver{
		DB1:                        db1,
		DB2:                        db2,
		DB3:                        db3,
		DB5:                        db5,
		DB7:                        db7,
		AuthClient:                 client,
		Logger:                     logger,
		MenuItemCreatedObservers:   make(map[string]chan *model.MenuItemFull),
		OrderQueueCreatedObservers: make(map[string]chan *model.OrderQueue),
	}

	srv := handler.New(graph.NewExecutableSchema(graph.Config{Resolvers: resolver}))

	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})

	srv.AddTransport(transport.Websocket{
		Upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
	})

	srv.Use(extension.Introspection{})
	srv.SetQueryCache(lru.New[*ast.QueryDocument](100))

	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})

	mux := http.NewServeMux()
	mux.Handle("/", playground.Handler("GraphQL playground", "/query"))

	mux.Handle("/query", middleware.AuthMiddleware(srv))

	corsHandler := cors.New(cors.Options{
		AllowOriginFunc: func(origin string) bool {
			// Allow localhost and any vercel.app domain
			if strings.HasPrefix(origin, "http://localhost") {
				return true
			}
			if strings.HasSuffix(origin, ".vercel.app") {
				return true
			}
			return false
		},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}).Handler(mux)
	logger.Info("🚀 GraphQL server running at http://localhost:%s/", port)
	log.Fatal(http.ListenAndServe(":"+port, corsHandler))
}
