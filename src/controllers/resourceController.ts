import { Request, Response } from 'express';
import { ResourceService } from '../services/resourceService';

export class ResourceController {
  static async addResource(req: Request, res: Response) {
    try {
      const resource = await ResourceService.addResource(req.body);
      res.status(201).json(resource);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async searchResources(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      const results = await ResourceService.searchResources(query || '');
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getBySubject(req: Request, res: Response) {
    try {
      const results = await ResourceService.getResourcesBySubject(req.params.name);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getByTopic(req: Request, res: Response) {
    try {
      const results = await ResourceService.getResourcesByTopic(req.params.name);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
