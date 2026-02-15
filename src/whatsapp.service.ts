import { Injectable, OnModuleInit } from '@nestjs/common';
const { Client, LocalAuth } = require('whatsapp-web.js');
import * as qrcode from 'qrcode-terminal';

// src/notice/whatsapp.service.ts
@Injectable()
export class WhatsappService implements OnModuleInit {
  private client: any;

  onModuleInit() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: { 
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true // Runs in the background
      }
    });

    this.client.on('qr', (qr) => {
      console.log('SCAN THIS QR CODE WITH WHATSAPP:');
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      console.log('WhatsApp is ready and logged in!');
    });

    this.client.initialize();
  }




  async sendMessageToGroup(groupName: string, message: string) {
  const chats = await this.client.getChats();
  const group = chats.find(chat => 
    chat.isGroup && 
    chat.name.toLowerCase().trim() === groupName.toLowerCase().trim()
  );

  if (group) {
    await this.client.sendMessage(group.id._serialized, message);
    console.log(`  - Sent to "${groupName}"`);
  } else {
    console.warn(`  - ⚠️ Group "${groupName}" not found. Check the name!`);
  }
}
}