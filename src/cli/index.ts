#!/usr/bin/env node
import dotenv from "dotenv";
import { CLI } from "./cli";

// Load environment variables from .env file
dotenv.config();

const cli = new CLI();
cli.run(process.argv).catch((error) => {
  console.error("CLI execution failed:", error);
  process.exit(1);
});

export * from "./cli";
export * from "./types";
