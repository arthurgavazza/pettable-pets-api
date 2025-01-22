import type { Pool } from 'pg';

import type { Analytics, Pet } from '../entities/pet';
import logger from '../helpers/logger';

export class PetRepository {
  private pool: Pool;

  constructor(connectionPool: Pool) {
    this.pool = connectionPool;
  }

  async createPet(pet: Pet): Promise<Pet> {
    const query = `
      INSERT INTO pets (name, type, age, owner_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, type, age, owner_name AS "ownerName";
    `;
    const values = [pet.name, pet.type, pet.age, pet.ownerName];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async getAllPets(): Promise<Pet[]> {
    const query = `
      SELECT id, name, type, age, owner_name AS "ownerName"
      FROM pets;
    `;
    const result = await this.pool.query(query);
    return result.rows;
  }

  async getPetById(id: string): Promise<Pet> {
    const query = `
      SELECT id, name, type, age, owner_name AS "ownerName"
      FROM pets
      WHERE id = $1;
    `;
    const result = await this.pool.query(query, [id]);
    return result.rows[0];
  }

  async updatePet(id: string, updates: Partial<Pet>): Promise<Pet | null> {
    const pet = await this.getPetById(id);
    delete pet.id;
    if (!pet) {
      throw new Error('Pet not found');
    }
    const updatedPet = {
      ...pet,
      ...Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined),
      ),
    };
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    for (const [key, value] of Object.entries(updatedPet)) {
      fields.push(`${key === 'ownerName' ? 'owner_name' : key} = $${index}`);
      values.push(value);
      index += 1;
    }

    const query = `
      UPDATE pets
      SET ${fields.join(', ')}
      WHERE id = $${index}
      RETURNING id, name, type, age, owner_name AS "ownerName";
    `;
    values.push(id);

    logger.info({
      query,
      fields,
      values,
      pet,
      updates,
    });

    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  async deletePet(id: string): Promise<boolean> {
    const query = `
      DELETE FROM pets
      WHERE id = $1;
    `;
    const result = await this.pool.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }

  async getAnalytics(): Promise<Analytics> {
    const query = `
      SELECT 
        total_pets,
        type,
        count
      FROM pet_statistics;
    `;
    const result = await this.pool.query(query);

    if (result.rows.length === 0) {
      return { totalPets: 0, typeStatistics: [] };
    }

    // Since total_pets is the same for all rows, get it from the first row
    const totalPets = parseInt(result.rows[0].total_pets, 10);
    const typeStatistics = result.rows.map((row) => ({
      type: row.type,
      count: parseInt(row.count, 10),
    }));

    return { totalPets, typeStatistics };
  }
}
