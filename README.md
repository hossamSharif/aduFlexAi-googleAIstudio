# Database Migrations

This directory contains Supabase database migrations for the SUDA Education Platform.

## Migration Naming Convention

Migrations are named with the format: `YYYYMMDD_description.sql`

Example: `20250921_initial_schema.sql`

## Current Migrations

1. **20250921_initial_schema.sql** - Initial database schema with all core tables
2. **20250921_rls_policies.sql** - Row Level Security policies for multi-tenant isolation

## Running Migrations

### Local Development
```bash
# Start local Supabase (requires Docker)
npx supabase start

# Apply migrations
npx supabase db push

# Reset database (caution: destroys all data)
npx supabase db reset
```

### Production
```bash
# Link to remote project
npx supabase link --project-ref your-project-ref

# Push migrations to production
npx supabase db push
```

## Migration Management

### Creating New Migrations
```bash
# Generate new migration file
npx supabase migration new migration_name

# Apply specific migration
npx supabase migration apply migration_name
```

### Rolling Back
```bash
# View migration history
npx supabase migration list

# Rollback to specific migration
npx supabase db reset --db-url "your-database-url"
```

## Best Practices

1. **Always test migrations locally first**
2. **Include both UP and DOWN migration paths when possible**
3. **Use transactions for complex migrations**
4. **Include proper indexes and constraints**
5. **Document breaking changes clearly**

## Schema Versioning

- Schema version is tracked in `supabase_migrations.schema_migrations` table
- Each migration file creates an entry with timestamp and checksum
- Rollbacks require careful consideration of data integrity

## Troubleshooting

### Common Issues
- **Docker not running**: Ensure Docker Desktop is installed and running
- **Permission errors**: Check Supabase service key permissions
- **Migration conflicts**: Resolve manually or reset local database

### Useful Commands
```bash
# Check migration status
npx supabase migration list

# Generate TypeScript types from schema
npx supabase gen types typescript --local > types/database.ts

# View current schema
npx supabase db diff --schema public
```