import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticeModule } from './notice/notice.module';
import { Notice } from './notice/entities/notice.entity';
import { Setting } from './notice/entities/setting.entity'; // 1. Import the Setting entity

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres', 
      password: 'mmmm', 
      database: 'noticeboard', 
      entities: [Notice, Setting], // 2. Add Setting here
      synchronize: true, 
    }),
    NoticeModule,
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