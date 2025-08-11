import { DataSource } from 'typeorm';
import { InitialDataSeed } from './seeds/InitialDataSeed';
import { config } from 'dotenv';

config(); // Load environment variables

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'brain_agriculture',
  entities: ['src/entities/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});

async function runSeeds() {
  try {
    await dataSource.initialize();
    console.log('📡 Database connection established');
    
    const seed = new InitialDataSeed(dataSource);
    await seed.run();
    
    console.log('🎯 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run seeds if this file is executed directly
if (require.main === module) {
  runSeeds();
}

export { runSeeds };

