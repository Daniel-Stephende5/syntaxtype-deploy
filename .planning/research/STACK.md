# Technology Stack: JWT Authentication & Secrets Management

**Project:** SyntaxType - Spring Boot + React Educational Platform  
**Researched:** 2026-03-14  
**Domain:** Security Stack Improvements

---

## Executive Summary

This application requires enabling JWT authentication and fixing hardcoded secrets. The current codebase has a functional JWT implementation using `jjwt 0.12.6`, but authentication is disabled and credentials are hardcoded.

**Recommended approach:**
1. Enable existing JWT filter (already implemented correctly)
2. Externalize all secrets to environment variables
3. Implement role-based access control with `@PreAuthorize`
4. Add refresh token support for production use

---

## Recommended Stack

### Core Security Dependencies

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| jjwt-api | **0.12.6** | JWT token generation and validation | Already in use, stable, well-maintained |
| jjwt-impl | **0.12.6** | JWT signing implementation | Required runtime dependency |
| jjwt-jackson | **0.12.6** | JSON serialization for JWT | Required runtime dependency |
| Spring Security | 3.4.4 (BOM) | Authentication framework | Ships with Spring Boot |
| BCrypt | Included | Password hashing | Industry standard |

**Note:** jjwt 0.13.0 is available (Aug 2025) but 0.12.6 is stable and works. Recommend upgrading after JWT is working.

### Secrets Management

| Approach | When to Use | Implementation |
|----------|-------------|----------------|
| Environment Variables | Development, simple production | `${ENV_VAR:default}` in properties |
| HashiCorp Vault | Enterprise, multi-service | Spring Cloud Vault integration |
| AWS Secrets Manager | AWS-hosted production | AWS SDK integration |
| Render Secrets | Current hosting | Render dashboard environment variables |

---

## Current Assessment

### What's Already Present

The codebase has the foundation for JWT auth:

| Component | Status | Notes |
|-----------|--------|-------|
| JwtUtil.java | ✅ Complete | Uses modern 0.12.x API with `verifyWith()` |
| JwtAuthFilter.java | ✅ Complete | Extracts token, sets security context |
| CustomUserDetailsService | ✅ Present | UserDetails implementation |
| SecurityConfig | ⚠️ Disabled | JWT filter commented out, all endpoints `permitAll()` |
| BCryptPasswordEncoder | ✅ Configured | Already in SecurityConfig |

### What's Missing

| Component | Priority | Action |
|-----------|----------|--------|
| Secrets in env vars | CRITICAL | Move DB password, JWT secret from application.properties |
| JWT filter enabled | CRITICAL | Uncomment line 57 in SecurityConfig.java |
| Role-based access | HIGH | Change `.permitAll()` to `.authenticated()` per endpoint |
| Refresh token support | MEDIUM | Add endpoint for token refresh |
| HTTP-only cookies | MEDIUM | Store JWT in cookies, not localStorage |

---

## Implementation Guide

### 1. Fix Hardcoded Secrets

**Current (INSECURE):**
```properties
# application.properties - DON'T DO THIS
spring.datasource.password=TQy3eXhqMznlL4CphjFCtIUotT3wKMqH
jwt.secret=YourSuperSecretKeyThatIsAtLeast256BitsLongAndRandom
admin.password=admin123
```

**Recommended:**
```properties
# application.properties
spring.datasource.password=${DB_PASSWORD}
jwt.secret=${JWT_SECRET:default-dev-only-change-in-prod}
admin.password=${ADMIN_PASSWORD:admin123}
```

**For Render deployment:** Set these as Environment Variables in the Render dashboard.

**Generate secure JWT secret:**
```bash
openssl rand -base64 32
```

### 2. Enable JWT Authentication

