/* eslint-disable no-console */
import { v4 as uuidv4 } from 'uuid';

import { getPool } from '../../infrastructure/database/database';

const BATCH_SIZE = 1;
const TOTAL_PETS = 1000;
const types = ['dog', 'cat', 'bird', 'hamster', 'fish'];
const names = [
  'Buddy',
  'Mittens',
  'Max',
  'Charlie',
  'Bella',
  'Daisy',
  'Luna',
  'Jack',
  'Lucy',
  'Rocky',
];
const owners = [
  'John Doe',
  'Jane Smith',
  'Alice Brown',
  'Michael Johnson',
  'Emily Davis',
];

function getRandomElement<T>(array: T[]): T {
  const idx = Math.floor(Math.random() * array.length);
  const element = array[idx] as T;
  return element;
}

function generatePetData(): {
  id: string;
  name: string;
  type: string;
  age: number;
  owner_name: string;
}[] {
  const pets: {
    id: string;
    name: string;
    type: string;
    age: number;
    owner_name: string;
  }[] = [];
  for (let i = 0; i < BATCH_SIZE; i += 1) {
    pets.push({
      id: uuidv4(),
      name: getRandomElement(names),
      type: getRandomElement(types),
      age: Math.floor(Math.random() * 20) + 1,
      owner_name: getRandomElement(owners),
    });
  }
  return pets;
}

export async function seedPets() {
  const pool = await getPool();
  const startTime = Date.now();

  try {
    for (let i = 0; i < TOTAL_PETS / BATCH_SIZE; i += 1) {
      const petData = generatePetData();
      const queryText = `
        INSERT INTO pets (id, name, type, age, owner_name)
        VALUES ${petData.map(() => `($1, $2, $3, $4, $5)`).join(', ')}
      `;
      const queryParams = petData.flatMap((pet) => Object.values(pet));
      // eslint-disable-next-line no-await-in-loop
      await pool.query(queryText, queryParams);
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    const endTime = Date.now();
    console.log(`Seeding completed in ${(endTime - startTime) / 1000} seconds`);
  }
}
