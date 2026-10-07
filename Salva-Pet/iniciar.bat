@echo off
echo ========================================================
echo          INICIANDO PROJETO SALVAPET LOCALMENTE
echo ========================================================
echo.
echo 1. Certifique-se de que o MySQL (XAMPP) esteja ativo!
echo 2. Iniciando API (Porta 3000) e Frontend (Porta 5173)...
echo.

start "SalvaPet - API Backend (3000)" cmd /k "npm run server"
start "SalvaPet - Frontend Vite (5173)" cmd /k "npm run dev"

echo.
echo Servidores iniciados em janelas separadas!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:3000
echo.
pause
