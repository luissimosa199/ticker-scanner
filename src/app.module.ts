import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicketsModule } from './tickets/tickets.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ItemsModule } from './items/items.module';
import { FetchHtmlController } from './fetch-html/fetch-html.controller';
import { HttpModule } from '@nestjs/axios';
import { FetchHtmlService } from './fetch-html/fetch-html.service';

@Module({
  imports: [
    TicketsModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('PG_URI'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: process.env.NODE_ENV === 'production' ? false : true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ItemsModule,
    HttpModule,
  ],
  controllers: [AppController, FetchHtmlController],
  providers: [AppService, FetchHtmlService],
})
export class AppModule {}
