import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import apiRoutes from "./src/routes/api";
import { WhatsappService } from "./src/services/whatsappService";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API routes
  app.use("/api", apiRoutes);

  // Initialize WhatsApp Bot
  console.log("Starting WhatsApp Bot...");
  WhatsappService.initialize().catch(err => {
    console.error("Failed to initialize WhatsApp service:", err);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
