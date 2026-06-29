import { useEffect, type FC } from "react";
import { Modal, Form, Input, Button } from "antd";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import type { ProfileResponse } from "../types/profile.type";
import { updateProfileSchema, type UpdateProfileFormValues } from "../schemas/profile.schema";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import styles from "./EditProfileModal.module.css";

interface Props {
    open: boolean;
    profile: ProfileResponse;
    onClose: () => void;
}

const EditProfileModal: FC<Props> = ({ open, profile, onClose }) => {
    const { mutate, isPending } = useUpdateProfile(onClose);

    const { control, handleSubmit, reset, formState: { errors } } =
        useForm<UpdateProfileFormValues>({
            resolver: zodResolver(updateProfileSchema),
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
            title={<span className={styles.title}>Edit Profile</span>}
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
                <Form.Item label={<span className={styles.label}>Email</span>} className={styles.item}>
                    <Input value={profile.email} readOnly className={styles.inputReadonly} />
                </Form.Item>

                {/* Read-only role */}
                <Form.Item label={<span className={styles.label}>Role</span>} className={styles.item}>
                    <Input value={profile.role} readOnly className={styles.inputReadonly} />
                </Form.Item>

                {/* Full Name */}
                <Form.Item
                    label={<span className={styles.label}>Full Name</span>}
                    validateStatus={errors.fullName ? "error" : ""}
                    help={errors.fullName?.message}
                    className={styles.item}
                    required
                >
                    <Controller
                        name="fullName"
                        control={control}
                        render={({ field }) => <Input {...field} className={styles.input} placeholder="Enter your full name" />}
                    />
                </Form.Item>

                {/* Phone */}
                <Form.Item
                    label={<span className={styles.label}>Phone</span>}
                    validateStatus={errors.phone ? "error" : ""}
                    help={errors.phone?.message}
                    className={styles.item}
                    required
                >
                    <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => <Input {...field} className={styles.input} placeholder="e.g. 0912345678" maxLength={10} />}
                    />
                </Form.Item>

                <div className={styles.footer}>
                    <Button onClick={onClose} className={styles.cancelBtn} disabled={isPending}>Cancel</Button>
                    <Button htmlType="submit" loading={isPending} className={styles.saveBtn} type="primary">Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditProfileModal;