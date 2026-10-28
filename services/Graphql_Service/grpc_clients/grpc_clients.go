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
	userOnce    sync.Once
	UserClient  userpb.AuthServiceClient

	menuOnce    sync.Once
	MenuClient  menupb.MenuServiceClient

	kitchenOnce sync.Once
	KitchenClient kitchenpb.KitchenServiceClient
)

// Helper function to create a connection
func createConn(url string) *grpc.ClientConn {
	// Force the DNS resolver to bypass any system proxies
	// and enforce TLS
	conn, err := grpc.NewClient(url, 
		grpc.WithTransportCredentials(credentials.NewTLS(&tls.Config{
			InsecureSkipVerify: true, // Required for Render's proxy
		})),
		grpc.WithDefaultServiceConfig(`{"loadBalancingPolicy":"round_robin"}`),
	)
	if err != nil {
		log.Fatalf("failed to connect to gRPC at %s: %v", url, err)
	}
	return conn
}

func InitGRPCClients() {
	userOnce.Do(func() {
		url := os.Getenv("USER_SERVICE_URL")
		if url == "" {
			url = "localhost:50050"
		}
		UserClient = userpb.NewAuthServiceClient(createConn(url))
	})

	menuOnce.Do(func() {
		url := os.Getenv("MENU_SERVICE_URL")
		if url == "" {
			url = "localhost:50051"
		}
		MenuClient = menupb.NewMenuServiceClient(createConn(url))
	})

	kitchenOnce.Do(func() {
		url := os.Getenv("KITCHEN_SERVICE_URL")
		if url == "" {
			url = "localhost:50052"
		}
		KitchenClient = kitchenpb.NewKitchenServiceClient(createConn(url))
	})
}