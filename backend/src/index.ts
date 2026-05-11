import "dotenv/config";

import { app } from "./app";

const PORT = process.env.APP_PORT || 4000;

app.listen(PORT, () =>
  console.log(`Server ready at: http://localhost:${PORT}`),
);
