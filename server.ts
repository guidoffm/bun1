
import express, { type NextFunction, type Request, type Response } from 'express';
// import bodyParser from 'body-parser';

import jwt, { type DecodeOptions, type Jwt, type JwtPayload } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

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
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.log(err);
  res.status(500).send("Something broke!");
});

// add express custom middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`"${req.url}" requested`);
  next();
});

app.get("/healthz", (_req: Request, res: Response) => {
  res.status(200).send("OK");
});

app.get("/livez", (_req: Request, res: Response) => {
  res.status(200).send("OK");
});

app.get("/readyz", (_req: Request, res: Response) => {
  res.status(200).send("OK");
});

app.use('/api/', async (req: Request, res: Response, next: NextFunction) => {
  console.log('JWT middleware');
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) {
      res.sendStatus(401);
  } else {
      try {
          const jwtoken = jwt.decode(token, { complete: true } as DecodeOptions) as Jwt;
          const kid = jwtoken.header.kid;
          // console.log('kid', kid);
          const iss = (jwtoken.payload as JwtPayload).iss;
          // console.log('iss', iss);
          const configResponse = await fetch(`${iss}/.well-known/openid-configuration`);
          const data = await configResponse.json();
          if (typeof data === 'object' && data &&  'jwks_uri' in data && typeof data.jwks_uri === 'string') {
            const jwksUri = data.jwks_uri;
            // console.log(jwksUri);
            const client = jwksClient({ jwksUri: jwksUri, timeout: 3000 });
            const key = await client.getSigningKey(kid);
            const signingKey = key.getPublicKey();
            const tokenData = jwt.verify(token, signingKey);
            console.log('tokenData', tokenData);
            res.locals['tokenData'] = tokenData;
            next();
          } else {
            throw new Error('Invalid data');
          }
      } catch (err) {
          console.error(err);
          res.sendStatus(403);
      }
  }
});

app.get("/api/test", (_req: Request, res: Response) => {
    // throw new Error("BROKEN"); // Express will catch this on its own.
  res.send({ message: "Hello World!" });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});