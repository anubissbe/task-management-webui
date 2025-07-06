FROM nginx:alpine

# Copy static files
COPY index.html /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/
COPY favicon.svg /usr/share/nginx/html/

# Copy nginx configuration - use standalone by default to avoid DNS issues
COPY nginx.standalone.conf /etc/nginx/conf.d/default.conf

# Also copy the full nginx.conf for docker-compose deployments
COPY nginx.conf /etc/nginx/conf.d/full.conf.template

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]