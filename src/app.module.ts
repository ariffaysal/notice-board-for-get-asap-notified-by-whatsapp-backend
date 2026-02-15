import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticeModule } from './notice/notice.module';
import { Notice } from './notice/entities/notice.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres', // your postgres username
      password: 'mmmm', // your postgres password
      database: 'noticeboard', // your postgres database name
      entities: [Notice],
      synchronize: true, // Auto-creates tables based on entity (dev only)
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