import slugify from "slugify";
import { nanoid } from "nanoid";

type SlugCheck = (slug: string) => Promise<boolean>;

// Produces a URL-safe slug from a name.
// Appends a short nanoid suffix only when the base slug is already taken.
//
// `isTaken` is a callback so this helper stays decoupled from Prisma
// and can be reused for products later.
export async function generateUniqueSlug(
  name: string,
  isTaken: SlugCheck,
): Promise<string> {
  const base = slugify(name, { lower: true, strict: true, trim: true });

  // Guard against names that slugify to nothing (e.g. "!!!").
  const safeBase = base || "item";

  if (!(await isTaken(safeBase))) return safeBase;

  // Collision: append a short suffix. Retry a couple of times in the
  // unlikely event the suffixed slug also collides.
  for (let attempt = 0; attempt < 3; attempt++) {
    const candidate = `${safeBase}-${nanoid(4).toLowerCase()}`;
    if (!(await isTaken(candidate))) return candidate;
  }

  // Extremely unlikely fallback — longer suffix to guarantee uniqueness.
  return `${safeBase}-${nanoid(6).toLowerCase()}`;
}
