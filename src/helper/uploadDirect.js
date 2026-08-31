import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Signs an S3 upload URL in the browser, using credentials baked into the bundle.
 *
 * ---------------------------------------------------------------------------
 * READ THIS BEFORE SETTING THE VARIABLES BELOW
 *
 * Create React App's DefinePlugin replaces `process.env` with a whole object
 * literal, so every REACT_APP_* variable present when `react-scripts build` runs
 * is written verbatim into `main.<hash>.js`. That file is served to anyone who
 * opens the CMS, signed in or not.
 *
 * Setting REACT_APP_AWS_SECRET_ACCESS_KEY therefore publishes that secret key.
 * It cannot be hidden by minification, a login screen, or an env var name.
 *
 * If you use this path, the IAM user MUST be scoped to `s3:PutObject` on the one
 * bucket and nothing else, and it should be treated as a public credential: rotate
 * it on the same schedule you would rotate anything that has leaked.
 *
 * The alternative is to leave these unset, which routes uploads through
 * `POST /admin/upload/presign` on the API instead — same result, credentials never
 * leave the server. See `chooseUploadStrategy` in ./upload.js.
 * ---------------------------------------------------------------------------
 */

const REGION = process.env.REACT_APP_AWS_REGION || 'ap-southeast-1';
const BUCKET = process.env.REACT_APP_AWS_S3_BUCKET;
const PREFIX = process.env.REACT_APP_AWS_S3_PREFIX || 'lbv';
const ACCESS_KEY_ID = process.env.REACT_APP_AWS_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.REACT_APP_AWS_SECRET_ACCESS_KEY;

const PRESIGN_EXPIRY_SECONDS = 300;

// Mirrors the server's allowlist. The client cannot be trusted to enforce this —
// it is here so the two paths produce the same key layout, not as a control.
const ALLOWED_DIRS = ['properties', 'rooms', 'amenities', 'activities', 'events'];

const EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

/** True when the bundle carries everything needed to sign without the API. */
export function hasDirectCredentials() {
  return Boolean(ACCESS_KEY_ID && SECRET_ACCESS_KEY && BUCKET);
}

let cachedClient = null;

function getClient() {
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: REGION,
      credentials: { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY },
    });
  }
  return cachedClient;
}

/**
 * Returns `{ uploadUrl, publicUrl }` for one object, matching the shape
 * `POST /admin/upload/presign` returns so the caller does not care which path ran.
 */
export async function signDirectUpload({ contentType, dirName, size }) {
  const extension = EXTENSIONS[String(contentType || '').toLowerCase()];
  if (!extension) {
    throw new Error(`Unsupported file type: ${contentType || 'unknown'}`);
  }
  if (size && size > 15 * 1024 * 1024) {
    throw new Error('File is larger than 15MB');
  }

  const dir = ALLOWED_DIRS.indexOf(dirName) >= 0 ? dirName : ALLOWED_DIRS[0];

  // Same key shape the server produces, so objects from either path sit together
  // and a random suffix keeps concurrent uploads from colliding.
  const key = `${PREFIX}/${dir}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const uploadUrl = await getSignedUrl(
    getClient(),
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: PRESIGN_EXPIRY_SECONDS },
  );

  return {
    uploadUrl,
    publicUrl: `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`,
    key,
    expiresIn: PRESIGN_EXPIRY_SECONDS,
  };
}
