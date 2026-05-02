export interface ParsedCommand {
  command: string;
  args: string[];
  payload?: any;
}

export class MessageParser {
  static parse(text: string): ParsedCommand | null {
    const lines = text.trim().split('\n');
    const firstLine = lines[0].toLowerCase().trim();

    if (firstLine === 'add') {
      return this.parseAddCommand(lines.slice(1));
    }

    const firstWord = firstLine.split(' ')[0];
    if (['search', 'subject', 'topic'].includes(firstWord)) {
      return {
        command: firstWord,
        args: [firstLine.substring(firstWord.length).trim()]
      };
    }

    return null;
  }

  private static parseAddCommand(lines: string[]): ParsedCommand {
    const data: any = {
      title: '',
      subjectName: '',
      topicName: '',
      url: '',
      tags: []
    };

    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.startsWith('subject:')) data.subjectName = line.split(':')[1].trim();
      else if (lowerLine.startsWith('topic:')) data.topicName = line.split(':')[1].trim();
      else if (lowerLine.startsWith('title:')) data.title = line.split(':')[1].trim();
      else if (lowerLine.startsWith('link:')) data.url = line.split(':')[1].trim();
      else if (lowerLine.startsWith('tags:')) {
        data.tags = line.split(':')[1].split(',').map(t => t.trim());
      }
    });

    return {
      command: 'add',
      args: [],
      payload: data
    };
  }
}
