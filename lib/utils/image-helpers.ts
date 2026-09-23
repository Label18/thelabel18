import toast from "react-hot-toast";

async function convertHeicToJpeg(file: File): Promise<File> {
  if (typeof window === "undefined") return file;
  try {
    // Dynamically import heic2any so it doesn't break SSR
    // @ts-ignore
    const heic2anyModule = await import("heic2any");
    const heic2any = heic2anyModule.default || heic2anyModule;

    const convertedBlob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.85,
    });

    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

    return new File(
      [blob],
      file.name.replace(/\.(heic|heif)$/i, ".jpg"),
      { type: "image/jpeg", lastModified: Date.now() }
    );
  } catch (error) {
    console.error("HEIC conversion failed:", error);
    throw new Error("Could not convert HEIC image. Please upload a JPG or PNG instead.");
  }
}

export async function resizeAndCompressImage(
  file: File,
  maxWidth = 1600,
  quality = 0.82
): Promise<File> {
  if (typeof window === "undefined") return file;
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }
  // If file is already small (e.g. < 400KB), keep it as is
  if (file.size < 400 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file);
            return;
          }
          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, ".jpg"),
            {
              type: "image/jpeg",
              lastModified: Date.now(),
            }
          );
          resolve(compressedFile);
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

export async function processImageFile(file: File): Promise<File> {
  const isHeic = file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif");
  let workingFile = file;
  if (isHeic) {
    workingFile = await convertHeicToJpeg(file);
  }
  return await resizeAndCompressImage(workingFile);
}

export async function handleFileSelection(
  files: File[],
  onSuccess: (processedFiles: File[]) => void
) {
  if (files.length === 0) return;

  const hasHeic = files.some(
    (f) => f.name.toLowerCase().endsWith(".heic") || f.name.toLowerCase().endsWith(".heif")
  );

  let toastId;
  if (hasHeic) {
    toastId = toast.loading("Converting Apple HEIC format...");
  }

  try {
    const processedFiles = await Promise.all(files.map(processImageFile));
    if (toastId) {
      toast.success("Ready!", { id: toastId });
    }
    onSuccess(processedFiles);
  } catch (error: any) {
    if (toastId) {
      toast.error(error?.message || "Failed to process image format", { id: toastId });
    } else {
      toast.error(error?.message || "Failed to process image format");
    }
  }
}

