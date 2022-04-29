import app from "./app";
import ankiDatabase from "./databases/ankiDatabase";

let server;
const nodeEnv = process.env.NODE_ENV || "dev";
const dbURI = process.env[`DB_${nodeEnv.toUpperCase()}`];

ankiDatabase.connect(dbURI)
  .then(() => {
    const port = process.env.PORT || 3000;
    server = app.listen(port, () => console.log(`\nServer on port: ${port}\n`));
  })
  .catch((err) => {
    console.log(err.message);
    process.kill(process.pid, "SIGTERM");
  });

process.on("SIGTERM", () => {
  ankiDatabase.disconnect(() => console.log("Disconnected from db"));
  server.close(() => console.log("Server closed"));
});
