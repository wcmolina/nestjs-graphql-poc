import { NestFactory } from '@nestjs/core';
import { MikroORM } from '@mikro-orm/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Initialize database schema
  const orm = app.get(MikroORM);
  const generator = orm.getSchemaGenerator();
  await generator.updateSchema();

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 3000}`,
  );
  console.log(
    `GraphQL Playground: http://localhost:${process.env.PORT ?? 3000}/graphql`,
  );
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
