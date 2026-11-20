import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ServiceCategoriesModule } from './service-categories/service-categories.module';
import { TechnicianProfilesModule } from './technician-profiles/technician-profiles.module';
import { AuthModule } from './auth/auth.module';
import { JobsModule } from './jobs/jobs.module';
import { ChatModule } from './chat/chat.module';
import { RatingsModule } from './ratings/ratings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // variables de entorno disponibles en toda la app
    }),

    // Limite base de peticiones por IP. Cada endpoint sensible
    // (login, registro) define su propio limite mas estricto.
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 60 }]),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        // Solo en desarrollo: en produccion podria borrar columnas con datos.
        // En produccion usaremos migraciones (Fase B).
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    UsersModule,
    ServiceCategoriesModule,
    TechnicianProfilesModule,
    AuthModule,
    JobsModule,
    ChatModule,
    RatingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}