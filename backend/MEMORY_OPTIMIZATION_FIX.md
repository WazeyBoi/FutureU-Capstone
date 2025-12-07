# Memory Optimization Fix for Counselor Dashboard

## Problem
The counselor dashboard was experiencing `OutOfMemoryError: Java heap space` due to:
1. **N+1 Query Problem**: Loading all students, then making separate queries for each student's assessments
2. **Loading All Data**: Loading all assessment results and student data into memory at once
3. **No Pagination**: No limits on data retrieval

## Solutions Implemented

### 1. Optimized CounselorService.getInstitutionStudentResults()
- **Before**: Loaded all students, then for each student made a separate query for assessments (N+1 problem)
- **After**: 
  - Uses batch queries with JOIN FETCH to load students and assessments in 2 queries total
  - Groups assessments by student ID in memory for efficient lookup
  - Removed detailed assessment list from response to save memory (maintains API compatibility)

### 2. Added Pagination Support
- New method: `getInstitutionStudentResultsPaginated(int counselorId, int page, int size)`
- New endpoint: `/api/institution/counselor/{counselorId}/students/paginated?page=1&size=50`
- Existing endpoint now supports optional pagination: `/api/institution/counselor/{counselorId}/students?page=1&size=50`

### 3. Optimized Stats Method
- **Before**: Loaded all student results just to calculate stats
- **After**: Uses direct SQL aggregation queries to calculate stats without loading all data
- New method: `getInstitutionAssessmentStats()` uses COUNT and AVG queries

### 4. Optimized getAllAssessmentResults()
- **Before**: Loaded all assessment results with `findAll()`
- **After**: 
  - Limited to 1000 results by default to prevent memory issues
  - Added pagination support: `/api/assessment-results/getAllAssessmentResults/paginated?page=1&size=100`
  - Existing endpoint supports optional pagination parameters

## Technical Changes

### CounselorService.java
- Added `@PersistenceContext EntityManager` for custom JPQL queries
- Added `@Transactional(readOnly = true)` for read-only operations
- Implemented batch loading with JOIN FETCH
- Created paginated version of student results method
- Optimized stats calculation to use SQL aggregation

### InstitutionController.java
- Added `@RequestParam` support for pagination
- Added new paginated endpoint
- Maintained backward compatibility with existing endpoints

### AssessmentResultService.java
- Limited default results to 1000
- Added pagination support with Spring Data Page
- Added `@Transactional(readOnly = true)` annotations

### AssessmentResultController.java
- Added optional pagination parameters to existing endpoint
- Added new paginated endpoint

## Recommendations

### Immediate Actions
1. **Increase JVM Heap Size** (temporary measure):
   ```bash
   java -Xmx2g -Xms1g -jar your-app.jar
   ```
   Or set in `application.properties`:
   ```properties
   spring.jpa.properties.hibernate.jdbc.batch_size=50
   ```

2. **Update Frontend** (if needed):
   - Consider using paginated endpoints for large datasets
   - Implement client-side pagination or infinite scroll
   - Load data in chunks rather than all at once

### Long-term Improvements
1. **Database Indexing**: Ensure indexes on:
   - `user.email` (for domain searches)
   - `user.schoolCode`
   - `user_assessment.userId`
   - `user_assessment.dateCompleted`

2. **Caching**: Consider caching frequently accessed data:
   - Institution stats
   - Student counts
   - Assessment summaries

3. **Lazy Loading**: Ensure entity relationships use lazy loading where appropriate

4. **Connection Pooling**: Configure appropriate connection pool size

## Testing
After deployment, monitor:
- Memory usage (should be significantly lower)
- Response times (should be faster with optimized queries)
- Error rates (should eliminate OutOfMemoryError)

## Backward Compatibility
All changes maintain backward compatibility:
- Existing endpoints still work without pagination
- Response structure unchanged (except removed detailed assessment list in student results)
- Frontend should continue to work without changes (though pagination is recommended)