**SecurityConfig.java changes:**

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    // ... existing code ...

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()  // Login/register
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/teacher/**").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers("/api/**").authenticated()   // All other API - require auth
                .anyRequest().permitAll()                       // Static files, docs
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);  // UNCOMMENT THIS

        return http.build();
    }
}
```

### 3. JWT Best Practices (2025/2026)

| Practice | Recommendation | Implementation |
|----------|---------------|----------------|
| Token expiry | 15-60 minutes for access | `EXPIRATION_TIME = 900000` (15 min) |
| Refresh tokens | 7 days | Store in DB, implement rotation |
| Secret key | 256-bit minimum | Base64-encoded 32 bytes |
| HTTPS | **Required** | Enforce in production |
| Password storage | BCrypt | Already implemented |
| Token storage | HTTP-only cookies | For browser clients |

### 4. Recommended JwtUtil Enhancements

```java
@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String SECRET_KEY;

    // Short-lived access token: 15 minutes
    private static final long ACCESS_TOKEN_EXPIRY = 900000;
    
    // Longer refresh token: 7 days  
    private static final long REFRESH_TOKEN_EXPIRY = 604800000;

    private SecretKey getSigningKey() {
        // Use Base64 decode for proper key handling
        return Keys.hmacShaKeyFor(Base64.getDecoder().decode(SECRET_KEY));
    }

    public String generateAccessToken(String username, String role, Long userId) {
        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .claim("id", userId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRY))
                .signWith(getSigningKey())
                .compact();
    }

    // Add refresh token method - store in database
    public String generateRefreshToken(String username) {
        return Jwts.builder()
                .subject(username)
                .claim("type", "refresh")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRY))
                .signWith(getSigningKey())
                .compact();
    }
}
```

---

## Anti-Patterns to Avoid

| Anti-Pattern | Why Bad | Instead |
|--------------|---------|---------|
| Storing JWT in localStorage | XSS can steal tokens | Use HTTP-only cookies |
| Long-lived access tokens (24h+) | Compromised token = long attack window | 15-60 minute expiry |
| Hardcoded secrets in code | Anyone with repo access = full compromise | Environment variables |
| Weak JWT secret | Brute-forceable | 256-bit random key |
| Not validating all claims | Signature ok but other attacks possible | Validate issuer, audience, expiration |
| Using `.permitAll()` on API endpoints | No authentication = data exposure | Role-based access |

---

## Dependencies

```xml
<!-- pom.xml additions for JWT (already present, verify versions) -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>

<!-- Spring Security (already present via spring-boot-starter-security) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| JWT library choice (jjwt) | HIGH | Industry standard, already in use |
| Version recommendation | HIGH | 0.12.6 stable, 0.13.0 available but new |
| SecurityConfig pattern | HIGH | Modern Spring Security 6.x approach |
| Secrets management | HIGH | Environment variables is standard practice |
| Role-based access | MEDIUM | Existing implementation needs testing |

---

## Sources

### Primary (Verified)
- [JJWT GitHub Releases](https://github.com/jwtk/jjwt/releases) - Version history and latest releases (0.13.0, Aug 2025)
- [JJWT 0.12.x API Changes](https://github.com/jwtk/jjwt/issues/957) - Breaking changes between 0.11 and 0.12
- [Spring Security 6.x Documentation](https://docs.spring.io/spring-security/reference/) - SecurityFilterChain pattern

### Secondary (High Confidence)
- [Spring Boot Security Best Practices (Katyella)](https://katyella.com/blog/spring-boot-security-best-practices/) - 2024/2025 guidance
- [JWT Authentication Guide (CodeToDeploy)](https://medium.com/codetodeploy/jwt-authentication-in-spring-boot-secure-your-apis-the-right-way-76cab16368ae) - Feb 2026
- [OneUptime JWT Guide](https://oneuptime.com/blog/post/2026-01-25-jwt-authentication-spring-security/view) - Jan 2026

### Tertiary (For Advanced Implementation)
- [HashiCorp Vault + Spring Boot](https://harshad-sonawane.com/blog/spring-boot-secrets-management-vault-aws/) - Enterprise secrets management
- [Spring Cloud Vault](https://www.springfuse.com/managing-secrets-in-microservices/) - Vault integration patterns
