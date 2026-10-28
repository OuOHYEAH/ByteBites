@echo off
start "User_Service"    cmd /k "cd /d C:\Users\user\Documents\ByteBites\services\User_Service && go run main.go"
start "Menu_Service"    cmd /k "cd /d C:\Users\user\Documents\ByteBites\services\Menu_Service && go run main.go"
start "Kitchen_Service" cmd /k "cd /d C:\Users\user\Documents\ByteBites\services\Kitchen_Service && go run main.go"
start "Order_Service"   cmd /k "cd /d C:\Users\user\Documents\ByteBites\services\Order_Service && go run main.go"
start "Payment_Service" cmd /k "cd /d C:\Users\user\Documents\ByteBites\services\Payment_Service && go run main.go"
start "Graphql_Service" cmd /k "cd /d C:\Users\user\Documents\ByteBites\services\Graphql_Service && go run server.go"
timeout /t 5 /nobreak >nul
start "Frontend_Client" cmd /k "cd /d C:\Users\user\Documents\ByteBites\frontend-client && npm run dev"
echo All services starting... wait ~30 seconds, then open http://localhost:5173
pause