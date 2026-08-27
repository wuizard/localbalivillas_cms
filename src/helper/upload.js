import axios from 'axios';
import Compressor from 'compressorjs';

import { presignUpload } from 'services/uploadService';

// Four at a time. One-at-a-time was the old behaviour and it is what made a
// 75-image property take minutes; unbounded parallelism just trades that for
// throttling and a stalled browser.
export const UPLOAD_CONCURRENCY = 4;

const COMPRESS_QUALITY = 0.7;
// Anything already small is not worth the CPU or the quality loss.
const COMPRESS_THRESHOLD_BYTES = 300 * 1024;

export const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

export function isImageFile(file) {
    return !!file && typeof file === 'object' && ACCEPTED_TYPES.indexOf(String(file.type).toLowerCase()) >= 0;
}

// Compression is an optimisation, never a gate: if it fails for any reason we
// upload the original rather than losing the operator's photo.
function compressImage(file) {
    return new Promise((resolve) => {
        if (file.type === 'image/gif' || file.size <= COMPRESS_THRESHOLD_BYTES) {
            resolve(file);
            return;
        }
        try {
            new Compressor(file, {
                quality: COMPRESS_QUALITY,
                success: (result) => resolve(result),
                error: () => resolve(file),
            });
        } catch (error) {
            resolve(file);
        }
    });
}

// Uploads one file straight to S3 through a presigned URL and returns its public
// URL. Progress is reported 0-100.
export async function uploadImage(file, { dirName, onProgress, signal } = {}) {
    const blob = await compressImage(file);
    // Whatever the compressor handed back is what we declare and what we send -
    // the old code hardcoded image/png and mislabelled every JPEG in the bucket.
    const contentType = blob.type || file.type || 'image/jpeg';

    const { data, error } = await presignUpload({
        contentType,
        dirName,
        size: blob.size,
    });
    if (error || !data) { throw new Error(error || 'Could not get an upload URL'); }

    await axios.put(data.uploadUrl, blob, {
        headers: { 'Content-Type': contentType },
        timeout: 0,
        signal,
        onUploadProgress: (event) => {
            if (!onProgress) { return; }
            const total = event.total || blob.size;
            onProgress(total ? Math.round((event.loaded / total) * 100) : 0);
        },
    });

    return data.publicUrl;
}

// Runs `worker` over `items` with at most `limit` in flight. Never rejects -
// each item settles independently so one bad file cannot take the batch down.
export async function runWithConcurrency(items, limit, worker) {
    const queue = items.map((item, index) => ({ item, index }));
    const results = new Array(items.length);

    const runners = new Array(Math.min(limit, queue.length)).fill(null).map(async () => {
        while (queue.length > 0) {
            const { item, index } = queue.shift();
            try {
                results[index] = { status: 'fulfilled', value: await worker(item, index) };
            } catch (error) {
                results[index] = { status: 'rejected', reason: error };
            }
        }
    });

    await Promise.all(runners);
    return results;
}

export function readableUploadError(error) {
    if (!error) { return 'Upload failed'; }
    if (error.message) { return error.message; }
    return String(error);
}
