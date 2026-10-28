// gqlgen_service/grpc_clients.go
package service

import (
	"crypto/tls"
	"log"
	"os"
	"sync"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"

	kitchenpb "github.com/CallenCaracy/ByteBites/services/Kitchen_Service/pb"
	menupb "github.com/CallenCaracy/ByteBites/services/Menu_Service/pb"
	userpb "github.com/CallenCaracy/ByteBites/services/User_Service/pb"
)

var (
	userOnce   sync.Once
	UserClient userpb.AuthServiceClient

	menuOnce   sync.Once
	MenuClient menupb.MenuServiceClient

	kitchenOnce   sync.Once
	KitchenClient kitchenpb.KitchenServiceClient
)

func InitGRPCClients() {
		userOnce.Do(func() {
		url := os.Getenv("USER_SERVICE_URL")
		if url == "" {
			url = "localhost:50050" // Fallback for local
		}
		conn, err := grpc.NewClient(url, grpc.WithTransportCredentials(insecure.NewCredentials()))
		if err != nil {
			log.Fatalf("failed to connect to user gRPC: %v", err)
		}
		UserClient = userpb.NewAuthServiceClient(conn)
	})

		menuOnce.Do(func() {
		url := os.Getenv("MENU_SERVICE_URL")
		if url == "" {
			url = "localhost:50051"
		}
		conn, err := grpc.NewClient(url, grpc.WithTransportCredentials(insecure.NewCredentials()))
		if err != nil {
			log.Fatalf("failed to connect to menu gRPC: %v", err)
		}
		MenuClient = menupb.NewMenuServiceClient(conn)
	})

		kitchenOnce.Do(func() {
		url := os.Getenv("KITCHEN_SERVICE_URL")
		if url == "" {
			url = "localhost:50052"
		}
		conn, err := grpc.NewClient(url, grpc.WithTransportCredentials(insecure.NewCredentials()))
		if err != nil {
			log.Fatalf("failed to connect to kitchen gRPC: %v", err)
		}
		KitchenClient = kitchenpb.NewKitchenServiceClient(conn)
	})
}
