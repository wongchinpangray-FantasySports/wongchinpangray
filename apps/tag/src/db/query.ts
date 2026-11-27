/** Normalize sync (better-sqlite3) and async (D1) Drizzle executors. */

export async function dbAll<T>(q: {
  all: () => T[] | Promise<T[]>;
}): Promise<T[]> {
  return Promise.resolve(q.all());
}

export async function dbGet<T>(q: {
  get: () => T | undefined | Promise<T | undefined>;
}): Promise<T | undefined> {
  return Promise.resolve(q.get());
}

export async function dbRun(q: {
  run: () => unknown | Promise<unknown>;
}): Promise<void> {
  await Promise.resolve(q.run());
}
