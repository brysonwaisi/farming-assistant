/*
 * Migrate product images from their current (often dead) external URLs into the
 * private S3 bucket, and rewrite each product's `img` to the CloudFront URL.
 *
 * Usage:
 *   node scripts/migrateImages.js            # migrate everything not yet on CloudFront
 *   node scripts/migrateImages.js --dry-run  # report only, no writes
 *
 * Requires the same env as the app (MONGODB_URI, AWS_*, S3_BUCKET, CLOUDFRONT_DOMAIN).
 */
/* eslint-disable no-await-in-loop, no-continue, no-restricted-syntax */
// Sequential by design: process one image at a time so we don't hammer the
// source servers or S3, and so progress/output stays readable.
import 'dotenv/config';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import Product from '../models/Product';
import { publicUrl, ALLOWED_TYPES, isConfigured } from '../services/s3Service';

const DRY_RUN = process.argv.includes('--dry-run');
const KEY_PREFIX = 'products/';
const s3 = new S3Client({ region: process.env.AWS_REGION });

const extFor = (contentType: string | null): string | undefined => ALLOWED_TYPES[(contentType || '').split(';')[0]!.trim()];

interface FetchedImage {
  body: Buffer;
  contentType: string;
  ext: string;
}

const fetchImage = async (url: string): Promise<FetchedImage> => {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const contentType = res.headers.get('content-type');
  const ext = extFor(contentType);
  if (!ext) throw new Error(`Unsupported content-type: ${contentType}`);
  const body = Buffer.from(await res.arrayBuffer());
  return { body, contentType: contentType!.split(';')[0]!.trim(), ext };
};

const uploadToS3 = async ({ body, contentType, ext }: FetchedImage): Promise<string> => {
  const key = `${KEY_PREFIX}${crypto.randomUUID()}.${ext}`;
  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
  return key;
};

interface FailedItem {
  title: string;
  url: string;
  reason: string;
}

interface Summary {
  migrated: number;
  skipped: number;
  failed: FailedItem[];
}

const run = async (): Promise<void> => {
  if (!isConfigured()) {
    throw new Error('AWS_REGION, S3_BUCKET and CLOUDFRONT_DOMAIN must be set.');
  }
  await mongoose.connect(process.env.MONGODB_URI!, { dbName: process.env.DB_NAME });

  const products = await Product.find();
  const summary: Summary = { migrated: 0, skipped: 0, failed: [] };

  for (const product of products) {
    const url = product.img;
    // Already on our CDN -> nothing to do.
    if (!url || url.includes(process.env.CLOUDFRONT_DOMAIN!)) {
      summary.skipped += 1;
      continue;
    }
    try {
      const image = await fetchImage(url);
      if (DRY_RUN) {
        process.stdout.write(`WOULD migrate: ${product.title} (${url})\n`);
        summary.migrated += 1;
        continue;
      }
      const key = await uploadToS3(image);
      product.img = publicUrl(key);
      await product.save();
      process.stdout.write(`migrated: ${product.title} -> ${product.img}\n`);
      summary.migrated += 1;
    } catch (err: unknown) {
      // Dead/broken link or unsupported type — flag, don't crash the run.
      const reason = err instanceof Error ? err.message : String(err);
      summary.failed.push({ title: product.title, url, reason });
      process.stderr.write(`FAILED: ${product.title} (${url}) — ${reason}\n`);
    }
  }

  process.stdout.write('\n--- Summary ---\n');
  process.stdout.write(`migrated: ${summary.migrated}\n`);
  process.stdout.write(`skipped (already on CDN): ${summary.skipped}\n`);
  process.stdout.write(`failed (dead/unsupported): ${summary.failed.length}\n`);
  summary.failed.forEach((f) => process.stdout.write(`  - ${f.title}: ${f.reason}\n`));

  await mongoose.disconnect();
};

run().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`Migration aborted: ${message}\n`);
  process.exit(1);
});
