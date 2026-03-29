import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { auth } from "@clerk/nextjs/server";

const CAMERAS_FILE = path.join(process.cwd(), "src", "data", "cameras.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "data", "images");

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const cameraId = formData.get("id") as string;

    if (!file || !cameraId) {
      return NextResponse.json({ error: "Missing file or camera id." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create directory if not exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const ext = file.name.split('.').pop() || "jpg";
    const filename = `${cameraId}-${Date.now()}.${ext}`;
    const destinationPath = path.join(UPLOAD_DIR, filename);

    fs.writeFileSync(destinationPath, buffer);

    // Update cameras.json
    const camerasData = fs.readFileSync(CAMERAS_FILE, "utf-8");
    const cameras = JSON.parse(camerasData);

    const index = cameras.findIndex((c: any) => c.id === cameraId);
    if (index !== -1) {
      cameras[index].image_file = `data/images/${filename}`;
      fs.writeFileSync(CAMERAS_FILE, JSON.stringify(cameras, null, 2));
      return NextResponse.json({ success: true, image_file: cameras[index].image_file });
    } else {
      return NextResponse.json({ error: "Camera not found in database." }, { status: 404 });
    }

  } catch (err: any) {
    console.error("Upload Error:", err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
