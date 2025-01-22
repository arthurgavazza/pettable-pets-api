import type { NextFunction, Request, Response } from 'express';

import logger from '../helpers/logger';
import type { PetRepository } from '../repositories/pets.repository';

export class PetsController {
  private petRepository: PetRepository;

  constructor(petRepository: PetRepository) {
    this.petRepository = petRepository;
  }

  public async getAllPets(
    _: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const pets = await this.petRepository.getAllPets();
      res.json(pets);
    } catch (error) {
      logger.error('Error retrieving pets:', error);
      next(error);
    }
  }

  public async createPet(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { name, type, age, ownerName } = req.body;

    if (!name || !type || age == null || !ownerName) {
      logger.warn('Invalid request body for creating pet');
      res.status(400).json({ error: 'Invalid request body' });
      return;
    }

    try {
      const newPet = await this.petRepository.createPet({
        name,
        type,
        age,
        ownerName,
      });
      res.status(201).json(newPet);
    } catch (error) {
      next(error);
    }
  }

  public async updatePet(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { id } = req.params;
    const { name, type, age, ownerName } = req.body;

    if (!id) {
      res.status(400).json({ error: 'Invalid request: Missing pet ID' });
      return;
    }

    try {
      const updatedPet = await this.petRepository.updatePet(id, {
        name,
        type,
        age,
        ownerName,
      });

      if (!updatedPet) {
        res.status(404).json({ error: 'Pet not found' });
        return;
      }

      res.json(updatedPet);
    } catch (error) {
      next(error);
    }
  }

  public async deletePet(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'Invalid request: Missing pet ID' });
      return;
    }

    try {
      const deleted = await this.petRepository.deletePet(id);

      if (!deleted) {
        res.status(404).json({ error: 'Pet not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  public async getAnalytics(
    _: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const analytics = await this.petRepository.getAnalytics();
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  }
}
