import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(); 
  await app.listen(3000);
}
bootstrap();


/*

You have built a three-tier synchronization system. 
When a user interacts with your frontend, a chain reaction occurs that ensures the information is stored permanently and broadcasted instantly.

How your data flows:
The Trigger (Frontend): You type a notice into your Next.js app and hit "Post." It sends a POST request to your NestJS server.

The Persistence (Database): Your NoticeService receives the data and uses the TypeORM Repository to save it into your database. This ensures the notice isn't lost if the server restarts.

The Broadcast (WhatsApp Service): Immediately after the database confirms the save, the NoticeService calls your WhatsappService.

The Delivery: The WhatsappService uses a headless browser (Puppeteer) to "type" and "send" that message into your specific WhatsApp group.

scanner guy save the name to a number like 123456789 to arif then it will  be shown as arif in the group instead of 123456789. if the name is not saved then it will show the number like +123456789 in the group.

*/