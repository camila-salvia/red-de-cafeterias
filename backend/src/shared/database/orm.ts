import {MikroORM} from '@mikro-orm/core';
import {MySqlDriver} from '@mikro-orm/mysql';
import {SqlHighlighter} from '@mikro-orm/sql-highlighter';
import 'dotenv/config';

export const orm = await MikroORM.init({
  entities: ['./dist/**/*.entity.js'],
  entitiesTs: ['./src/**/*.entity.ts'],
  dbName: process.env.DB_NAME,
  driver: MySqlDriver,
  clientUrl: `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  highlighter: new SqlHighlighter(),
  debug: true,
  schemaGenerator: { // never in production
    disableForeignKeys: true,
    createForeignKeyConstraints:true,
    ignoreSchema: [],
  },
})

export const syncSchema = async () => {
  const generator = orm.getSchemaGenerator()
  await generator.updateSchema()
}