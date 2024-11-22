import { nowWatching } from "../bot/nowWatching";
import { login } from "../bsky/auth";

(async () => {
  const bot = await login();

  await nowWatching(bot);

  process.exit(0);
})();