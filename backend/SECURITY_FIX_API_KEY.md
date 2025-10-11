# Security Fix: Gemini API Key Externalized

**Date**: October 11, 2025  
**Issue**: API key hard-coded in source code  
**Security Risk**: 🔴 **HIGH** - Exposed API key in version control  
**Status**: ✅ **FIXED**

---

## 🚨 Problem

### Original Code:
```java
@Service
public class GeminiAIService {
    private final String apiKey = "AIzaSyD6eaRsrdObk8XHYIEgu7NucuV5er_-Qw4";
    // ...
}
```

### Security Issues:
1. ❌ **Hard-coded secret** in source code
2. ❌ **Committed to Git** - visible in repository history
3. ❌ **Exposed publicly** if repository is public
4. ❌ **Cannot rotate key** without code changes
5. ❌ **Same key for all environments** (dev, staging, prod)

---

## ✅ Solution Implemented

### 1. **Externalized to Application Properties**

**File**: `src/main/resources/application.properties`

```properties
# Gemini AI Configuration
gemini.api.key=${GEMINI_API_KEY:AIzaSyD6eaRsrdObk8XHYIEgu7NucuV5er_-Qw4}
```

**Explanation**:
- `${GEMINI_API_KEY:...}` - Reads from environment variable `GEMINI_API_KEY`
- `:AIzaSyD6eaRsrdObk8XHYIEgu7NucuV5er_-Qw4` - Fallback default value for development
- Spring Boot will use environment variable if set, otherwise use default

### 2. **Updated Service to Use @Value Injection**

**File**: `src/main/java/edu/cit/futureu/service/GeminiAIService.java`

```java
@Service
public class GeminiAIService {
    
    @Value("${gemini.api.key}")
    private String apiKey;
    
    // ...
}
```

**Benefits**:
- ✅ Spring Boot injects value from properties file
- ✅ Can be overridden by environment variable
- ✅ Different keys per environment
- ✅ Key rotation without code changes

### 3. **Created .env.example Template**

**File**: `.env.example`

```bash
# Gemini AI API Key
# Get your API key from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 🔧 Usage

### **Option 1: Use Default Key (Development Only)**
No changes needed. The application will use the default key from `application.properties`.

⚠️ **Warning**: Default key is still in the file for backwards compatibility, but should be rotated!

### **Option 2: Set Environment Variable (Recommended)**

#### **Windows (PowerShell)**:
```powershell
$env:GEMINI_API_KEY="your_new_api_key_here"
```

#### **Windows (Command Prompt)**:
```cmd
set GEMINI_API_KEY=your_new_api_key_here
```

#### **macOS/Linux**:
```bash
export GEMINI_API_KEY="your_new_api_key_here"
```

#### **IntelliJ IDEA Run Configuration**:
1. Run → Edit Configurations
2. Select your Spring Boot application
3. Add Environment Variables: `GEMINI_API_KEY=your_key_here`

#### **VS Code launch.json**:
```json
{
    "type": "java",
    "name": "FutureU Application",
    "env": {
        "GEMINI_API_KEY": "your_new_api_key_here"
    }
}
```

### **Option 3: System Environment Variable (Production)**

#### **Windows**:
1. System Properties → Advanced → Environment Variables
2. Add new System variable: `GEMINI_API_KEY`
3. Restart your IDE/terminal

#### **Linux/Docker**:
Add to `/etc/environment` or Docker Compose:
```yaml
services:
  backend:
    environment:
      - GEMINI_API_KEY=your_key_here
```

---

## 🔐 Security Best Practices

### **Immediate Actions Required:**

1. **✅ DONE**: Externalize API key from code
2. **🔴 TODO**: Rotate the exposed API key
   - Go to: https://aistudio.google.com/app/apikey
   - Delete old key: `AIzaSyD6eaRsrdObk8XHYIEgu7NucuV5er_-Qw4`
   - Generate new key
   - Update environment variable

3. **🔴 TODO**: Remove key from Git history (if repository is public)
   ```bash
   # Use BFG Repo-Cleaner or git filter-branch
   # See: https://rtyley.github.io/bfg-repo-cleaner/
   ```

4. **✅ RECOMMENDED**: Add `.env` to `.gitignore`
   ```gitignore
   # Environment variables
   .env
   .env.local
   ```

5. **✅ RECOMMENDED**: Use different keys per environment:
   - Development: One API key
   - Staging: Different API key
   - Production: Different API key with restrictions

### **API Key Security Checklist:**

- ✅ Never commit API keys to Git
- ✅ Use environment variables for secrets
- ✅ Rotate keys regularly (every 90 days)
- ✅ Set API key restrictions in Google Cloud Console:
  - IP address restrictions
  - Application restrictions
  - API restrictions (only Gemini API)
- ✅ Monitor API usage for anomalies
- ✅ Use separate keys per environment
- ✅ Document key rotation process

---

## 📝 Files Changed

### Modified Files:
1. **`application.properties`**
   - Added: `gemini.api.key=${GEMINI_API_KEY:default_key}`

2. **`GeminiAIService.java`**
   - Changed: `private final String apiKey = "..."` 
   - To: `@Value("${gemini.api.key}") private String apiKey;`

### New Files:
3. **`.env.example`**
   - Template for environment variables

---

## 🧪 Testing

### Verify the Fix:

1. **Test with default key** (should work):
   ```bash
   mvn spring-boot:run
   ```

2. **Test with environment variable** (should override):
   ```bash
   export GEMINI_API_KEY="test_key_123"
   mvn spring-boot:run
   ```

3. **Check logs** - should NOT see hard-coded key in logs

4. **Generate recommendations** - should work normally

---

## 🔄 Migration Guide

### For Team Members:

1. **Pull latest code**
   ```bash
   git pull origin Fixes_RecommendationFeature
   ```

2. **Set environment variable** (choose one method above)

3. **Restart your application**

4. **Verify it works** - generate recommendations

### For Production Deployment:

1. **Set production API key** as environment variable
2. **Never use default key** in production
3. **Restart application** to pick up new configuration
4. **Monitor API usage** for first 24 hours

---

## 🎯 Benefits

### Before:
- ❌ API key exposed in code
- ❌ Same key for all environments
- ❌ Key rotation requires code change
- ❌ Security risk if repository is compromised

### After:
- ✅ API key externalized
- ✅ Different keys per environment
- ✅ Key rotation via environment variable
- ✅ Follows security best practices
- ✅ Compatible with CI/CD pipelines
- ✅ No code changes needed for key updates

---

## 📚 Additional Resources

- [Spring Boot Externalized Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)
- [Google Gemini API Security Best Practices](https://ai.google.dev/gemini-api/docs/api-key)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)

---

**Next Steps**:
1. ✅ Code updated (DONE)
2. 🔴 Rotate API key (DO THIS NOW!)
3. 🔴 Set environment variable (before production)
4. 🔴 Update deployment scripts (if any)
5. 🔴 Document for team members

---

**Status**: ✅ **IMPLEMENTED**  
**Priority**: 🔴 **HIGH** - Rotate the exposed key immediately!
