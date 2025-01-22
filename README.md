Here’s a `README.md` based on your updated requirements:

---

# Pettable Backend System

## Overview

This project is a backend system developed for managing pet profiles and providing analytics using a materialized view in Postgres. It is built with TypeScript and Express.js in an AWS Lambda setup, featuring a Postgres connection pool for efficient connection management. Tests use `testcontainers` for production-like fidelity.

---

## API Endpoints

### 1. **POST /pets**

Create a new pet profile.

#### Request Schema:

```json
{
  "name": "string",
  "type": "string",
  "age": "integer",
  "owner_name": "string"
}
```

#### Example Request Body:

```json
{
  "name": "Buddy",
  "type": "dog",
  "age": 5,
  "owner_name": "John Doe"
}
```

#### Example Response:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Buddy",
  "type": "dog",
  "age": 5,
  "owner_name": "John Doe"
}
```

### 2. **GET /pets**

Retrieve all pet profiles.

#### Example Response:

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Buddy",
    "type": "dog",
    "age": 5,
    "owner_name": "John Doe"
  }
]
```

### 3. **PATCH /pets/:id**

Update a pet profile by ID.

#### Request Schema:

```json
{
  "name": "string (optional)",
  "type": "string (optional)",
  "age": "integer (optional)",
  "owner_name": "string (optional)"
}
```

#### Example Request Body:

```json
{
  "age": 6
}
```

#### Example Response:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Buddy",
  "type": "dog",
  "age": 6,
  "owner_name": "John Doe"
}
```

### 4. **DELETE /pets/:id**

Delete a pet profile by ID.

#### Example Response:

```json
{
  "message": "Pet profile deleted successfully"
}
```

### 5. **GET /analytics**

Retrieve aggregated pet data from the materialized view.

#### Example Response:

```json
{
  "total_pets": 5,
  "type_statistics": [
    { "type": "dog", "count": 3 },
    { "type": "cat", "count": 2 }
  ]
}
```

---

## Running the Project Locally

### Prerequisites

* Docker installed locally.

### Steps

1. Clone the repository:
   ```bash
   git clone git@github.com:arthurgavazza/pettable-pets-api.git
   cd pettable-backend  
   ```
2. Start the database with Docker Compose:
   ```bash
   docker-compose up  
   ```
3. Install dependencies:
   ```bash
   npm install  
   ```
4. Start the application:
   ```bash
   npm run dev  
   ```

The application will be running locally at `http://localhost:3000`.

---


## Materialized View

The `pet_statistics` view aggregates pet analytics data to provide insights into the total number of pets and the count per type.

### Definition:

```sql
CREATE OR REPLACE VIEW pet_statistics AS
    SELECT
      COUNT(*) AS total_pets,
      type,
      COUNT(*) FILTER (WHERE type IS NOT NULL) AS count
    FROM pets
    GROUP BY type;
```

### Purpose:

* **Analytics** : Provides insights into the number of pets and their distribution by type.
* **Performance** : Precomputing analytics reduces the overhead of running complex queries on the main `pets` table.

### Example Query Results:

```sql
SELECT * FROM pet_statistics;
```

#### Example Output:

| total_pets | type | count |
| ---------- | ---- | ----- |
| 5          | dog  | 3     |
| 5          | cat  | 2     |

## Testing

Tests are written using `testcontainers` to spin up a real Postgres container for integration tests, providing high production fidelity.

### Running Tests:

```bash
npm run test  
```

Tests validate:

* Endpoint behavior and response structure.
* Data aggregation logic in the materialized view.

---

## Technologies Used

* **Backend Framework** : Express.js in an AWS Lambda setup.
* **Database** : Postgres with a connection pool for efficient management.
* **Testing** : Jest and testcontainers for integration tests.
* **Containerization** : Docker and Docker Compose for local development.
