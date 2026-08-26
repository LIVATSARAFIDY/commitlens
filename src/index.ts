#!/usr/bin/env node

import { Command } from "commander";

import { registerAnalyzeCommand } from "./commands/analyze.js";

const program = new Command();

program
  .name("commitlens")
  .description("Intelligent Git commit analyzer")
  .version("0.1.0");

registerAnalyzeCommand(program);

program.parseAsync();

