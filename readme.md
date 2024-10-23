
# Rule Engine and Weather Monitoring Applications

This repository contains two applications: a Rule Engine with Abstract Syntax Tree (AST) capabilities and a Real-Time Data Processing System for Weather Monitoring. Each application is designed to handle specific tasks using modern technologies.

## Table of Contents
- [Applications Overview](#applications-overview)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Docker Setup](#docker-setup)
- [Usage](#usage)
- [Test Cases](#test-cases)
- [Bonus Features](#bonus-features)
- [Contributing](#contributing)
- [License](#license)

## Applications Overview

### 1. Rule Engine with AST
**Objective:** Develop a simple 3-tier rule engine application to determine user eligibility based on attributes like age, department, income, and spend. The system uses an Abstract Syntax Tree (AST) to represent conditional rules and allows for dynamic creation, combination, and modification of these rules.

**Sample Rules:**
- Rule 1: `((age > 30 AND department = 'Sales') OR (age < 25 AND department = 'Marketing')) AND (salary > 50000 OR experience > 5)`
- Rule 2: `((age > 30 AND department = 'Marketing')) AND (salary > 20000 OR experience > 5)`

### 2. Real-Time Data Processing System for Weather Monitoring
**Objective:** Develop a real-time data processing system to monitor weather conditions and provide summarized insights using rollups and aggregates, utilizing data from the OpenWeatherMap API.

## Tech Stack

### Rule Engine
- **Backend:** Node.js, MongoDB
- **Frontend:** React.js, Tailwind CSS, Bootstrap

### Weather Monitoring
- **Frontend:** Next.js
- **Context:** Auth context for Weather API verification, storing state in local storage

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/JeevanJoshi4434/zeotap.git
   cd zeotap
   ```

2. Ensure you have Docker and Docker Compose installed.


## Docker Setup

To set up the application using Docker, you can use the provided `Dockerfile` and `docker-compose.yml`.

### Dockerfile for Each Service

**Rule Engine Frontend:**
```dockerfile
FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 2355
CMD ["npm", "start"]
```

**Rule Engine Backend:**
```dockerfile
FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 2354
CMD ["npm", "run", "start"]
```

**Weather Monitoring Frontend:**
```dockerfile
FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 2353
CMD ["npm", "run", "start"]
```

### Docker Compose Configuration
```yaml
version: '3.8'
services:
  frontend-react:
    build: ./AST-checker/frontend-react
    ports:
      - "2355:2355"
    environment:
      NODE_ENV: development
      REACT_APP_API_URL: http://localhost:2354
    deploy:
      replicas: 2
    depends_on:
      - backend-nodejs

  backend-nodejs:
    build: ./AST-checker/backend-nodejs
    ports:
      - "2354:2354"
    environment:
      NODE_ENV: development
      DATABASE_URL: mongodb://mongo:27017/mydatabase
    deploy:
      replicas: 2
    depends_on:
      - mongo

  frontend-nextjs:
    build: ./Weather-app/frontend-nextjs
    ports:
      - "2353:2353"
    environment:
      NODE_ENV: development
      WEATHER_API_KEY: YOUR_WEATHER_API_KEY_HERE
    deploy:
      replicas: 2

  mongo:
    image: mongo:latest
    ports:
      - "2356:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## Usage

1. Start the application with Docker Compose:
   ```bash
   docker-compose up --build
   ```

2. Access the applications:
   - Rule Engine Frontend: [http://localhost:2355](http://localhost:2355)
   - Rule Engine Backend: [http://localhost:2354](http://localhost:2354)
   - Weather Monitoring Frontend: [http://localhost:2353](http://localhost:2353)

## Test Cases

1. Verify system startup and API connectivity.
2. Simulate API calls for weather data retrieval.
3. Validate temperature conversions and aggregate calculations.
4. Test alerting thresholds and ensure notifications are triggered as expected.

## Bonus Features
- Implement error handling for invalid rule strings or data formats (e.g., missing operators,
 invalid comparisons).
- Implement validations for attributes to be part of a catalog.
- Allow for modification of existing rules using additional functionalities.
- App notification system implemented.
- Extensive error handling for invalid rule strings or data formats.
- Extend the system to support additional weather parameters from the OpenWeatherMap
- API (e.g., humidity, wind speed) and incorporate them into rollups/aggregates.
- functionalities like weather forecasts retrieval and generating summaries based on predicted conditions.