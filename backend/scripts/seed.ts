import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { SeedService } from '../src/database/seed.service';
import { SeedModule } from '../src/database/seed.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const seedModule = app.select(SeedModule);
  const seedService = seedModule.get(SeedService);
  
  try {
    await seedService.seed();
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

bootstrap();

