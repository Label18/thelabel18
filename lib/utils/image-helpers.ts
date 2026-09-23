import toast from "react-hot-toast";

export async function processImageFile(file: File): Promise<File> {
  const isHeic = file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif");
  if (!isHeic) return file;

  try {
    // Dynamically import heic2any so it doesn't break SSR
    const heic2any = (await import("heic2any")).default;

    const convertedBlob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.8,
    });

    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

    return new File(
      [blob],
      file.name.replace(/\.heic$/i, ".jpg").replace(/\.heif$/i, ".jpg"),
      { type: "image/jpeg" }
    );
  } catch (error) {
    console.error("HEIC conversion failed:", error);
    throw new Error("Failed to convert HEIC image");
  }
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
  } catch (error) {
    if (toastId) {
      toast.error("Failed to process image format", { id: toastId });
    }
  }
}
