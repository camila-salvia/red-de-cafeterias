import { MikroORM } from '@mikro-orm/core';
import { MySqlDriver } from '@mikro-orm/mysql';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import 'dotenv/config';

const isTestEnvironment = process.env.NODE_ENV === 'test' || !!process.env.VITEST;

const ormInstance = isTestEnvironment
  ? ({ em: {} } as any)
  : await MikroORM.init({
      entities: ['./dist/**/*.entity.js'],
      entitiesTs: ['./src/**/*.entity.ts'],
      dbName: process.env.DB_NAME,
      driver: MySqlDriver,
      clientUrl: `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
      highlighter: new SqlHighlighter(),
      debug: true,
      schemaGenerator: {
        disableForeignKeys: true,
        createForeignKeyConstraints: true,
        ignoreSchema: [],
      },
    });

export const orm = ormInstance;

export const syncSchema = async () => {
  if (isTestEnvironment) return;
  const generator = orm.getSchemaGenerator();
  await generator.updateSchema();
};