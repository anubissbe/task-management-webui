FROM nginx:alpine

# Copy the new frontend
COPY index-complete.html /usr/share/nginx/html/index.html
COPY app-complete.js /usr/share/nginx/html/
COPY app-fixed.js /usr/share/nginx/html/
COPY app-singleton.js /usr/share/nginx/html/
COPY app-singleton-fixed.js /usr/share/nginx/html/
COPY app-charts-fix.js /usr/share/nginx/html/
COPY app-webhooks-fix.js /usr/share/nginx/html/
COPY app-real-backend.js /usr/share/nginx/html/
COPY app-webhook-final.js /usr/share/nginx/html/

# Custom nginx config for SPA
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
        add_header Cache-Control "no-cache, no-store, must-revalidate"; \
    } \
    \
    location /api { \
        proxy_pass http://host.docker.internal:3009; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]