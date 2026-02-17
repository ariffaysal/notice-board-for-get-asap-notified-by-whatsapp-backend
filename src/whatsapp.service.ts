import { Injectable, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { NoticeService } from './notice/notice.service'; 
const { Client, LocalAuth } = require('whatsapp-web.js');
import * as qrcode from 'qrcode-terminal';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private client: any;
  private isReady = false;

  constructor(
    @Inject(forwardRef(() => NoticeService))
    private readonly noticeService: NoticeService,
  ) {}

  onModuleInit() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true, 
      },
    });

    this.client.on('qr', (qr) => {
      console.log('SCAN THIS QR CODE WITH WHATSAPP:');
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      this.isReady = true;
      console.log('✅ WhatsApp is ready and logged in!');
    });

    this.client.on('message_create', async (msg: any) => {
      try {
        const chat = await msg.getChat();
        
        const targetGroupNames = ['.Net Framework Project', 'Chemistry'];

        if (chat.name && targetGroupNames.includes(chat.name.trim())) {
          const isBotAlert = msg.body.includes('*NEW NOTICE ALERT*');

          if (!isBotAlert) {
            let displayName = '';

            try {
              const contactId = msg.author || msg.from;
              if (contactId) {
                const contact = await this.client.getContactById(contactId);
                displayName = contact.pushname || contact.name;
              }
            } catch (e) {

            }

            if (!displayName) {
              const rawId = msg.author || msg.from || '';
              const digits = rawId.split('@')[0].split(':')[0];
              displayName = digits ? `+${digits}` : 'Group Member';
            }

            await this.noticeService.saveFromWhatsApp({
              title: `WhatsApp: ${displayName}`,
              content: msg.body,
              groupName: chat.name,
            });

            console.log(`✅ Synced message from ${displayName} in [${chat.name}]`);
          }
        }
      } catch (error) {
        console.error('❌ Error syncing WhatsApp message:', error.message);
      }
    });

    this.client.initialize();
  }

  /**
   * Used when you "Broadcast" from the dashboard
   */
  async sendMessageToGroup(groupName: string, message: string) {
    if (!this.isReady) {
      console.warn('⚠️ WhatsApp client not ready yet.');
      return;
    }

    try {
      const chats = await this.client.getChats();
      const group = chats.find(
        (chat) =>
          chat.isGroup &&
          chat.name.toLowerCase().trim() === groupName.toLowerCase().trim(),
      );

      if (group) {
        await this.client.sendMessage(group.id._serialized, message);
        console.log(`✅ Message broadcasted to group: "${groupName}"`);
      } else {
        console.warn(`⚠️ Group "${groupName}" not found.`);
      }
    } catch (error) {
      console.error('❌ WhatsApp Send Error:', error.message);
    }
  }

  /**
   * Used for direct replies if needed
   */
  async sendReply(phoneNumber: string, message: string) {
    try {
      const formattedId = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@c.us`;
      await this.client.sendMessage(formattedId, message);
      console.log(`✅ Reply sent to ${phoneNumber}`);
    } catch (error) {
      console.error('❌ Failed to send WhatsApp reply:', error.message);
    }
  }
}