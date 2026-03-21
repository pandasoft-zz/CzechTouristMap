FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/maprender.conf

# Copy static frontend files
COPY index.html app.js style.css /usr/share/nginx/html/

EXPOSE 80
