// Load environment variables before anything else reads them.
// `npm run dev` starts the server inside server/, so look for .env in the
// project root first, then in server/ (values already set are never overwritten).
import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
config({ path: [path.resolve(here, "../../.env"), path.resolve(here, "../.env")], quiet: true });
