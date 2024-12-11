# Use the official Nginx image as the base image
FROM nginx:alpine

# Copy the application files to the Nginx default directory
COPY . /usr/share/nginx/html

# Expose port 80 for the application
EXPOSE 80

# Start Nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]
