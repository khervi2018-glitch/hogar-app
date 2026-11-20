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

    // Limite base de peticiones por IP (login y registro tienen el suyo)
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 60 }]),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get<string>('NODE_ENV') === 'production';
        const databaseUrl = config.get<string>('DATABASE_URL');

        // Conexion: en la nube llega como una URL (con SSL);
        // en local, con host/puerto/usuario por separado.
        const conexion = databaseUrl
          ? { url: databaseUrl, ssl: { rejectUnauthorized: true } }
          : {
              host: config.get<string>('DB_HOST'),
              port: Number(config.get<string>('DB_PORT') ?? 5432),
              username: config.get<string>('DB_USERNAME'),
              password: config.get<string>('DB_PASSWORD'),
              database: config.get<string>('DB_DATABASE'),
            };

        return {
          type: 'postgres' as const,
          ...conexion,
          autoLoadEntities: true,
          // Desarrollo: tablas automaticas. Produccion: NUNCA (puede borrar datos).
          synchronize: !isProd,
          // Produccion: aplicar las migraciones pendientes al arrancar
          migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
          migrationsRun: isProd,
        };
      },
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