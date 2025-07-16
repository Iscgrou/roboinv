# Use an official Node.js runtime as a parent image
FROM node:latest

# Set the working directory in the container
WORKDIR /usr/src/app

# Install any needed packages specified in package.json
COPY package*.json ./
RUN npm install

# Copy the application source code to the container
COPY . .

# Expose the port the app runs on (if applicable)
EXPOSE 3000

# Define the command to run the application
CMD [ "node", "index.js" ]