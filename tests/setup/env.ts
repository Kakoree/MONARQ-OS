import { config } from "dotenv";

// Layered like the app's own env loading: base config then test-only
// secrets, so the suite always runs against whatever project .env.local
// already points at (production, in this repo's current setup).
config({ path: ".env.local" });
config({ path: ".env.test.local" });
