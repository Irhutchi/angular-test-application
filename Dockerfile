FROM cypress/base:16.17.0

# Create working directory
RUN mkdir /app  
 
# Set working directory
WORKDIR /app 
 
# Copy all project files into working directory
COPY . /app

RUN yarn install

RUN $(npm bin)/cypress verify

RUN ["npm", "run", "cypress:e2e"]