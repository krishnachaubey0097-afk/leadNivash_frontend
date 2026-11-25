import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().default('/api/v1'),
  VITE_APP_NAME: z.string().default('LeadNivash'),
  VITE_FOUNDER_WHATSAPP: z.string().default('919812345678'),
  VITE_UPI_ID: z.string().default('leadnivesh@okhdfcbank'),
  VITE_ENABLE_VOICE: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),
  VITE_ENABLE_STAMP_DUTY: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),
  VITE_ENABLE_GOALS: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  throw new Error('Invalid environment variables. Please check your .env configuration.');
}

export const env = parsed.data;
