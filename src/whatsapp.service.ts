import { Injectable, OnModuleInit, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import { NoticeService } from './notice/notice.service'; 
const { Client, LocalAuth } = require('whatsapp-web.js');
import * as qrcode from 'qrcode-terminal';

@Injectable()
export class WhatsappService implements OnModuleInit, OnModuleDestroy {
  private client: any;
  private isReady = false;

  constructor(
    @Inject(forwardRef(() => NoticeService))
    private readonly noticeService: NoticeService,
  ) {}

  async onModuleInit() {
    setTimeout(() => this.initializeClient(), 5000);
  }

  async onModuleDestroy() {
    if (this.client) {
      console.log('Stopping WhatsApp Client...');
      await this.client.destroy();
    }
  }

  private initializeClient() {
    console.log('Starting WhatsApp Client...');
    
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true, 
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage'
        ],
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
      },
    });

    this.client.on('qr', (qr: string) => {
      console.log('👉 ACTION REQUIRED: Scan this QR code with your phone:');
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      this.isReady = true;
      console.log('✅ WhatsApp is connected and ready!');
    });

   
    
const handleMessage = async (msg: any) => {
  try {
    // 1. Get Chat details
    const chat = await msg.getChat();
    
    // 2. Filter: We only want Group messages
    if (!chat || !chat.isGroup) return;

    // 3. LOGGING: If this shows in terminal, the bot SAW your laptop message
    console.log(`📩 Message detected in [${chat.name}] from ${msg.fromMe ? 'Me (Laptop/Phone)' : 'Someone else'}`);

    const contact = await msg.getContact();
    const displayName = contact.pushname || contact.name || `+${contact.number}`;

    // 4. SAVE TO DB
    await this.noticeService.saveFromWhatsApp({
      title: `WhatsApp: ${displayName}`,
      content: msg.body,
      groupName: chat.name, 
    });

    console.log(`✅ Synced into Database: Group [${chat.name}]`);
  } catch (error) {
    console.error('❌ Sync Error:', error.message);
  }
};





    // Use message_create to catch messages you send and messages you receive
    this.client.on('message_create', handleMessage);

    this.client.on('disconnected', (reason: string) => {
      this.isReady = false;
      console.warn('⚠️ WhatsApp was disconnected:', reason);
    });

    this.client.initialize().catch((err: Error) => {
      console.error('❌ Critical Puppeteer Error:', err.message);
    });
  }
async sendMessageToGroup(groupName: string, message: string) {
  if (!this.isReady) return;

  try {
    const chats = await this.client.getChats();
    const group = chats.find(
      (c: any) => c.isGroup && c.name.toLowerCase().trim() === groupName.toLowerCase().trim()
    );

    if (group) {
      // Use the client.sendMessage method with the serialized ID
      // This is much more stable than group.sendMessage()
      await this.client.sendMessage(group.id._serialized, message); 
      console.log(`✅ Message sent to ${groupName}`);
    }
  } catch (error) {
    console.error('❌ Send Error:', error.message);
  }
}



}