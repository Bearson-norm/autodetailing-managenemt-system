#!/bin/bash
# Create PostgreSQL database for Auto Detailing
# Run this script if the database doesn't exist yet

DB_NAME="${DB_NAME:-autodetaailing}"
DB_USER="${DB_USER:-postgres}"

echo "Creating database '$DB_NAME'..."

# Check if database exists
if psql -U "$DB_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
    echo "Database '$DB_NAME' already exists."
else
    psql -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;"
    echo "Database '$DB_NAME' created successfully!"
fi

echo ""
echo "Next steps:"
echo "  1. Update backend/.env with your DB_PASSWORD"
echo "  2. Run: cd backend && npm run migrate"
echo "  3. Run: cd backend && npm run seed"
