import { PostgreSqlContainer } from '@testcontainers/postgresql';
import type { Express } from 'express';
import type { Pool } from 'pg';
import request from 'supertest';
import type { StartedTestContainer } from 'testcontainers';

import { initApp } from './app';
import { getPool } from './infrastructure/database/database';

let container: StartedTestContainer;
let pool: Pool;
let app: Express;
const TEST_TIMEOUT = 10000;

jest.setTimeout(TEST_TIMEOUT);

beforeAll(async () => {
  const environment = {
    POSTGRES_USER: 'postgres',
    POSTGRES_PASSWORD: 'postgres',
    POSTGRES_DATABASE: 'postgres',
  };

  container = await new PostgreSqlContainer()
    .withDatabase(environment.POSTGRES_DATABASE)
    .withUsername(environment.POSTGRES_USER)
    .withPassword(environment.POSTGRES_PASSWORD)
    .withExposedPorts(5432)
    .start();

  const mappedPort = container.getMappedPort(5432);
  const host = container.getHost();

  pool = await getPool({
    host,
    user: environment.POSTGRES_USER,
    port: mappedPort,
    name: environment.POSTGRES_DATABASE,
    password: environment.POSTGRES_PASSWORD,
  });

  app = await initApp();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      age INT NOT NULL,
      owner_name TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE OR REPLACE VIEW pet_statistics AS
    SELECT
      COUNT(*) AS total_pets,
      type,
      COUNT(*) FILTER (WHERE type IS NOT NULL) AS count
    FROM pets
    GROUP BY type;
  `);
});

afterAll(async () => {
  await pool.end();
  await container.stop();
});

beforeEach(async () => {
  await pool.query('DELETE FROM pets;');
});

describe('Pets API with Testcontainers', () => {
  test(
    'POST /pets - Should create a new pet',
    async () => {
      const newPet = {
        name: 'Buddy',
        type: 'dog',
        age: 5,
        ownerName: 'John Doe',
      };

      const response = await request(app).post('/pets').send(newPet);
      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Buddy');

      const { rows } = await pool.query('SELECT * FROM pets;');
      expect(rows).toHaveLength(1);
      expect(rows[0].name).toBe('Buddy');
    },
    TEST_TIMEOUT,
  );

  test(
    'GET /pets - Should return all pets',
    async () => {
      await pool.query(
        `INSERT INTO pets (name, type, age, owner_name) VALUES 
      ('Buddy', 'dog', 5, 'John Doe'),
      ('Mittens', 'cat', 3, 'Jane Smith');`,
      );

      const response = await request(app).get('/pets');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    },
    TEST_TIMEOUT,
  );

  test(
    'PATCH /pets/:id - Should update a pet',
    async () => {
      const result = await pool.query(
        `INSERT INTO pets (name, type, age, owner_name) VALUES 
      ('Buddy', 'dog', 5, 'John Doe') RETURNING id;`,
      );

      const petId = result.rows[0].id;

      const response = await request(app)
        .patch(`/pets/${petId}`)
        .send({ age: 6 });

      expect(response.status).toBe(200);
      expect(response.body.age).toBe(6);

      const { rows } = await pool.query('SELECT age FROM pets WHERE id = $1;', [
        petId,
      ]);
      expect(rows[0].age).toBe(6);
    },
    TEST_TIMEOUT,
  );

  test(
    'DELETE /pets/:id - Should delete a pet',
    async () => {
      const result = await pool.query(
        `INSERT INTO pets (name, type, age, owner_name) VALUES 
      ('Buddy', 'dog', 5, 'John Doe') RETURNING id;`,
      );

      const petId = result.rows[0].id;

      const response = await request(app).delete(`/pets/${petId}`);
      expect(response.status).toBe(204);

      const { rows } = await pool.query('SELECT * FROM pets WHERE id = $1;', [
        petId,
      ]);
      expect(rows).toHaveLength(0);
    },
    TEST_TIMEOUT,
  );

  test(
    'GET /analytics - Should return pet statistics',
    async () => {
      await pool.query(
        `INSERT INTO pets (name, type, age, owner_name) VALUES 
      ('Buddy', 'dog', 5, 'John Doe'),
      ('Mittens', 'cat', 3, 'Jane Smith'),
      ('Max', 'dog', 4, 'Alice Doe');`,
      );

      const response = await request(app).get('/analytics');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        totalPets: 3,
        typeStatistics: [
          { type: 'dog', count: 2 },
          { type: 'cat', count: 1 },
        ],
      });
    },
    TEST_TIMEOUT,
  );
});
