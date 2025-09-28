# Database Schema Changes for School Code Feature

## Step 1: Add school_code column to users table

```sql
-- Add optional school_code field to existing users table
ALTER TABLE users ADD COLUMN school_code VARCHAR(50) NULL;

-- Add index for better performance when filtering by school code
CREATE INDEX idx_users_school_code ON users(school_code);
```

## Step 2: Create institutions table (optional - for future scaling)

```sql
-- Create institutions table for managing schools
CREATE TABLE institutions (
    institution_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('university', 'college', 'high_school', 'middle_school', 'other') NOT NULL DEFAULT 'other',
    email_domain VARCHAR(100) NULL, -- For institutions like CIT with @cit.edu
    school_code VARCHAR(50) NULL,   -- For institutions without email domains
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Ensure uniqueness
    UNIQUE KEY unique_email_domain (email_domain),
    UNIQUE KEY unique_school_code (school_code)
);

-- Create index for better performance
CREATE INDEX idx_institutions_active ON institutions(is_active);
CREATE INDEX idx_institutions_type ON institutions(type);
```

## Step 3: Insert initial data for CIT

```sql
-- Add CIT as the first institution
INSERT INTO institutions (name, type, email_domain, school_code, is_active) 
VALUES ('Cebu Institute of Technology', 'university', 'cit.edu', 'CIT2024', TRUE);
```

## Step 4: Helper function to get students by institution (for counselor dashboard)

```sql
-- Example query to get students from CIT (by email domain)
SELECT u.*, ua.* 
FROM users u 
LEFT JOIN user_assessments ua ON u.user_id = ua.user_id
WHERE u.email LIKE '%@cit.edu'
ORDER BY u.created_at DESC;

-- Example query to get students by school code
SELECT u.*, ua.* 
FROM users u 
LEFT JOIN user_assessments ua ON u.user_id = ua.user_id
WHERE u.school_code = 'NORTHHS2024'
ORDER BY u.created_at DESC;
```

## Implementation Notes:

1. **Optional Field**: The school_code field is nullable, making it completely optional
2. **No Breaking Changes**: Existing users without school codes continue to work normally
3. **Future Scaling**: The institutions table is optional for now but ready for future expansion
4. **Performance**: Indexes added for efficient filtering in counselor dashboards
5. **Flexibility**: Supports both email domain (CIT) and school code (public schools) approaches