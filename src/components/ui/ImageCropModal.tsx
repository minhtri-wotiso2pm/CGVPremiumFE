import { useState, useCallback, useEffect, type FC } from "react";
import { Modal, Button, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import { getCroppedBlob } from "@/utils/cropImage";
import { notify } from "@/utils/notify";

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 10;

interface Props {
    open: boolean;
    /** Crop aspect ratio (width / height). Defaults to 1 (square). */
    aspect?: number;
    title?: string;
    /** Round mask overlay (for avatar-style crops). */
    cropShape?: "rect" | "round";
    onCancel: () => void;
    /** Called with the cropped JPEG file once the user confirms. */
    onDone: (file: File) => void;
    zIndex?: number;
}

/**
 * Generic image cropper modal (choose → crop → confirm) returning a JPEG File.
 * Network-agnostic: the caller decides what to do with the resulting file.
 */
const ImageCropModal: FC<Props> = ({
    open, aspect = 1, title = "Adjust Photo", cropShape = "rect", onCancel, onDone, zIndex,
}) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [cropPixels, setCropPixels] = useState<Area | null>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!open) {
            setImageSrc(null);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setCropPixels(null);
        }
    }, [open]);

    const onCropComplete = useCallback((_: Area, px: Area) => setCropPixels(px), []);

    const beforeUpload = (file: File) => {
        if (!ACCEPT.includes(file.type)) {
            notify.error("Invalid file type.", "Only JPG, PNG or WebP images are allowed.");
            return false;
        }
        if (file.size > MAX_MB * 1024 * 1024) {
            notify.error("File too large.", `The image must be under ${MAX_MB} MB.`);
            return false;
        }
        const reader = new FileReader();
        reader.onload = () => setImageSrc(reader.result as string);
        reader.readAsDataURL(file);
        return false;
    };

    const handleDone = async () => {
        if (!imageSrc || !cropPixels) return;
        setProcessing(true);
        try {
            const blob = await getCroppedBlob(imageSrc, cropPixels);
            const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });
            onDone(file);
        } catch {
            notify.error("Crop failed.", "Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Modal
            open={open}
            title={title}
            onCancel={onCancel}
            footer={null}
            width={440}
            destroyOnHidden
            maskClosable={!processing}
            closable={!processing}
            zIndex={zIndex}
        >
            <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 8 }}>
                {imageSrc ? (
                    <>
                        <div style={{
                            position: "relative", width: "100%", height: 300,
                            background: "#1a1a1a", borderRadius: 10, overflow: "hidden",
                        }}>
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={aspect}
                                cropShape={cropShape}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--dash-text-2, #666)" }}>Zoom</span>
                            <input
                                type="range" min={1} max={3} step={0.01}
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                aria-label="Zoom"
                                disabled={processing}
                                style={{ flex: 1 }}
                            />
                        </div>
                    </>
                ) : (
                    <div style={{
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        gap: 10, height: 200, border: "1px dashed var(--dash-border, #d9d9d9)", borderRadius: 10,
                        color: "var(--dash-text-3, #999)", fontSize: 13,
                    }}>
                        <span style={{ fontSize: 32 }}>🖼️</span>
                        Choose an image to crop.
                    </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <Upload beforeUpload={beforeUpload} showUploadList={false} accept=".jpg,.jpeg,.png,.webp" disabled={processing}>
                        <Button icon={<UploadOutlined />} disabled={processing}>
                            {imageSrc ? "Choose Different Image" : "Upload Image"}
                        </Button>
                    </Upload>
                    <div style={{ display: "flex", gap: 8 }}>
                        <Button onClick={onCancel} disabled={processing}>Cancel</Button>
                        <Button type="primary" onClick={handleDone} loading={processing} disabled={!imageSrc}>
                            Apply
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ImageCropModal;
