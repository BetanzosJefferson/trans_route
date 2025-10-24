# TransRoute Database

PostgreSQL database schema for TransRoute SaaS system.

## Setup in Supabase

1. Go to your Supabase project
2. Navigate to the SQL Editor
3. Run `schema.sql` to create all tables, indexes, and triggers
4. Run `seed.sql` (optional) to populate with sample data

## Database Structure

### Multi-tenant Architecture
- All tables include `company_id` for data isolation
- Row Level Security (RLS) enabled on all tables
- Soft delete implemented via `deleted_at` column

### Main Entities

#### Companies
- Central entity for multi-tenant system
- All business data is scoped by company

#### Users
- Supports multiple roles via `user_role` enum
- Can belong to multiple companies via `user_companies` junction table
- Includes profile information and authentication data

#### Routes & Trips
- `routes`: Define available travel routes
- `route_templates`: Pricing and scheduling templates
- `trips`: Specific scheduled trips
- `trip_segments`: Auto-generated segments for intermediate stops

#### Reservations & Clients
- `clients`: Customer information (phone is unique identifier)
- `reservations`: Ticket bookings
- `passengers`: Passenger details for each reservation

#### Packages
- Parcel/package shipping functionality
- Tracks sender, receiver, and delivery status

#### Financial
- `transactions`: All monetary movements
- `box_cutoffs`: Cash register closures
- `expenses`: Operational expenses
- `commissions` & `commission_log`: Commission tracking

#### Audit & Notifications
- `audit_logs`: Complete audit trail of all CRUD operations
- `notifications`: User notifications

## Key Features

### Automatic Timestamps
All tables with `updated_at` column have triggers that auto-update on modification.

### Soft Delete
Tables with `deleted_at` support soft deletion for data recovery.

### Indexing
Strategic indexes for:
- Foreign keys
- Frequently queried columns
- Composite queries (origin/destination, date ranges)

### Data Integrity
- Foreign key constraints
- Check constraints
- ENUM types for status fields
- NOT NULL constraints where appropriate

## Notes

- All identifiers use UUID v4
- All timestamps use TIMESTAMPTZ (timezone-aware)
- Monetary values use DECIMAL(10, 2)
- Array and JSON support for flexible data (stops, services, configurations)

