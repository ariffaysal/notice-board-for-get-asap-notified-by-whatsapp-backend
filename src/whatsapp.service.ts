import { Injectable, OnModuleInit, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import { NoticeService } from './notice/notice.service'; 
import { Client, LocalAuth } from 'whatsapp-web.js';
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

 
    this.client.on('message_create', (msg: any) => this.handleMessage(msg));

    this.client.on('disconnected', (reason: string) => {
      this.isReady = false;
      console.warn('⚠️ WhatsApp was disconnected:', reason);
    });

    this.client.initialize().catch((err: Error) => {
      console.error('❌ Critical Puppeteer Error:', err.message);
    });
  }


  private async handleMessage(msg: any) {
    try {
      const chat = await msg.getChat();
      
      if (!chat || !chat.isGroup) return;

      const groupName = chat.name || "Unknown Group";
      const groupId = chat.id?._serialized;

      if (!groupId) {
        console.warn("⚠️ Group detected but ID is missing. Skipping...");
        return;
      }

      console.log(`📩 Message in [${groupName}] from ${msg.fromMe ? 'Me' : 'Others'}`);

      const contact = await msg.getContact();
      const displayName = contact.pushname || contact.name || `+${contact.number}`;

      
      // SAVE TO DB WITH UNIQUE WHATSAPP ID
      await this.noticeService.saveFromWhatsApp({
        title: `WhatsApp: ${displayName}`,
        content: msg.body || "", 
        groupName: groupName,
        whatsappId: groupId 
      });

      console.log(`✅ Synced into Database: Group [${groupName}]`);
    } catch (error) {
      console.error('❌ Sync Error details:', error.message);
    }
  }

  /**
   * NEW: Send message via Unique WhatsApp ID (Terminal/API usage)
   */
  async sendMessageToId(jid: string, message: string) {
    if (!this.isReady) throw new Error("WhatsApp client not ready");
    return await this.client.sendMessage(jid, message);
  }

  /**
   * EXISTING: Send message via Group Name (Browser usage)
   */
  async sendMessageToGroup(groupName: string, message: string) {
    if (!this.isReady) return;

    try {
      const chats = await this.client.getChats();
      const group = chats.find(
        (c: any) => c.isGroup && c.name.toLowerCase().trim() === groupName.toLowerCase().trim()
      );

      if (group) {
        await this.client.sendMessage(group.id._serialized, message); 
        console.log(`✅ Message sent to ${groupName}`);
      }
    } catch (error) {
      console.error('❌ Send Error:', error.message);
    }
  }

  /**
   * EXISTING: Get all group names for dropdowns
   */
  async getAllGroups(): Promise<string[]> {
    if (!this.isReady) return [];
    const chats = await this.client.getChats();
    return chats
      .filter((chat: any) => chat.isGroup)
      .map((chat: any) => chat.name);
  }
}