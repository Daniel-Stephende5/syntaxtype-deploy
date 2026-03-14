# Pitfalls Research

**Domain:** Spring Boot Security Fixes (Brownfield Application)
**Researched:** 2026-03-14
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Enabling Auth Breaks All Existing API Clients

**What goes wrong:**
When JWT authentication is enabled, every existing API call fails with 401 Unauthorized. The frontend was written assuming all endpoints are public (`permitAll`), so enabling authentication without updating clients causes complete application failure.

**Why it happens:**
The current codebase has `.requestMatchers("/api/**").permitAll()` on line 54 of SecurityConfig.java. All frontend API calls are unauthenticated. Developers enable auth but forget that every client (React app, mobile apps, integrations) needs to be updated to include JWT tokens in requests.

**How to avoid:**
1. Create a phased rollout: enable auth for specific endpoints first (e.g., user data endpoints)
2. Ensure frontend adds Authorization header to all API calls before enabling global auth
3. Implement a fallback mode or maintenance window
4. Test all client integrations (web, any mobile apps, any third-party consumers)

**Warning signs:**
- Frontend has no token storage/management logic
- All current API calls have no Authorization header
- No existing JWT filter in the chain (currently commented out)
- No login flow implemented in frontend

**Phase to address:** Security Hardening Phase (must be done before auth is fully enabled)

---

### Pitfall 2: Hardcoded Secrets Remain in Code After "Fix"

**What goes wrong:**
Developers move secrets to environment variables but leave fallback default values that are still hardcoded in application.properties. Attackers find the fallback values in source code or leaked configs.

**Why it happens:**
Using pattern like `${JWT_SECRET:YourSuperSecretKey}` - the default value "YourSuperSecretKey" is still in source code. Developers forget that defaults are visible in the source.

**How to avoid:**
1. Use environment variables with NO defaults: `${JWT_SECRET}` (will fail fast if not set)
2. Use a secrets manager (AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager)
3. Verify with grep that no actual secret values remain in source: `grep -r "password\|secret\|key" src/ --include="*.properties"`
4. Add secrets detection to CI/CD pipeline

**Warning signs:**
- application.properties contains any value that looks like a real credential
- Any default value in `${ENV_VAR:default}` pattern exists
- No secrets manager integration
- No environment variable validation on startup

**Phase to address:** Security Hardening Phase - Secrets Management

---

### Pitfall 3: JWT Tokens Without Expiration

**What goes wrong:**
JWT tokens are created without `exp` claim or with extremely long expiration. Tokens that leak remain valid indefinitely, allowing attackers permanent access.

**Why it happens:**
Default JWT implementations often don't set expiration, or developers set "never expire" for "simplicity" during development and forget to fix it.

**How to avoid:**
1. Set short expiration (15-30 minutes for access tokens)
2. Implement refresh token flow for sustained sessions
3. Add token blacklisting/revocation for logout
4. Verify JWT payload includes `exp` claim: `jwt.getExpiration()`

**Warning signs:**
- JWT generation code has no expiration parameter
- Current jwt.secret in codebase has no expiration configuration
- No refresh token mechanism exists
- Logout doesn't invalidate tokens

**Phase to address:** Security Hardening Phase - JWT Implementation

---

### Pitfall 4: Using Deprecated Spring Security Configuration

**What goes wrong:**
Security config extends `WebSecurityConfigurerAdapter` which was removed in Spring Security 6.0 / Spring Boot 3. Application fails to compile or has undefined behavior.

**Why it happens:**
Developers copy tutorials from 2019-2021 that use the deprecated class. Spring Boot 3.x (which the project uses) requires the new component-based security configuration.

**How to avoid:**
1. Verify SecurityConfig.java uses `@Bean SecurityFilterChain` pattern (not extends WebSecurityConfigurerAdapter)
2. Use `requestMatchers()` instead of deprecated `antMatchers()`
3. Check pom.xml for Spring Security version compatibility
4. For Spring Boot 3.x, use Spring Security 6.x patterns

**Warning signs:**
- SecurityConfig extends WebSecurityConfigurerAdapter
- Uses `.antMatchers()` instead of `.requestMatchers()`
- No `@Bean SecurityFilterChain` method exists
- Compilation errors about missing WebSecurityConfigurerAdapter

**Phase to address:** Security Configuration Migration

---

### Pitfall 5: Global Exception Handlers Still Disabled

**What goes wrong:**
With authentication enabled, unhandled exceptions leak stack traces to clients. Authentication errors expose internal logic. Debug-mode exception responses reveal system details.

**Why it happens:**
GlobalExceptionHandler and RestExceptionHandler are currently commented out (per CONCERNS.md). Developers enable auth but forget to re-enable exception handling, causing information disclosure.

**How to avoid:**
1. Uncomment and update GlobalExceptionHandler BEFORE enabling auth
2. Create specific exception handlers for auth failures (BadCredentialsException, AccountStatusException)
3. Ensure exception responses are consistent and don't leak stack traces
4. Test exception scenarios: bad credentials, expired token, malformed token

**Warning signs:**
- GlobalExceptionHandler.java has all methods commented out
- No authentication exception handling exists
- No standardized error response format (DTO)
- application.properties has debug logging enabled

**Phase to address:** Error Handling Phase (must complete before auth)

---

### Pitfall 6: Forgetting to Remove Debug Logging in Production

