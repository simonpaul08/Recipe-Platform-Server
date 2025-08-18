import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.string().default('4000'),
  DATABASE_URL: z.string().default('./sqlite.db'),
  JWT_SECRET: z.string().min(6, 'JWT_SECRET must be at least 32 characters'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development')
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  process.exit(1);
}

export const env = {
  PORT: parseInt(parsed.data.PORT, 10),
  DATABASE_URL: parsed.data.DATABASE_URL,
  JWT_SECRET: parsed.data.JWT_SECRET,
  NODE_ENV: parsed.data.NODE_ENV
};
