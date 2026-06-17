# Image storage — private S3 + CloudFront

Product images live in a **private** S3 bucket and are served **only** through a
CloudFront distribution (Origin Access Control). The bucket blocks all public
access; nothing reads it directly. Admins upload via short-lived presigned PUT
URLs, and each product stores its CloudFront URL.

```
Admin UI ──(1) POST /api/products/upload-url──▶ backend ──▶ presigned PUT URL
Admin UI ──(2) PUT file ──────────────────────▶ S3 (private)
Admin UI ──(3) save product with fileUrl ─────▶ Mongo (img = https://<cdn>/products/<uuid>.jpg)
Shopper  ──(4) GET image ──────────────────────▶ CloudFront ──▶ S3 (via OAC)
```

## 1. Provision AWS resources (one time)

Requires Terraform ≥ 1.3 and AWS credentials with permission to create
S3 / CloudFront / IAM (your own admin creds, used only to run Terraform).

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars   # edit allowed_origins for your frontend
terraform init
terraform apply
```

Terraform creates: the private bucket (public access blocked, versioned, CORS
for PUT), a CloudFront distribution with OAC, a bucket policy that allows only
that distribution to read, and a least-privilege IAM user that may only
`PutObject` under `products/`.

State contains the IAM secret — it is gitignored; keep it safe (or use a remote
backend like S3+DynamoDB for teams).

## 2. Wire the backend

Copy the Terraform outputs into `backend/.env`:

```bash
terraform output                       # shows bucket, region, cloudfront_domain, access key id
terraform output -raw aws_secret_access_key   # the secret (sensitive)
```

```env
AWS_REGION=us-east-1
S3_BUCKET=farming-assistant-product-images-prod
CLOUDFRONT_DOMAIN=dxxxxxxxxxxxxx.cloudfront.net
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

If these are unset, the upload endpoint returns `503 Image storage is not
configured` — the rest of the app keeps working.

## 3. Migrate existing images

Pulls each product's current `img`, uploads it to S3, and rewrites `img` to the
CloudFront URL. Dead/deprecated links are reported and skipped (not fatal).

```bash
cd backend
yarn migrate:images --dry-run   # report what would happen
yarn migrate:images             # actually migrate
```

Products already on the CloudFront domain are skipped, so it's safe to re-run.

## API

`POST /api/products/upload-url` (admin only)
```json
// request
{ "contentType": "image/png" }
// response 201
{ "uploadUrl": "https://...s3...?X-Amz-Signature=...", "key": "products/<uuid>.png",
  "fileUrl": "https://<cdn>/products/<uuid>.png", "expiresIn": 60 }
```
The admin UI PUTs the file bytes to `uploadUrl` (with the same `Content-Type`),
then saves the product with `img = fileUrl`. Allowed types: JPEG, PNG, WebP, GIF.
