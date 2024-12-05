import { TypeGenerator } from "../../codegen";
import { ConfigManager } from "../config";

export class GenerateCommand {
  constructor(
    private config: ConfigManager,
    private typeGenerator: TypeGenerator
  ) {}

  public async execute(): Promise<void> {
    try {
      if (!(await this.config.exists())) {
        console.error('No configuration found. Run "mindstudio sync" first.');
        return;
      }

      const config = await this.config.load();
      console.log("Generating type definitions...");

      const types = this.typeGenerator.generateTypes(
        this.config.convertToWorkerWorkflows(config)
      );
      await this.config.writeTypes(types);

      console.log("Successfully generated type definitions");
    } catch (error) {
      console.error("Generation failed:", error);
    }
  }
}
