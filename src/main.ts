import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Activar Validación Global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,               // elimina campos que no están en el DTO
      forbidNonWhitelisted: true,    // lanza error si envían campos no permitidos
      transform: true,               // convierte tipos automáticamente (string → number)
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ✅ Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('API Productos')
    .setDescription('CRUD de productos con NestJS')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}
bootstrap();



