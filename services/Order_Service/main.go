package main

import (
	"net"
	"os"

	"github.com/CallenCaracy/ByteBites/services/Order_Service/pb"
	order "github.com/CallenCaracy/ByteBites/services/Order_Service/server/orders"
	"github.com/CallenCaracy/ByteBites/services/Order_Service/utils"

	"google.golang.org/grpc"
)

func main() {
	log, err := utils.NewLogger()
	if err != nil {
		os.Exit(1)
	}

		port := os.Getenv("PORT")
	if port == "" {
		port = "50053" // Fallback for local development
	}

	lis, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatal("Failed to listen: %v", err)
		os.Exit(1)
	}

	grpcServer := grpc.NewServer()

	orderService := &order.OrderServiceServer{}

	pb.RegisterOrderServiceServer(grpcServer, orderService)

	log.Info("Order Service running on port 50053...")
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatal("Failed to serve: %v", err)
		os.Exit(1)
	}
}
