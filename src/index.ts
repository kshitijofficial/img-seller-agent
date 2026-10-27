import { type Project, type ProjectAgent } from "@elizaos/core";

import { character } from "./character.ts";
import sellerPlugin from "./plugin.ts";

export const projectAgent: ProjectAgent = {
  character,
  plugins: [sellerPlugin],
};

const project: Project = {
  agents: [projectAgent],
};

export { character } from "./character.ts";

export default project;
