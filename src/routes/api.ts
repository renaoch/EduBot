import { Router } from 'express';
import { ResourceController } from '../controllers/resourceController';
import { WhatsappService } from '../services/whatsappService';

const router = Router();

// Resource Routes
router.post('/resources', ResourceController.addResource);
router.get('/resources/search', ResourceController.searchResources);
router.get('/subjects/:name', ResourceController.getBySubject);
router.get('/topics/:name', ResourceController.getByTopic);

// Bot Status Route
router.get('/bot/status', (req, res) => {
  res.json(WhatsappService.getStatus());
});

export default router;
