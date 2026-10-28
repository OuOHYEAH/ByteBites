// gqlgen_service/grpc_clients.go
package service

import (
	"context"
	"crypto/tls"
	"log"
	"net"
	"os"
	"sync"
	"time"

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

func createConn(target string) *grpc.ClientConn {
	// Extract the hostname (without the port)
	host, _, err := net.SplitHostPort(target)
	if err != nil {
		host = target
	}

	// Force TLS but set the ServerName to bypass Render's SNI proxy stripping
	creds := credentials.NewTLS(&tls.Config{
		ServerName:         host,
		InsecureSkipVerify: true,
	})

	conn, err := grpc.NewClient(target, 
		grpc.WithTransportCredentials(creds),
		// This forces the connection to fall back to the IP address without failing DNS
		grpc.WithContextDialer(func(ctx context.Context, addr string) (net.Conn, error) {
			dialer := &net.Dialer{Timeout: 10 * time.Second}
			return dialer.DialContext(ctx, "tcp", addr)
		}),
	)
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