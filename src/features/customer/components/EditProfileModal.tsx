import { useEffect, useMemo, type FC } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Form, Input, Button } from "antd";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import type { ProfileResponse } from "../types/profile.type";
import { makeUpdateProfileSchema, type UpdateProfileFormValues } from "../schemas/profile.schema";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import styles from "./EditProfileModal.module.css";

interface Props {
    open: boolean;
    profile: ProfileResponse;
    onClose: () => void;
}

const EditProfileModal: FC<Props> = ({ open, profile, onClose }) => {
    const { t } = useTranslation("profile");
    const { mutate, isPending } = useUpdateProfile(onClose);

    const resolver = useMemo(() => zodResolver(makeUpdateProfileSchema(t)), [t]);

    const { control, handleSubmit, reset, formState: { errors } } =
        useForm<UpdateProfileFormValues>({
            resolver,
            defaultValues: { fullName: profile.fullName, phone: profile.phone ?? "" },
        });

    useEffect(() => {
        if (open) reset({ fullName: profile.fullName, phone: profile.phone ?? "" });
    }, [open, profile, reset]);

    const onSubmit = (values: UpdateProfileFormValues) => mutate(values);

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={<span className={styles.title}>{t("card.editProfile")}</span>}
            footer={null}
            destroyOnClose
            styles={{
                container: { background: '#1a0f0f', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' },
                header: { background: '#1a0f0f', borderBottom: '1px solid rgba(255,255,255,0.06)' },
                mask: { backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.7)' },
            }}
        >
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
                {/* Read-only email */}
                <Form.Item label={<span className={styles.label}>{t("card.email")}</span>} className={styles.item}>
                    <Input value={profile.email} readOnly className={styles.inputReadonly} />
                </Form.Item>

                {/* Read-only role */}
                <Form.Item label={<span className={styles.label}>{t("editModal.role")}</span>} className={styles.item}>
                    <Input value={profile.role} readOnly className={styles.inputReadonly} />
                </Form.Item>

                {/* Full Name */}
                <Form.Item
                    label={<span className={styles.label}>{t("editModal.fullName")}</span>}
                    validateStatus={errors.fullName ? "error" : ""}
                    help={errors.fullName?.message}
                    className={styles.item}
                    required
                >
                    <Controller
                        name="fullName"
                        control={control}
                        render={({ field }) => <Input {...field} className={styles.input} placeholder={t("editModal.fullNamePlaceholder")} />}
                    />
                </Form.Item>

                {/* Phone */}
                <Form.Item
                    label={<span className={styles.label}>{t("card.phone")}</span>}
                    validateStatus={errors.phone ? "error" : ""}
                    help={errors.phone?.message}
                    className={styles.item}
                    required
                >
                    <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => <Input {...field} className={styles.input} placeholder={t("editModal.phonePlaceholder")} maxLength={10} />}
                    />
                </Form.Item>

                <div className={styles.footer}>
                    <Button onClick={onClose} className={styles.cancelBtn} disabled={isPending}>{t("common:actions.cancel")}</Button>
                    <Button htmlType="submit" loading={isPending} className={styles.saveBtn} type="primary">{t("editModal.saveChanges")}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditProfileModal;
