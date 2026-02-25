import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'; 
import { APP_GUARD } from '@nestjs/core'; 
import { ConfigModule } from '@nestjs/config'; 
import { NoticeModule } from './notice/notice.module';
import { Notice } from './notice/entities/notice.entity';
import { Setting } from './notice/entities/setting.entity';

@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true, 
    }),

  
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '', 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'mmmm',
      database: process.env.DB_DATABASE || 'noticeboard',
      entities: [Notice, Setting],
      synchronize: true, 
    }),

    ThrottlerModule.forRoot([{
      ttl: 60000, 
      limit: 10,  
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