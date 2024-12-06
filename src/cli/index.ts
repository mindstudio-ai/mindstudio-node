#!/usr/bin/env node

import { CLI } from "./cli";

const cli = new CLI();
cli.run(process.argv).catch((error) => {
  console.error("CLI execution failed:", error);
  process.exit(1);
});

export * from "./cli";
export * from "./types";
