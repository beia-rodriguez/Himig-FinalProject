
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';

const AppDataSource = new DataSource({
  type: 'mysql',

  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USERNAME ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_DATABASE ?? 'himig_db',

  charset: 'utf8mb4',

  // Load all existing TypeORM entities.
  entities: [
    join(__dirname, '..', '**', '*.entity{.ts,.js}'),
  ],

  // Location of migration files.
  migrations: [
    join(__dirname, 'migrations', '*{.ts,.js}'),
  ],

  // Never automatically modify database tables.
  synchronize: false,

  // Migrations must be executed manually.
  migrationsRun: false,

  // TypeORM migration tracking table.
  migrationsTableName: 'migrations',

  logging: process.env.NODE_ENV === 'development',
});

export default AppDataSource;
