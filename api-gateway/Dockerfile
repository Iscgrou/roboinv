# Use an official Node.js runtime as a parent image
FROM node:latest

# Set the working directory in the container
WORKDIR /usr/src/app

# Install any needed packages specified in package.json
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose the port the app runs on (if applicable)
# EXPOSE 8080

# Define the command to run your app
# CMD [ "node", "your-app.js" ]