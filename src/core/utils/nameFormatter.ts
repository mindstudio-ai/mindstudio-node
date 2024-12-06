interface FormattableEntity {
  name: string;
  slug?: string;
  id?: string;
}

export class EntityFormatter {
  static formatWorker(worker: FormattableEntity): string {
    if (worker.slug) {
      return this.formatEntity(worker.slug, "pascalCase");
    }
    const name = this.formatEntity(worker.name, "pascalCase");
    return `${name}_${worker.id?.split("-")[0]}`;
  }

  static formatWorkflow(workflow: FormattableEntity): string {
    return this.formatEntity(workflow.name, "camelCase");
  }

  private static formatEntity(
    name: string,
    caseStyle: "camelCase" | "pascalCase"
  ): string {
    // Preserve leading underscores
    const leadingUnderscores = name.match(/^_+/)?.[0] || "";

    // Remove illegal characters (keeping only letters, numbers, spaces, hyphens, and underscores)
    const cleanName = name
      .replace(/^_+/, "") // temporarily remove leading underscores
      .replace(/[^\w\s-]/g, ""); // remove all other illegal characters

    // Split on spaces, hyphens, and camelCase boundaries
    const words = cleanName
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .split(/[\s-]+/)
      .map((word) => word.toLowerCase())
      .filter((word) => word.length > 0);

    // Convert to camelCase and reattach leading underscores
    return (
      leadingUnderscores +
      words
        .map((word, index) =>
          index === 0 && caseStyle === "camelCase"
            ? word.toLowerCase()
            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join("")
    );
  }
}
