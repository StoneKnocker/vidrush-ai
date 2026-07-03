export function hasRenderableContent(value: unknown): boolean {
  if (value == null) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return true;
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasRenderableContent(item));
  }

  if (typeof value === "object") {
    return Object.entries(value).some(([key, item]) => {
      if (key === "enabled") {
        return false;
      }
      return hasRenderableContent(item);
    });
  }

  return false;
}

export function shouldRenderSection<T extends { enabled?: boolean }>(
  section: T | null | undefined,
): section is T {
  if (!section || section.enabled === false) {
    return false;
  }

  if (section.enabled === true) {
    return true;
  }

  return hasRenderableContent(section);
}
