import { Pool } from 'pg';

import logger from '../../helpers/logger';

let pool: Pool | null = null;

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
}
export const getPool = async (config?: DatabaseConfig): Promise<Pool> => {
  if (!pool) {
    logger.info({
      config,
    });
    pool = new Pool({
      host: config?.host ?? process.env.POSTGRES_HOST,
      port: config?.port ?? parseInt(process.env.POSTGRES_PORT || '5432', 10),
      user: config?.user ?? process.env.POSTGRES_USER,
      password: config?.password ?? process.env.POSTGRES_PASSWORD,
      database: config?.name ?? process.env.POSTGRES_DATABASE,
      max: 10,
      idleTimeoutMillis: 30000,
    });

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
    (SELECT COUNT(*) FROM pets) AS total_pets,  
    type,  
    COUNT(*) AS count  
FROM pets  
GROUP BY type;  

    `);
  }
  return pool;
};
