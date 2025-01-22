import type { Analytics, Pet } from '../entities/pet';
import type { PetRepository } from '../repositories/pets.repository';

export class PetService {
  constructor(private petRepo: PetRepository) {
    this.petRepo = petRepo;
  }

  async createPet(pet: Pet): Promise<Pet> {
    return this.petRepo.createPet(pet);
  }

  async getAllPets(): Promise<Pet[]> {
    return this.petRepo.getAllPets();
  }

  async updatePet(id: string, updates: Partial<Pet>): Promise<Pet | null> {
    return this.petRepo.updatePet(id, updates);
  }

  async getAnalytics(): Promise<Analytics> {
    return this.petRepo.getAnalytics();
  }

  async deletePet(id: string): Promise<boolean> {
    return this.petRepo.deletePet(id);
  }
}
