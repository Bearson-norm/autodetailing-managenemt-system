# Create PostgreSQL database for Auto Detailing
# Run this script if the database doesn't exist yet
# Requires: PostgreSQL installed and psql in PATH

$DB_NAME = "autodetaailing"
$DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "postgres" }

Write-Host "Creating database '$DB_NAME'..." -ForegroundColor Cyan

# Create database (connect to postgres default DB first)
$result = psql -U $DB_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'"

if ($result -eq "1") {
    Write-Host "Database '$DB_NAME' already exists." -ForegroundColor Yellow
} else {
    psql -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database '$DB_NAME' created successfully!" -ForegroundColor Green
    } else {
        Write-Host "Failed to create database. Make sure PostgreSQL is running and you have the correct password." -ForegroundColor Red
        exit 1
    }
}

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Update backend/.env with your DB_PASSWORD"
Write-Host "  2. Run: cd backend && npm run migrate"
Write-Host "  3. Run: cd backend && npm run seed"
