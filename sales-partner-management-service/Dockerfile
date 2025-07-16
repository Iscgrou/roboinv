# Use an official Node.js runtime as a parent image
FROM node:latest

# Set the working directory in the container
WORKDIR /usr/src/app

# Install any needed packages specified in package.json
COPY package*.json ./
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Run the application
CMD [ "node", "index.js" ]