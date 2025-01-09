
```markdown
# Cachie: Token Analytics and Search Tracking Service

## Overview

Cachie is a sophisticated TypeScript-based Express.js microservice designed for tracking and analyzing search tokens across different clients and sessions. It provides robust search recording, token analysis, and rate-limiting capabilities.

## 🚀 Features

- **Search Token Tracking**
  - Record search queries with client and session information
  - Tokenize and process search terms
  - Maintain detailed analytics on token usage

- **Token Analysis**
  - Support for exact and fuzzy token matching
  - Comprehensive token statistics
  - Client and session distribution insights

- **Rate Limiting**
  - Configurable request limits
  - Per-client rate control
  - Automatic request count reset

- **Logging**
  - Comprehensive Winston-based logging
  - Detailed error and information tracking

- **OpenAPI Documentation**
  - Swagger UI integration
  - Interactive API documentation

## 🛠 Tech Stack

- **Language**: TypeScript
- **Framework**: Express.js
- **Validation**: Joi
- **Logging**: Winston
- **API Documentation**: Swagger UI, express-openapi
- **Testing**: Jest
- **Development**: ts-node-dev

## 📦 Prerequisites

- Node.js (v20+)
- npm or Yarn

## 🔧 Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/cachie.git
cd cachie
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Create a `.env` file with the following configurations:
```bash
PORT=3000
REQUEST_LIMIT=10
RATE_LIMIT_RESET_INTERVAL=60000
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
# or
yarn dev
```

### Production Build
```bash
npm run build
npm start
# or
yarn build
yarn start
```

## 📝 API Endpoints

### 1. Search Recording
- **URL**: `/search`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "search_query": "example search",
    "client_id": "client123",
    "session_id": "session456"
  }
  ```

### 2. Token Analysis
- **URL**: `/analyse`
- **Method**: GET
- **Query Parameters**:
  - `analysis_token`: Token(s) to analyze
  - `match_type`: `"exact"` or `"fuzzy"` (default: `"exact"`)
  - `include_stats`: `true` or `false` (default: `false`)

## 📊 API Documentation

Access Swagger UI documentation at: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## 🧪 Testing

Run tests with:
```bash
npm test
# or
yarn test
```

## 🔍 Key Components

- **CacheService**: Core logic for search and token tracking
- **RateLimiter**: Middleware for managing request rates
- **Validation**: Request validation using Joi
- **Logging**: Centralized logging with Winston

## 🛡️ Error Handling

- Comprehensive error logging
- Graceful error responses
- Rate limit protection

## 🔒 Security Considerations

- Input validation
- Rate limiting
- Environment-based configuration

## 📈 Performance Optimization

- In-memory token tracking
- Efficient data structures (Map, Set)
- Minimal processing overhead

## 🤝 Contributing

- Fork the repository
- Create your feature branch (`git checkout -b feature/awesome-feature`)
- Commit your changes (`git commit -m 'Add awesome feature'`)
- Push to the branch (`git push origin feature/awesome-feature`)
- Open a pull request


```