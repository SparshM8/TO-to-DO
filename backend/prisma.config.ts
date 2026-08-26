import { defineConfig } from "prisma/config";

const databaseUrl = process.env.DATABASE_URL ?? "mongodb://127.0.0.1:27017/to2do";
process.env.DATABASE_URL ??= databaseUrl;

export default defineConfig({
  schema: "prisma/schema.prisma",
  engine: "classic",
  datasource: {
    url: databaseUrl,
  },
});
