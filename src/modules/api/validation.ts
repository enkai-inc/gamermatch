export function validateBody<T>(schema: { parse: (data: unknown) => T }, body: unknown): T {
  return schema.parse(body);
}
