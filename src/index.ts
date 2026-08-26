#!/usr/bin/env node

// import { Command } from "commander";

// const program = new Command();

// program
//   .name("commitlens")
//   .description("Intelligent Git commit analyzer")
//   .version("0.1.0");

// program.parse();


import { GitService } from "./core/git/git.service.js";

const git = new GitService();

const isRepository = await git.isRepository();

console.log("Is Git repository:", isRepository);

if (isRepository) {
  const changes = await git.getStagedChanges();

  console.log("\nFiles:");
  console.log(changes.files);

  console.log("\nStats:");
  console.log(changes.stats);

  console.log("\nDiff:");
  console.log(changes.diff);
}