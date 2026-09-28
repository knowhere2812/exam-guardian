import { app } from "./app.js";
import { env } from "./config/env.js";

app.listen(env.PORT, () => {
  console.log(`Exam Guardian API listening on port ${env.PORT}`);
});
