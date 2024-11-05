interface FormattableEntity {
  name: string;
  slug?: string;
  id?: string;
}

export class EntityFormatter {
  static formatWorker(worker: FormattableEntity): string {
    return this.formatEntity(
      worker.slug || `${worker.name} ${worker.id?.split("-")[0]}`
    );
  }

  static formatWorkflow(workflow: FormattableEntity): string {
    return this.formatEntity(workflow.name);
  }

  private static formatEntity(name: string): string {
    return name
      .split(/\s+/)
      .map((word, index) =>
        index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join("")
      .replace(/[^a-zA-Z0-9]/g, "");
  }
}
