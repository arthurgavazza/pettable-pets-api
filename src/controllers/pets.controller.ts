import type { NextFunction, Request, Response } from 'express';

import logger from '../helpers/logger';
import type { PetService } from '../services/pets.service';

export class PetsController {
  private petService: PetService;

  constructor(petService: PetService) {
    this.petService = petService;
  }

  public async getAllPets(
    _: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const pets = await this.petService.getAllPets();
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
      const newPet = await this.petService.createPet({
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
      const updatedPet = await this.petService.updatePet(id, {
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
      const deleted = await this.petService.deletePet(id);

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
      const analytics = await this.petService.getAnalytics();
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  }
}
