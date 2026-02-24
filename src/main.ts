import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  // 1. Initialize the NestJS Application
  const app = await NestFactory.create(AppModule);

  // 2. Security & Proxy Settings
  // trust proxy is important for the Throttler to see real IPs
  app.getHttpAdapter().getInstance().set('trust proxy', 1); 

  // 3. Enable CORS
  // Restricted to '*' for now, but better to use 'http://localhost:3000' later
  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 4. Swagger API Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Client Notice API')
    .setDescription('API for WhatsApp Sync and Notice Management')
    .setVersion('1.0')
    .addTag('notices')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 5. Start the Server (ONLY CALL THIS ONCE)
  await app.listen(3001);

  // 6. Vital Console Logs
  console.log(`🚀 API is running on: http://localhost:3001/notices`);
  console.log(`📖 Documentation available at: http://localhost:3001/api`);
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


use swagger to document your API endpoints. This will help you and other developers understand how to interact with your backend.
*/






//  delete .wwebjs_auth  before delivery 











/*


$body = @{
    title      = "test Sync"
    content    = "Testing message to Group A"
    groupName  = "A"
    whatsappId = "120363423778038121@g.us"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/notices" -Method Post -Body $body -ContentType "application/json"


*/