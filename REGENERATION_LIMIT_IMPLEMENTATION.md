# Regeneration Limit Protection Implementation

## Overview
Added a protection system to limit students to 2 recommendation regenerations per assessment to protect the Gemini API quota.

## Changes Made

### 1. Backend - Database Schema
**File:** `backend/futureu/add_regeneration_count.sql`
- Added `regeneration_count` column to `user_assessment` table
- Default value: 0
- Type: INT NOT NULL

**To Apply:**
```sql
-- Run this SQL script in your database
mysql -u your_user -p your_database < backend/futureu/add_regeneration_count.sql
```

### 2. Backend - Entity
**File:** `UserAssessmentEntity.java`
- Added `regenerationCount` field with getter/setter
- Added `incrementRegenerationCount()` helper method
- Column definition: `@Column(nullable = false, columnDefinition = "INT DEFAULT 0")`

### 3. Backend - Controller
**File:** `CareerRecommendationController.java`

#### Updated `/regenerate/{userAssessmentId}` endpoint:
- Checks regeneration count before processing
- Returns HTTP 429 (Too Many Requests) if limit reached
- Increments count on successful enqueue
- Returns regeneration info in response:
  ```json
  {
    "jobId": 123,
    "status": "QUEUED",
    "regenerationCount": 1,
    "remainingRegenerations": 1
  }
  ```

#### Added new endpoint `/regeneration-info/{userAssessmentId}`:
- GET request to check current regeneration status
- Returns:
  ```json
  {
    "regenerationCount": 1,
    "maxRegenerations": 2,
    "remainingRegenerations": 1,
    "canRegenerate": true
  }
  ```

### 4. Frontend - Service
**File:** `recommendationService.js`
- Added `getRegenerationInfo(userAssessmentId)` function
- Calls the new backend endpoint

### 5. Frontend - Component
**File:** `RecommendationsTab.jsx`

#### State Management:
- Added `regenerationInfo` state to track limits
- Fetches regeneration info on component mount
- Updates info after each regeneration

#### UI Changes:
- **Regenerate button** is disabled when limit reached
- Shows **"X regenerations remaining"** badge next to button
- Displays **"No regenerations left"** when limit hit
- Shows helpful error message when 429 error occurs

#### Error Handling:
- Catches HTTP 429 responses
- Displays user-friendly message
- Updates UI to reflect limit reached state

## User Experience

### Normal Flow:
1. Student opens Recommendations tab
2. Sees "2 regenerations remaining" badge
3. Clicks "Regenerate Matches"
4. Badge updates to "1 regeneration remaining"
5. After 2nd regeneration: Badge shows "No regenerations left"
6. Button becomes disabled (grayed out)

### Limit Reached:
- **Button state:** Disabled, grayed out
- **Badge:** "No regenerations left" in red
- **Tooltip:** "Regeneration limit reached" on hover
- **Error message:** "You have reached the maximum number of regenerations (2) for this assessment."

## API Protection Benefits

### Before (No Limits):
- Students could regenerate unlimited times
- 35-50 generations per day maximum
- ~10-20 students could use the system

### After (2 Regeneration Limit):
- Each student can only regenerate twice (3 total: 1 initial + 2 regenerations)
- 35-50 generations ÷ 3 = **11-16 students can complete assessments per day**
- With careful usage: **More students can take initial assessments**

### With Multiple Students:
- 20 students × 1 initial generation = 20 API calls ✅
- 10 students × 2 regenerations = 20 additional API calls ✅
- **Total: 40 generations (well within limits!)**

## Configuration

To change the regeneration limit, update these locations:

1. **Backend Controller:**
   ```java
   final int MAX_REGENERATIONS = 2; // Change this value
   ```

2. **Frontend State (optional for better UX):**
   ```javascript
   const [regenerationInfo, setRegenerationInfo] = useState({
     maxRegenerations: 2, // Default fallback
     // ...
   });
   ```

## Testing Checklist

- [ ] Database migration applied successfully
- [ ] Backend compiles without errors
- [ ] Frontend displays regeneration count
- [ ] First regeneration works (count increases)
- [ ] Second regeneration works (count increases)
- [ ] Third regeneration blocked with 429 error
- [ ] Button disabled when limit reached
- [ ] Badge shows correct remaining count
- [ ] Error message is user-friendly

## Database Migration

Run this command to apply the migration:

```bash
# Using MySQL command line
mysql -u root -p futureu_database < backend/futureu/add_regeneration_count.sql

# Or using Spring Boot (if you have Flyway/Liquibase configured)
# The column will be auto-created from the entity definition
```

## Rollback Plan

If you need to remove this feature:

```sql
ALTER TABLE user_assessment DROP COLUMN regeneration_count;
```

Then revert the code changes.

## Notes

- Initial generation (first time clicking "See My Results") does NOT count toward the limit
- Only "Regenerate Matches" button increments the counter
- Limit is per assessment attempt, not per user
- Counselors/Admins may need higher limits (consider role-based limits in future)
