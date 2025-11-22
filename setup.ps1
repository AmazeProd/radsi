# Social Media Platform - Automated Setup Script
# Run this script in PowerShell from the project root directory

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Social Media Platform Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if MongoDB is running (optional check)
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
$mongoRunning = Get-Process mongod -ErrorAction SilentlyContinue
if ($mongoRunning) {
    Write-Host "✓ MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "⚠ MongoDB is not running locally. Make sure to use MongoDB Atlas or start MongoDB." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Installing Dependencies..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Install root dependencies
Write-Host ""
Write-Host "Installing root dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Root dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install root dependencies" -ForegroundColor Red
    exit 1
}

# Install server dependencies
Write-Host ""
Write-Host "Installing server dependencies..." -ForegroundColor Yellow
Set-Location server
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Server dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install server dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ..

# Install client dependencies
Write-Host ""
Write-Host "Installing client dependencies..." -ForegroundColor Yellow
Set-Location client
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Client dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install client dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ..

# Check if .env exists in server
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Checking Configuration..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path "server\.env") {
    Write-Host "✓ Environment file exists (server\.env)" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠ IMPORTANT: Please update the following in server\.env:" -ForegroundColor Yellow
    Write-Host "  1. MONGODB_URI - Your MongoDB connection string" -ForegroundColor White
    Write-Host "  2. JWT_SECRET - Change to a secure random string" -ForegroundColor White
    Write-Host "  3. JWT_REFRESH_SECRET - Change to another secure string" -ForegroundColor White
    Write-Host "  4. Optional: Email and Cloudinary settings" -ForegroundColor White
} else {
    Write-Host "✗ Environment file not found. Creating from example..." -ForegroundColor Red
    Copy-Item ".env.example" "server\.env"
    Write-Host "✓ Created server\.env from template" -ForegroundColor Green
    Write-Host "⚠ Please configure server\.env before running the application" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Green
Write-Host "1. Configure server\.env file" -ForegroundColor White
Write-Host "2. Start MongoDB (if using local installation)" -ForegroundColor White
Write-Host "3. Run 'npm run dev' to start both servers" -ForegroundColor White
Write-Host ""
Write-Host "Application URLs:" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "For more information, see:" -ForegroundColor Yellow
Write-Host "  - README.md" -ForegroundColor White
Write-Host "  - QUICK_START.md" -ForegroundColor White
Write-Host "  - API_DOCUMENTATION.md" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Cyan
