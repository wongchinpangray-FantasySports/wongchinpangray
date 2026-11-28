import fs from "fs";
import path from "path";
import { getCloudflareEnv } from "@/lib/cf";
import { HANDBOOK } from "@/lib/handbook";

function localUploadsDir() {
  const dir = path.join(process.cwd(), "data", "uploads");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function localHandbookPath() {
  return path.join(process.cwd(), "content", "handbooks", HANDBOOK.filename);
}

export async function putUploadObject(
  filename: string,
  data: ArrayBuffer | Uint8Array | Buffer,
  contentType: string,
) {
  const env = await getCloudflareEnv();
  if (env?.TAG_ASSETS) {
    await env.TAG_ASSETS.put(`uploads/${filename}`, data, {
      httpMetadata: { contentType },
    });
    return;
  }
  const dest = path.join(localUploadsDir(), filename);
  fs.writeFileSync(dest, Buffer.from(data));
}

export async function getUploadObject(
  filename: string,
): Promise<{ body: Uint8Array; contentType?: string } | null> {
  const env = await getCloudflareEnv();
  if (env?.TAG_ASSETS) {
    const obj = await env.TAG_ASSETS.get(`uploads/${filename}`);
    if (!obj) return null;
    const buf = new Uint8Array(await obj.arrayBuffer());
    return {
      body: buf,
      contentType: obj.httpMetadata?.contentType,
    };
  }
  const filePath = path.join(localUploadsDir(), filename);
  if (!fs.existsSync(filePath)) return null;
  return { body: new Uint8Array(fs.readFileSync(filePath)) };
}

export async function deleteUploadObject(filename: string) {
  const env = await getCloudflareEnv();
  if (env?.TAG_ASSETS) {
    await env.TAG_ASSETS.delete(`uploads/${filename}`);
    return;
  }
  const filePath = path.join(localUploadsDir(), filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

/** Handbook PDF bytes — local content/ or R2 handbooks/ key. */
export async function getHandbookBytes(): Promise<Uint8Array | null> {
  const env = await getCloudflareEnv();
  if (env?.TAG_ASSETS) {
    const obj = await env.TAG_ASSETS.get(`handbooks/${HANDBOOK.filename}`);
    if (obj) return new Uint8Array(await obj.arrayBuffer());
  }
  const filePath = localHandbookPath();
  if (fs.existsSync(filePath)) {
    return new Uint8Array(fs.readFileSync(filePath));
  }
  return null;
}
