import { useState, useCallback, useEffect, type FC } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Upload, Button, Popconfirm } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import type { ProfileResponse } from "../types/profile.type";
import { buildInitialsAvatar } from "../utils/profile.mapper";
import { useUploadAvatar } from "../hooks/useUploadAvatar";
import { useDeleteAvatar } from "../hooks/useDeleteAvatar";
import { notify } from "@/utils/notify";
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
    const { t } = useTranslation("profile");
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [cropPixels, setCropPixels] = useState<Area | null>(null);
    const [cropping, setCropping] = useState(false);

    const { mutate: upload, isPending: uploading } = useUploadAvatar(onClose);
    const { mutate: remove, isPending: removing } = useDeleteAvatar(onClose);

    const isBusy = uploading || removing || cropping;

    useEffect(() => {
        if (!open) {
            setImageSrc(null);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
        }
    }, [open]);

    const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
        setCropPixels(croppedAreaPixels);
    }, []);

    const handleFileSelect = (file: File) => {
        if (!AVATAR_ACCEPT_TYPES.includes(file.type)) {
            notify.error(t("avatarModal.invalidType"), t("avatarModal.invalidTypeDesc"));
            return false;
        }
        if (file.size > AVATAR_MAX_SIZE_MB * 1024 * 1024) {
            notify.error(t("avatarModal.tooLarge"), t("avatarModal.tooLargeDesc", { size: AVATAR_MAX_SIZE_MB }));
            return false;
        }
        const reader = new FileReader();
        reader.onload = () => setImageSrc(reader.result as string);
        reader.readAsDataURL(file);
        return false;
    };

    const handleSave = async () => {
        if (!imageSrc || !cropPixels) return;
        setCropping(true);
        try {
            const blob = await getCroppedBlob(imageSrc, cropPixels);
            const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
            upload(file);
        } catch {
            notify.error(t("avatarModal.cropFailed"), t("avatarModal.cropFailedDesc"));
        } finally {
            setCropping(false);
        }
    };

    const handleClose = () => {
        if (isBusy) return;
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
            title={<span className={styles.title}>{t("card.changeAvatar")}</span>}
            footer={null}
            width={420}
            destroyOnClose
            closable={!isBusy}
            maskClosable={!isBusy}
            styles={{
                container: { background: "#0d0303", border: "1px solid rgba(255,255,255,0.07)" },
                header: { background: "#0d0303", borderBottom: "1px solid rgba(255,255,255,0.06)" },
                mask: { backdropFilter: "blur(6px)" },
            }}
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
                        <img src={currentAvatar} alt={t("avatarModal.currentAlt")} className={styles.previewImg} />
                        <p className={styles.previewHint}>{t("avatarModal.uploadHint")}</p>
                    </div>
                )}

                {/* ── Zoom slider (only when image selected) ── */}
                {imageSrc && (
                    <div className={styles.sliderRow}>
                        <span className={styles.sliderLabel}>{t("avatarModal.zoom")}</span>
                        <input
                            type="range" min={1} max={3} step={0.01}
                            value={zoom} onChange={(e) => setZoom(Number(e.target.value))}
                            className={styles.slider}
                            aria-label={t("avatarModal.zoom")}
                            disabled={isBusy}
                        />
                    </div>
                )}

                {/* ── Actions ── */}
                <div className={styles.actions}>
                    <Upload beforeUpload={handleFileSelect} showUploadList={false} accept=".jpg,.jpeg,.png,.webp" disabled={isBusy}>
                        <Button icon={<UploadOutlined />} className={styles.uploadBtn} disabled={isBusy}>
                            {imageSrc ? t("avatarModal.chooseDifferent") : t("avatarModal.uploadPhoto")}
                        </Button>
                    </Upload>

                    {imageSrc && (
                        <Button
                            type="primary"
                            onClick={handleSave}
                            loading={uploading || cropping}
                            disabled={isBusy}
                            className={styles.saveBtn}
                        >
                            {t("avatarModal.saveAvatar")}
                        </Button>
                    )}
                </div>

                {/* ── Remove avatar ── */}
                {!imageSrc && profile.avatarURL && (
                    <div className={styles.removeRow}>
                        <Popconfirm
                            title={<span style={{ color: "#f0e8e8", fontWeight: 600 }}>{t("avatarModal.removeAvatar")}</span>}
                            description={<span style={{ color: "#9a7070" }}>{t("avatarModal.removeConfirm")}</span>}
                            onConfirm={() => remove()}
                            okText={t("avatarModal.remove")}
                            cancelText={t("common:actions.cancel")}
                            okButtonProps={{ danger: true, loading: removing }}
                            cancelButtonProps={{ style: { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "#9a7070" } }}
                            disabled={isBusy}
                            overlayInnerStyle={{ background: "#1a0f0f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }}
                        >
                            <Button danger icon={<DeleteOutlined />} className={styles.removeBtn} loading={removing} disabled={isBusy}>
                                {t("avatarModal.removeAvatar")}
                            </Button>
                        </Popconfirm>
                    </div>
                )}

                <div className={styles.cancelRow}>
                    <Button onClick={handleClose} className={styles.cancelBtn} disabled={isBusy}>{t("common:actions.cancel")}</Button>
                </div>
            </div>
        </Modal>
    );
};

export default AvatarModal;
