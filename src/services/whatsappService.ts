import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode';
import { BotHandler } from '../bot/handler';

export class WhatsappService {
  private static client: any;
  private static qrCode: string | null = null;
  private static status: 'INITIALIZING' | 'READY' | 'AUTHENTICATED' | 'DISCONNECTED' = 'INITIALIZING';

  static async initialize() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      }
    });

    this.client.on('qr', async (qr) => {
      console.log('QR RECEIVED');
      this.qrCode = await qrcode.toDataURL(qr);
      this.status = 'INITIALIZING';
    });

    this.client.on('authenticated', () => {
      console.log('AUTHENTICATED');
      this.status = 'AUTHENTICATED';
      this.qrCode = null;
    });

    this.client.on('ready', () => {
      console.log('CLIENT IS READY');
      this.status = 'READY';
    });

    this.client.on('message', async (msg) => {
      await BotHandler.handleMessage(msg);
    });

    this.client.on('disconnected', (reason) => {
      console.log('Client was logged out', reason);
      this.status = 'DISCONNECTED';
    });

    await this.client.initialize();
  }

  static getStatus() {
    return {
      status: this.status,
      qrCode: this.qrCode
    };
  }
}
