import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global prefix
  const apiPrefix = configService.get('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN') || '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('TransRoute API')
    .setDescription('API para el sistema de gestión de transporte multi-empresa')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingrese su token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Autenticación y autorización')
    .addTag('companies', 'Gestión de empresas')
    .addTag('users', 'Gestión de usuarios')
    .addTag('routes', 'Gestión de rutas')
    .addTag('trips', 'Gestión de viajes')
    .addTag('reservations', 'Gestión de reservaciones')
    .addTag('clients', 'Gestión de clientes')
    .addTag('packages', 'Gestión de paquetería')
    .addTag('transactions', 'Gestión de transacciones')
    .addTag('box-cutoffs', 'Cortes de caja')
    .addTag('vehicles', 'Gestión de vehículos')
    .addTag('expenses', 'Gestión de gastos')
    .addTag('commissions', 'Gestión de comisiones')
    .addTag('reports', 'Reportes y estadísticas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  console.log(`🚀 TransRoute API running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();

