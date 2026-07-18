import type { Area } from "react-easy-crop";

/** Load an image element from a data/blob/remote URL. */
function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const el = new Image();
        el.crossOrigin = "anonymous";
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = src;
    });
}

/**
 * Crop the given image to `cropPixels` and return a JPEG blob.
 * Shared by the customer avatar cropper and the admin person-photo cropper.
 */
export async function getCroppedBlob(
    imageSrc: string,
    cropPixels: Area,
    mime = "image/jpeg",
    quality = 0.9,
): Promise<Blob> {
    const img = await loadImage(imageSrc);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(cropPixels.width);
    canvas.height = Math.round(cropPixels.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");
    ctx.drawImage(
        img,
        cropPixels.x, cropPixels.y, cropPixels.width, cropPixels.height,
        0, 0, canvas.width, canvas.height,
    );
    return new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Canvas toBlob failed"))), mime, quality),
    );
}
