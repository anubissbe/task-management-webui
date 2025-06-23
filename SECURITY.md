# Security Policy

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 4.5.x   | :white_check_mark: |
| 4.4.x   | :white_check_mark: |
| 4.3.x   | :white_check_mark: |
| < 4.3   | :x:                |

## Reporting a Vulnerability

We take the security of ProjectHub-Mcp seriously. If you discover a security vulnerability, please follow these steps:

### 1. **DO NOT** create a public GitHub issue

Security vulnerabilities should be reported privately to allow us to fix them before they become public knowledge.

### 2. Send a detailed report

Please email us at: **security@anubissbe.dev** (or create a private security advisory on GitHub)

Include the following information:
- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Any proof-of-concept code (if applicable)
- Your contact information for follow-up questions

### 3. Response Timeline

- **Initial Response**: Within 48 hours
- **Assessment**: Within 7 days
- **Fix Development**: 14-30 days (depending on complexity)
- **Public Disclosure**: After fix is deployed and users have time to update

## Security Best Practices

### For Users

1. **Keep Dependencies Updated**
   ```bash
   npm audit fix
   docker pull postgres:latest
   ```

2. **Use Strong Database Credentials**
   ```bash
   # Generate strong passwords
   openssl rand -base64 32
   ```

3. **Enable HTTPS in Production**
   ```yaml
   # docker-compose.yml
   environment:
     - HTTPS_ENABLED=true
     - SSL_CERT_PATH=/certs/cert.pem
     - SSL_KEY_PATH=/certs/key.pem
   ```

4. **Implement Network Security**
   - Use firewalls to restrict database access
   - Implement reverse proxy with rate limiting
   - Use VPN for remote database connections

### For Developers

1. **Input Validation**
   ```typescript
   // Always validate user inputs
   const validateTaskData = (data: any): TaskData => {
     return taskSchema.parse(data); // Using Zod validation
   };
   ```

2. **SQL Injection Prevention**
   ```typescript
   // Use parameterized queries
   const result = await db.query(
     'SELECT * FROM tasks WHERE project_id = $1',
     [projectId]
   );
   ```

3. **Authentication & Authorization**
   ```typescript
   // Implement proper middleware
   const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
     // Verify JWT token
     // Check user permissions
     next();
   };
   ```

4. **Secure Headers**
   ```typescript
   // Express.js security headers
   app.use(helmet({
     contentSecurityPolicy: {
       directives: {
         defaultSrc: ["'self'"],
         scriptSrc: ["'self'", "'unsafe-inline'"],
         styleSrc: ["'self'", "'unsafe-inline'"],
       },
     },
   }));
   ```

## Known Security Considerations

### Current Implementation

1. **Database Access**: Direct PostgreSQL connection without connection pooling limits
2. **File Uploads**: Basic file type validation (implement size limits and virus scanning for production)
3. **Rate Limiting**: Not implemented (recommend implementing for production)
4. **CORS**: Configured for development (tighten for production)

### Recommended Production Hardening

1. **Database Security**
   ```yaml
   # docker-compose.yml
   postgres:
     environment:
       - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
     secrets:
       - db_password
   ```

2. **API Security**
   ```typescript
   // Implement rate limiting
   import rateLimit from 'express-rate-limit';
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   ```

3. **File Upload Security**
   ```typescript
   // Implement file scanning
   const multer = require('multer');
   const upload = multer({
     limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
     fileFilter: (req, file, cb) => {
       // Validate file types
       const allowedTypes = /jpeg|jpg|png|pdf|docx/;
       const isValidType = allowedTypes.test(file.mimetype);
       cb(null, isValidType);
     }
   });
   ```

## Security Audit History

### v3.0.0 (2025-06-13)
- Implemented input validation for all API endpoints
- Added file upload restrictions
- Enhanced SQL injection protection
- Introduced comprehensive error handling

### v2.0.0 (2025-06-13)
- Added CORS configuration
- Implemented basic authentication middleware
- Enhanced database connection security

### v1.0.0 (2025-06-12)
- Initial security implementation
- Basic input sanitization
- Docker container security

## Security Testing

### Automated Security Scanning

1. **Dependency Scanning**
   ```bash
   npm audit
   docker scan task-management-webui
   ```

2. **Static Code Analysis**
   ```bash
   npx eslint-plugin-security
   npm run security-scan
   ```

3. **Container Scanning**
   ```bash
   trivy image task-management-frontend:latest
   trivy image task-management-backend:latest
   ```

### Manual Security Testing

1. **SQL Injection Testing**
   - Test all input parameters
   - Verify parameterized queries
   - Check error message exposure

2. **XSS Prevention**
   - Test user-generated content
   - Verify input sanitization
   - Check CSP headers

3. **Authentication Testing**
   - Verify session management
   - Test authorization boundaries
   - Check password policies

## Compliance

### Data Protection
- User data is stored locally in PostgreSQL
- No third-party data sharing
- Users control their own data export/deletion

### Privacy Considerations
- Minimal data collection
- No tracking or analytics by default
- User consent for optional features

## Emergency Response

### In Case of Security Incident

1. **Immediate Response**
   - Assess the scope and impact
   - Implement temporary mitigations
   - Document all actions taken

2. **Communication**
   - Notify affected users promptly
   - Provide clear instructions for protection
   - Share timeline for permanent fix

3. **Recovery**
   - Deploy security patches
   - Verify fix effectiveness
   - Conduct post-incident review

## Contact Information

For security-related questions or concerns:

- **Security Team**: security@anubissbe.dev
- **Emergency Contact**: Available 24/7 for critical vulnerabilities
- **Public Key**: Available on request for encrypted communications

## Acknowledgments

We thank the security research community for their responsible disclosure of vulnerabilities. Contributors who report valid security issues will be acknowledged in our security advisories (unless they prefer to remain anonymous).

---

**Last Updated**: June 13, 2025  
**Next Review**: December 13, 2025