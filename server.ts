import express from "express";

const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
// app.use("/api", require("./routes/api"));
// app.use("/auth", require("./routes/auth"));
// app.use("/user", require("./routes/user"));
// app.use("/admin", require("./routes/admin"));
// app.use("/super", require("./routes/super"));
// app.use("/test", require("./routes/test"));
// add express middleware to handle errors  
app.use((err: any, _req: any, res: any, _next: any) => {
  console.log(err);
  res.status(500).send("Something broke!");
});

// add express custom middleware
app.use((req: any, _res: any, next: any) => {
  console.log(`"${req.url}" requested`);
  next();
});

app.get("/api/test", (_req, res) => {
    // throw new Error("BROKEN"); // Express will catch this on its own.
  res.send({ message: "Hello World!" });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});