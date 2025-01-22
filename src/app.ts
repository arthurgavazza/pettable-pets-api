import 'express-async-errors';

import dotenv from 'dotenv';
import express, { json } from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

import { getPool } from '../scripts/database/migrations/database';
import { PetsController } from './controllers/pets.controller';
import logger from './helpers/logger';
import { PetRepository } from './repositories/pets.repository';

const initApp = async () => {
  dotenv.config();
  const app = express();
  app.use(json());
  app.use(helmet());
  app.use(pinoHttp({ logger }));

  const pool = await getPool();
  const petRepository = new PetRepository(pool);
  const petController = new PetsController(petRepository);

  app.get('/', (_, res) => {
    res.json({
      msg: 'Hello World',
    });
  });

  app.get('/pets', (req, res, next) =>
    petController.getAllPets(req, res, next),
  );
  app.post('/pets', (req, res, next) =>
    petController.createPet(req, res, next),
  );
  app.patch('/pets/:id', (req, res, next) =>
    petController.updatePet(req, res, next),
  );
  app.delete('/pets/:id', (req, res, next) =>
    petController.deletePet(req, res, next),
  );
  app.get('/analytics', (req, res, next) =>
    petController.getAnalytics(req, res, next),
  );

  // 404 handler
  app.use((_, res) => {
    res.status(404).json({ error: 'NOT FOUND' });
  });

  // Error handler
  app.use(
    (
      error: Error,
      req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      req.log.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    },
  );

  return app;
};

export { initApp };
