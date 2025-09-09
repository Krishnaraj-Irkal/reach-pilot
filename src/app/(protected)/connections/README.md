# HR Connections Feature

This directory contains the HR Connections feature for ReachPilot - a private address book for HR and recruiter contacts.

## Overview

The HR Connections feature allows authenticated users to manage their personal collection of HR and recruiter contacts. Each user has their own private contact list with no sharing between users.

## Features

- **Private Contact Management**: Each user can only access their own connections
- **Contact Information**: Store email (required), name (optional), and LinkedIn URL (optional)
- **Search & Filter**: Search connections by email or name
- **Pagination**: Cursor-based pagination for large contact lists
- **CRUD Operations**: Create, read, update, and delete connections
- **Data Validation**: Strong validation for email format and LinkedIn URLs
- **Duplicate Prevention**: Per-user email uniqueness enforcement

## API Endpoints

### GET /api/app/connections
List connections for the current user with optional search and pagination.

**Query Parameters:**
- `search` (optional): Search term to filter by email or name
- `limit` (optional): Number of results to return (default: 50, max: 100)
- `cursor` (optional): Pagination cursor for next page

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "created_at": "2025-01-01T00:00:00Z",
      "created_by_email": "user@example.com",
      "email": "hr@company.com",
      "name": "John Doe",
      "linkedin_url": "https://www.linkedin.com/in/johndoe"
    }
  ],
  "has_more": false,
  "next_cursor": null
}
```

### POST /api/app/connections
Create a new connection.

**Request Body:**
```json
{
  "email": "hr@company.com",
  "name": "John Doe",
  "linkedin_url": "https://www.linkedin.com/in/johndoe"
}
```

**Response:** `201 Created` with connection data

### GET /api/app/connections/[id]
Fetch a single connection by ID.

**Response:** Connection data or `404 Not Found`

### PATCH /api/app/connections/[id]
Update an existing connection.

**Request Body:** Partial connection data (only include fields to update)

**Response:** Updated connection data

### DELETE /api/app/connections/[id]
Delete a connection.

**Response:** `204 No Content`

## Error Codes

The API returns structured error responses:

- `unauthorized`: User not authenticated
- `not_found`: Connection not found or not owned by user
- `duplicate_email`: A connection with this email already exists for the user
- `validation_error`: Invalid input data
- `invalid_linkedin_url`: LinkedIn URL format is invalid

## Validation Rules

### Email
- Required field
- Must be a valid email format (RFC-like validation)
- Converted to lowercase for storage
- Must be unique per user

### Name
- Optional field
- Maximum 100 characters
- Can contain letters, spaces, hyphens, and apostrophes
- Trimmed of whitespace

### LinkedIn URL
- Optional field
- Must start with `https://www.linkedin.com/` if provided
- Must be a valid URL format

## Database Schema

The connections are stored in the `hr_contacts` table:

```sql
CREATE TABLE public.hr_contacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by_email citext NOT NULL,
    email citext NOT NULL,
    name text,
    linkedin_url text,
    CONSTRAINT unique_user_contact_email UNIQUE (created_by_email, email)
);
```

**Indexes:**
- `idx_hr_contacts_created_by_email` on `created_by_email`
- `idx_hr_contacts_created_at` on `created_at DESC`

**Row Level Security (RLS):**
- Enabled on the table
- No public policies (API routes use service role)

## Security

- **Authentication Required**: All endpoints require valid NextAuth session
- **User Isolation**: Users can only access their own connections
- **Service Role Access**: All database operations use Supabase service role
- **Input Sanitization**: All inputs are validated and normalized
- **No Client-Side DB Access**: Browser clients cannot directly query the database

## Usage Examples

### Creating a Connection
```typescript
const response = await fetch('/api/app/connections', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'hr@example.com',
    name: 'Jane Smith',
    linkedin_url: 'https://www.linkedin.com/in/janesmith'
  }),
});

if (response.ok) {
  const result = await response.json();
  console.log('Created connection:', result.data);
}
```

### Searching Connections
```typescript
const searchParams = new URLSearchParams({
  search: 'example.com',
  limit: '20'
});

const response = await fetch(`/api/app/connections?${searchParams}`);
const result = await response.json();
console.log('Connections:', result.data);
```

### Handling Errors
```typescript
try {
  const response = await fetch('/api/app/connections', {
    method: 'POST',
    body: JSON.stringify(connectionData),
  });

  if (!response.ok) {
    const error = await response.json();
    
    if (error.error === 'duplicate_email') {
      console.log('Email already exists');
    } else if (error.error === 'validation_error') {
      console.log('Validation errors:', error.details);
    }
  }
} catch (err) {
  console.error('Network error:', err);
}
```

## Pages

### /connections
Main listing page showing all user connections with search and pagination.

### /connections/new
Form to create a new connection with validation.

### /connections/[id]
Detail view of a specific connection with inline editing and delete functionality.

## Future Enhancements

Potential improvements for the connections feature:

1. **Import/Export**: Bulk import from CSV or export to various formats
2. **Tags/Categories**: Organize connections with custom tags
3. **Notes**: Add private notes to connections
4. **Communication History**: Track email interactions
5. **Contact Enrichment**: Automatic data enhancement from public sources
6. **Bulk Operations**: Select and modify multiple connections
7. **Advanced Search**: Filter by date ranges, tags, or other criteria
8. **Contact Sharing**: Share specific connections with team members
9. **Integration**: Sync with external CRM systems
10. **Analytics**: Usage statistics and contact interaction insights

## Migration

To set up the database for this feature, run the migration:

```sql
-- Execute the migration in supabase/migrations/20250908_connections.sql
```

This migration is idempotent and safe to re-run.