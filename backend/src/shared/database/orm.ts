import {MikroORM} from '@mikro-orm/core';
import {MySqlDriver} from '@mikro-orm/mysql';
import {SqlHighlighter} from '@mikro-orm/sql-highlighter';

export const orm = await MikroORM.init({
  entities: ['backend/dist/**/*.entity.js'],
  entitiesTs: ['backend/src/**/*.entity.ts'],
  dbName: 'cafeteria',
  driver: MySqlDriver,
  clientUrl: 'mysql://root:1234@localhost:3306/cafeteria',
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