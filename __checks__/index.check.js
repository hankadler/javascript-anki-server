import "../index";

// check server and database connections close gracefully
setTimeout(() => process.kill(process.pid, "SIGTERM"), 3000);
