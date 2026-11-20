import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const isProd = process.env.NODE_ENV === 'production';

  // 1. No arrancar con un secreto JWT debil: con uno corto, se pueden falsificar tokens
  const jwtSecret = process.env.JWT_SECRET ?? '';
  if (jwtSecret.length < 32) {
    throw new Error(
      'JWT_SECRET debe tener al menos 32 caracteres. Revisa tu archivo .env',
    );
  }

  // 2. Cabeceras HTTP de seguridad.
  //    En desarrollo desactivamos la CSP para que Swagger cargue bien.
  app.use(helmet({ contentSecurityPolicy: isProd ? undefined : false }));

  // 3. CORS: lista de dominios permitidos desde .env (separados por coma).
  //    La app movil no usa CORS; esto aplica a navegadores (ej. un futuro panel web).
  //    Sin lista: en desarrollo se permite todo y en produccion nada.
  const origins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({ origin: origins.length > 0 ? origins : !isProd });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // 4. Swagger solo en desarrollo: en produccion no exponemos el mapa de la API
  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle('Hogar App API')
      .setDescription('API para el marketplace de servicios del hogar')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  }

  // 5. Puerto desde el entorno (los servicios en la nube lo asignan ellos)
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  logger.log(`API escuchando en el puerto ${port} (${isProd ? 'producción' : 'desarrollo'})`);
}
bootstrap();