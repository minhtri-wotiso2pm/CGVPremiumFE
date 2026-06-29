import { useState, useCallback, type FC } from "react";
import { Modal, Upload, Button, Popconfirm, message } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import type { ProfileResponse } from "../types/profile.type";
import { buildInitialsAvatar } from "../utils/profile.mapper";
import { useUploadAvatar } from "../hooks/useUploadAvatar";
import { useDeleteAvatar } from "../hooks/useDeleteAvatar";
import { AVATAR_MAX_SIZE_MB, AVATAR_ACCEPT_TYPES } from "../constants/profile.constants";
import styles from "./AvatarModal.module.css";

/* ─── Canvas crop helper ─── */
async function getCroppedBlob(imageSrc: string, cropPixels: Area): Promise<Blob> {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
        const el = new Image();
        el.onload = () => res(el);
        el.onerror = rej;
        el.src = imageSrc;
    });
    const canvas = document.createElement("canvas");
    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, cropPixels.x, cropPixels.y, cropPixels.width, cropPixels.height, 0, 0, cropPixels.width, cropPixels.height);
    return new Promise((res, rej) =>
        canvas.toBlob((b) => (b ? res(b) : rej(new Error("Canvas toBlob failed"))), "image/jpeg", 0.9)
    );
}

interface Props {
    open: boolean;
    profile: ProfileResponse;
    onClose: () => void;
}

const AvatarModal: FC<Props> = ({ open, profile, onClose }) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [cropPixels, setCropPixels] = useState<Area | null>(null);
    const [saving, setSaving] = useState(false);

    const { mutate: upload } = useUploadAvatar(onClose);
    const { mutate: remove } = useDeleteAvatar(onClose);

    const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
        setCropPixels(croppedAreaPixels);
    }, []);

    const handleFileSelect = (file: File) => {
        if (!AVATAR_ACCEPT_TYPES.includes(file.type)) {
            message.error("Only JPG, PNG or WebP files are allowed."); return false;
        }
        if (file.size > AVATAR_MAX_SIZE_MB * 1024 * 1024) {
            message.error(`File must be smaller than ${AVATAR_MAX_SIZE_MB} MB.`); return false;
        }
        const reader = new FileReader();
        reader.onload = () => setImageSrc(reader.result as string);
        reader.readAsDataURL(file);
        return false; // prevent auto-upload
    };

    const handleSave = async () => {
        if (!imageSrc || !cropPixels) return;
        setSaving(true);
        try {
            const blob = await getCroppedBlob(imageSrc, cropPixels);
            const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
            upload(file);
        } catch {
            message.error("Crop failed. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setImageSrc(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        onClose();
    };

    const currentAvatar = profile.avatarURL ?? buildInitialsAvatar(profile.fullName);

    return (
        <Modal
            open={open}
            onCancel={handleClose}
            title={<span className={styles.title}>Change Avatar</span>}
            footer={null}
            width={420}
            destroyOnClose
        >
            <div className={styles.body}>
                {/* ── Crop area ── */}
                {imageSrc ? (
                    <div className={styles.cropWrap}>
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                    </div>
                ) : (
                    <div className={styles.preview}>
                        <img src={currentAvatar} alt="Current avatar" className={styles.previewImg} />
                        <p className={styles.previewHint}>Upload a new photo to change your avatar.</p>
                    </div>
                )}

                {/* ── Zoom slider (only when image selected) ── */}
                {imageSrc && (
                    <div className={styles.sliderRow}>
                        <span className={styles.sliderLabel}>Zoom</span>
                        <input
                            type="range" min={1} max={3} step={0.01}
                            value={zoom} onChange={(e) => setZoom(Number(e.target.value))}
                            className={styles.slider}
                            aria-label="Zoom"
                        />
                    </div>
                )}

                {/* ── Actions ── */}
                <div className={styles.actions}>
                    <Upload beforeUpload={handleFileSelect} showUploadList={false} accept=".jpg,.jpeg,.png,.webp">
                        <Button icon={<UploadOutlined />} className={styles.uploadBtn}>
                            {imageSrc ? "Choose Different Photo" : "Upload Photo"}
                        </Button>
                    </Upload>

                    {imageSrc && (
                        <Button
                            type="primary"
                            onClick={handleSave}
                            loading={saving}
                            className={styles.saveBtn}
                        >
                            Save Avatar
                        </Button>
                    )}
                </div>

                {/* ── Remove avatar ── */}
                {!imageSrc && profile.avatarURL && (
                    <div className={styles.removeRow}>
                        <Popconfirm
                            title="Remove Avatar"
                            description="Are you sure you want to remove your avatar?"
                            onConfirm={() => remove()}
                            okText="Remove"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true }}
                        >
                            <Button danger icon={<DeleteOutlined />} className={styles.removeBtn}>
                                Remove Avatar
                            </Button>
                        </Popconfirm>
                    </div>
                )}

                <div className={styles.cancelRow}>
                    <Button onClick={handleClose} className={styles.cancelBtn}>Cancel</Button>
                </div>
            </div>
        </Modal>
    );
};

export default AvatarModal;