// gqlgen_service/grpc_clients.go
package service

import (
	"log"
	"os"
	"sync"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

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

func getConn(target string) *grpc.ClientConn {
	// Prepend passthrough to skip the DNS resolver
	conn, err := grpc.NewClient("passthrough:///"+target, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("failed to connect to gRPC at %s: %v", target, err)
	}
	return conn
}

func InitGRPCClients() {
	userOnce.Do(func() {
		url := os.Getenv("USER_SERVICE_URL")
		if url == "" {
			url = "localhost:50050"
		}
		UserClient = userpb.NewAuthServiceClient(getConn(url))
	})

	menuOnce.Do(func() {
		url := os.Getenv("MENU_SERVICE_URL")
		if url == "" {
			url = "localhost:50051"
		}
		MenuClient = menupb.NewMenuServiceClient(getConn(url))
	})

	kitchenOnce.Do(func() {
		url := os.Getenv("KITCHEN_SERVICE_URL")
		if url == "" {
			url = "localhost:50052"
		}
		KitchenClient = kitchenpb.NewKitchenServiceClient(getConn(url))
	})
}