import { MessageParser } from '../utils/parser';
import { ResourceService } from '../services/resourceService';

export class BotHandler {
  static async handleMessage(msg: any) {
    try {
      const parsed = MessageParser.parse(msg.body);
      
      if (!parsed) {
        // Handle media if any
        if (msg.hasMedia) {
          return await this.handleMedia(msg);
        }
        return;
      }

      switch (parsed.command) {
        case 'add':
          await this.handleAdd(msg, parsed.payload);
          break;
        case 'search':
          await this.handleSearch(msg, parsed.args[0]);
          break;
        case 'subject':
          await this.handleSubjectSearch(msg, parsed.args[0]);
          break;
        case 'topic':
          await this.handleTopicSearch(msg, parsed.args[0]);
          break;
        default:
          await msg.reply('Unknown command. Use "add", "search", "subject", or "topic".');
      }
    } catch (error: any) {
      console.error('Bot Error:', error);
      await msg.reply(`Error: ${error.message}`);
    }
  }

  private static async handleAdd(msg: any, payload: any) {
    if (!payload.title || !payload.subjectName) {
      return msg.reply('Please provide at least Title and Subject.');
    }
    
    await ResourceService.addResource({
      ...payload,
      type: payload.url ? 'link' : 'note'
    });
    
    await msg.reply(`✅ Resource "${payload.title}" added to ${payload.subjectName}/${payload.topicName}`);
  }

  private static async handleSearch(msg: any, query: string) {
    const results = await ResourceService.searchResources(query);
    await this.replyWithResults(msg, results, `Search results for "${query}":`);
  }

  private static async handleSubjectSearch(msg: any, subject: string) {
    const results = await ResourceService.getResourcesBySubject(subject);
    await this.replyWithResults(msg, results, `Resources in subject "${subject}":`);
  }

  private static async handleTopicSearch(msg: any, topic: string) {
    const results = await ResourceService.getResourcesByTopic(topic);
    await this.replyWithResults(msg, results, `Resources in topic "${topic}":`);
  }

  private static async handleMedia(msg: any) {
    // In a real app, you'd upload to S3/Cloudinary
    // Mocking for now as requested
    const media = await msg.downloadMedia();
    const mockUrl = `https://storage.mock/files/${Date.now()}_${media.filename || 'file'}`;
    
    await msg.reply(`File received! (Stored at mock URL: ${mockUrl})\nTo save it, send the "add" command with this link.`);
  }

  private static async replyWithResults(msg: any, results: any[], header: string) {
    if (results.length === 0) {
      return msg.reply(`${header}\nNo resources found.`);
    }

    let response = `${header}\n\n`;
    results.forEach((res, i) => {
      response += `${i + 1}. *${res.title}*\n`;
      response += `   📚 ${res.subjects?.name || 'N/A'} > ${res.topics?.name || 'N/A'}\n`;
      if (res.url) response += `   🔗 ${res.url}\n`;
      if (res.tags && res.tags.length > 0) response += `   🏷️ ${res.tags.join(', ')}\n`;
      response += `\n`;
    });

    await msg.reply(response.trim());
  }
}