**What goes wrong:**
Debug logging reveals authentication tokens, request headers, user credentials, and internal logic in production logs. Attackers who gain access to logs can harvest valid credentials.

**Why it happens:**
application.properties has `logging.level.backend=DEBUG` and `logging.level.org.springframework.security=DEBUG`. These were set for troubleshooting but never reverted.

**How to avoid:**
1. Set production logging to INFO or WARN: `logging.level.root=WARN`, `logging.level.com.syntaxtype=INFO`
2. Never log authentication tokens (mask or omit)
3. Never log request parameters containing sensitive data
4. Add log review to deployment checklist

**Warning signs:**
- Any DEBUG level logging in application.properties
- Logging includes request bodies or headers
- No log sanitization logic
- No environment-specific logging config (dev vs prod)

**Phase to address:** Security Hardening Phase - Logging Configuration

---

### Pitfall 7: Role-Based Access Not Properly Tested

**What goes wrong:**
`@PreAuthorize` annotations exist in controllers but never execute because authentication is disabled. When auth is enabled, role checks are misconfigured or bypassed, granting unauthorized access.

**Why it happens:**
Controllers use `@PreAuthorize("hasRole('ADMIN')")` but the JWT filter was never properly configured to extract roles. JWT token might not include roles, or role extraction logic is missing.

**How to avoid:**
1. Verify JWT contains role claims (typically `roles` or `authorities` claim)
2. Configure JWT filter to extract roles and create authorities
3. Test each role with each endpoint they should/shouldn't access
4. Verify that unauthenticated requests are rejected (401/403)
5. Verify that wrong-role requests are rejected (403)

**Warning signs:**
- JWT token doesn't include role information
- No role-to-authority conversion in JWT filter
- No integration tests for role-based access
- Controllers have @PreAuthorize but no tests verify it works

**Phase to address:** Security Hardening Phase - Authorization Testing

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using weak JWT secret | Easier testing | Tokens can be forged, complete auth bypass | NEVER |
| Hardcoding fallback secrets | Works without env vars | Secrets in source control, easy to leak | NEVER (use failsafe defaults only) |
| permitAll for all endpoints | No auth testing needed | No security, complete data exposure | ONLY during development, never production |
| Disabling exception handlers | Simpler to implement | Information leakage, poor UX | NEVER |
| Using deprecated security config | Copy-paste works | Breaking changes on upgrade, security gaps | NEVER |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Hardcoded JWT secret in source | Attackers forge tokens, hijack sessions | Use environment variables, verify with grep |
| Weak admin password "admin123" | Account takeover, full system access | Enforce password policy, reject weak passwords |
| Database credentials in source | Direct database access, data breach | Use secrets manager, rotate credentials |
| CORS allowing all origins | Cross-site request forgery | Restrict to known frontend domains |
| No rate limiting on login | Brute force attacks | Implement attempt limiting, account lockout |

---

## "Looks Done But Isn't" Checklist

- [ ] **Security Config:** Appears configured but uses deprecated WebSecurityConfigurerAdapter
- [ ] **Auth Enabled:** JWT filter uncommented but role extraction not tested
- [ ] **Secrets Externalized:** Environment variables set but hardcoded fallbacks remain
- [ ] **Exception Handling:** Handlers uncommented but auth exceptions not handled
- [ ] **Role Security:** @PreAuthorize annotations exist but never verified working
- [ ] **CORS Config:** Allowed origins hardcoded, not environment-based
- [ ] **Logout:** Logout endpoint exists but doesn't invalidate tokens

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Auth breaks all clients | HIGH | Revert SecurityConfig, implement auth in frontend, redeploy both |
| Secrets leak | HIGH | Rotate all secrets, revoke tokens, audit access logs |
| Deprecated config breaks upgrade | MEDIUM | Rewrite SecurityConfig using current patterns |
| Role checks don't work | MEDIUM | Debug JWT filter, add role extraction, retest all roles |
| Logs expose tokens | MEDIUM | Rotate tokens, change logging levels, purge logs |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Auth breaks clients | Security Hardening - Frontend Token Integration | Test all API calls with auth header |
| Hardcoded secrets remain | Security Hardening - Secrets Management | Grep source for secret patterns |
| JWT tokens no expiration | Security Hardening - JWT Implementation | Inspect token payload |
| Deprecated config | Security Configuration Migration | Compile with Spring Boot 3 |
| Exception handlers disabled | Error Handling Phase | Test error responses |
| Debug logging in prod | Security Hardening - Logging | Verify prod log level |
| Role access not tested | Security Hardening - Authorization | Test each role's access |

---

## Sources

- CodeTalks. "Spring Boot Security Best Practices (2026 Guide for Production Apps)." Medium, March 2026.
- Karuna. "7 Spring Boot Security Misconfigurations Hackers Love." Stackademic, March 2026.
- Ujjawal Rohra. "10 Spring Security Mistakes That Quietly Make Your App Vulnerable." Medium, January 2026.
- Katyella. "Spring Boot Security Best Practices: Authentication, JWT, and OAuth2." March 2026.
- Things I Broke in Production. "We Upgraded Spring Boot and Accidentally Changed Our Security Model." Medium, January 2026.
- DevGlan. "JWT Authentication Explained: Internals, Common Pitfalls, and Secure Spring Boot Implementation." December 2025.

---

*Pitfalls research for: Spring Boot Security Fixes*
*Researched: 2026-03-14*