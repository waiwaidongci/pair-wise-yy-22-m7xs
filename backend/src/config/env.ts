export const config = {
  port: Number(process.env.PORT ?? 3000),
  dbHost: process.env.DB_HOST ?? "localhost",
  jwtSecret: process.env.JWT_SECRET ?? "local-dev-secret"
};
