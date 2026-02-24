import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'; // Import Throttler
import { APP_GUARD } from '@nestjs/core'; // Import APP_GUARD
import { NoticeModule } from './notice/notice.module';
import { Notice } from './notice/entities/notice.entity';
import { Setting } from './notice/entities/setting.entity';

@Module({
  imports: [
    // 1. Database Configuration
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'mmmm',
      database: 'noticeboard',
      entities: [Notice, Setting],
      synchronize: true,
    }),

    // 2. Rate Limiting Configuration (The Security Layer)
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute window
      limit: 10,  // Maximum 10 requests per minute per user/IP
    }]),

    NoticeModule,
  ],
  providers: [
  
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}


/*

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      
      username: 'postgres',
      password: 'mmmm',
      database: 'Agency',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    AgencyModule,
  ],
  controllers: [],
  providers: [],
})
  */