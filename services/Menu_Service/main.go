package main

import (
	"net"
	"os"

	"github.com/CallenCaracy/ByteBites/services/Menu_Service/utils"

	"github.com/CallenCaracy/ByteBites/services/Menu_Service/pb"

	menu "github.com/CallenCaracy/ByteBites/services/Menu_Service/server/menus"

	"google.golang.org/grpc"
)

func main() {
	log, err := utils.NewLogger()
	if err != nil {
		os.Exit(1)
	}

		port := os.Getenv("PORT")
	if port == "" {
		port = "50051" // Fallback for local development
	}

	lis, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatal("Failed to listen: %v", err)
		os.Exit(1)
	}

	grpcServer := grpc.NewServer()
	pb.RegisterMenuServiceServer(grpcServer, &menu.MenuServiceServer{})

	log.Info("Menu Service running on port 50051...")
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatal("Failed to serve: %v", err)
		os.Exit(1)
	}
}
