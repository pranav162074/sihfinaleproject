import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleOptimizeRakes,
  handleExplainPlan,
  handleSampleDataset,
  handleUploadData,
} from "./routes/optimize";
import { handlePlanRakes, handlePlanRakesDemo } from "./routes/rake-planner";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // OptiRake DSS - Rake Planning routes
  app.post("/api/plan-rakes", handlePlanRakes);
  app.get("/api/plan-rakes/demo", handlePlanRakesDemo);

  // SAIL Rake Formation DSS routes (legacy)
  app.post("/api/optimize-rakes", handleOptimizeRakes);
  app.get("/api/explain-plan/:order_id", handleExplainPlan);
  app.get("/api/sample-dataset", handleSampleDataset);
  app.post("/api/upload-data", handleUploadData);

  return app;
}
