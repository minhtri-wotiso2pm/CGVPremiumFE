import { useState, useRef, type FC, type ChangeEvent } from "react";
import { Modal, Form, Input, Button } from "antd";
import { useAppSelector } from "@/store/hooks";
import { useProfile } from "@/features/customer/hooks/useProfile";
import { useUpdateProfile } from "@/features/customer/hooks/useUpdateProfile";
import { useUploadAvatar } from "@/features/customer/hooks/useUploadAvatar";
import { useDeleteAvatar } from "@/features/customer/hooks/useDeleteAvatar";
import ChangeOwnPasswordModal from "../components/ChangeOwnPasswordModal";
import {
    formatMemberSince,
    capitalize,
} from "@/features/customer/utils/profile.mapper";

const MapPinIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

/* ── Icons ── */
const EditIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);
const CameraIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
    </svg>
);
const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
    </svg>
);
const LockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
);

/* ── Profile Field Row ── */
const Field = ({ label, value }: { label: string; value?: string | null }) => (
    <div style={{ display: "flex", gap: 16, padding: "13px 0", borderBottom: "1px solid rgba(0,0,0,0.06)", alignItems: "flex-start" }}>
        <span style={{ width: 140, fontSize: 12.5, fontWeight: 600, color: "var(--dash-text-3)", textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0, paddingTop: 1 }}>
            {label}
        </span>
        <span style={{ fontSize: 14, color: "var(--dash-text-1)", fontWeight: 500 }}>
            {value || <span style={{ color: "var(--dash-text-3)" }}>—</span>}
        </span>
    </div>
);

const roleLabel: Record<string, string> = {
    ADMIN: "Administrator", MANAGER: "Manager", STAFF: "Staff", CUSTOMER: "Customer",
};

const AdminProfilePage: FC = () => {
    const user = useAppSelector((state) => state.auth.user);
    const { data: profile } = useProfile();
    const fileRef = useRef<HTMLInputElement>(null);

    const [editOpen, setEditOpen] = useState(false);
    const [changePwOpen, setChangePwOpen] = useState(false);
    const [form] = Form.useForm();

    const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile(() => setEditOpen(false));
    const { mutate: uploadAvatar, isPending: isUploading } = useUploadAvatar();
    const { mutate: deleteAvatar, isPending: isDeleting } = useDeleteAvatar();

    const initials = (user?.fullName ?? "A")
        .split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

    const handleEditOpen = () => {
        form.setFieldsValue({ fullName: user?.fullName, phone: user?.phone });
        setEditOpen(true);
    };

    const handleEditSubmit = (values: { fullName: string; phone: string }) => {
        updateProfile(values);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        uploadAvatar(file);
        e.target.value = "";
    };


    return (
        <div className="dash-fade-in">
            {/* Page title */}
            <div className="dash-page-header">
                <div>
                    <h1 className="dash-page-title">My Profile</h1>
                    <p className="dash-page-sub">Manage your account information</p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "start" }}>
                {/* ── Left: Avatar card ── */}
                <div className="dash-card">
                    <div style={{ padding: "32px 24px", textAlign: "center" }}>
                        {/* Avatar */}
                        <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
                            {user?.avatarURL ? (
                                <img
                                    src={user.avatarURL}
                                    alt={user.fullName}
                                    style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(0,0,0,0.08)" }}
                                />
                            ) : (
                                <div style={{
                                    width: 96, height: 96, borderRadius: "50%",
                                    background: "linear-gradient(135deg, #E8001C, #B50016)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 28, fontWeight: 700, color: "#fff",
                                    border: "3px solid rgba(0,0,0,0.08)",
                                }}>
                                    {initials}
                                </div>
                            )}
                        </div>

                        <div style={{ fontWeight: 700, fontSize: 15, color: "var(--dash-text-1)", marginBottom: 4 }}>
                            {user?.fullName}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--dash-crimson)", marginBottom: 20 }}>
                            {roleLabel[user?.role ?? ""] ?? user?.role}
                        </div>

                        {/* Avatar actions */}
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                        />
                        <Button
                            icon={<CameraIcon />}
                            onClick={() => fileRef.current?.click()}
                            loading={isUploading}
                            block
                            style={{ marginBottom: 8 }}
                        >
                            {user?.avatarURL ? "Change Avatar" : "Upload Avatar"}
                        </Button>
                        {user?.avatarURL && (
                            <Button
                                icon={<TrashIcon />}
                                onClick={() => deleteAvatar()}
                                loading={isDeleting}
                                danger
                                block
                            >
                                Remove Avatar
                            </Button>
                        )}
                    </div>
                </div>

                {/* ── Right: Info card ── */}
                <div className="dash-card">
                    <div style={{ padding: "24px 28px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--dash-text-1)" }}>
                                Account Information
                            </h2>
                            <div style={{ display: "flex", gap: 8 }}>
                                <Button
                                    icon={<LockIcon />}
                                    onClick={() => setChangePwOpen(true)}
                                >
                                    Đổi mật khẩu
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<EditIcon />}
                                    onClick={handleEditOpen}
                                    style={{ background: "#E8001C", borderColor: "#E8001C" }}
                                >
                                    Edit Profile
                                </Button>
                            </div>
                        </div>

                        <div style={{ marginTop: 16 }}>
                            <Field label="Full Name" value={user?.fullName} />
                            <Field label="Email" value={user?.email} />
                            <Field label="Phone" value={user?.phone} />
                            <Field label="Role" value={roleLabel[user?.role ?? ""] ?? user?.role} />
                            <Field label="Status" value={capitalize(profile ? capitalize(profile.status) : "—")} />
                            <Field label="Member Since" value={formatMemberSince(profile
                                ? formatMemberSince(profile.createdAt)
                                : "—")} />
                        </div>

                        {user?.cinema && (
                            <div style={{ marginTop: 28 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                                    <span style={{ color: "var(--dash-crimson)" }}><MapPinIcon /></span>
                                    <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--dash-text-1)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                        Cinema đang quản lý
                                    </h3>
                                </div>
                                <div style={{ marginTop: 8, padding: "16px 20px", borderRadius: 10, background: "rgba(232,0,28,0.04)", border: "1px solid rgba(232,0,28,0.12)" }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--dash-text-1)", marginBottom: 6 }}>
                                        {user.cinema.cinemaName}
                                    </div>
                                    <div style={{ fontSize: 13, color: "var(--dash-text-2)", marginBottom: 4 }}>
                                        {user.cinema.address}
                                    </div>
                                    <span style={{
                                        display: "inline-block",
                                        fontSize: 11, fontWeight: 700,
                                        padding: "2px 10px", borderRadius: 20,
                                        background: user.cinema.status?.toUpperCase() === "ACTIVE"
                                            ? "rgba(34,197,94,0.1)" : "rgba(0,0,0,0.06)",
                                        border: `1px solid ${user.cinema.status?.toUpperCase() === "ACTIVE"
                                            ? "rgba(34,197,94,0.25)" : "rgba(0,0,0,0.1)"}`,
                                        color: user.cinema.status?.toUpperCase() === "ACTIVE" ? "#16a34a" : "var(--dash-text-3)",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.06em",
                                    }}>
                                        {user.cinema.status?.toUpperCase() === "ACTIVE" ? "Đang hoạt động" : user.cinema.status}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            <ChangeOwnPasswordModal open={changePwOpen} onClose={() => setChangePwOpen(false)} />

            {/* Edit Modal */}
            <Modal
                title="Edit Profile"
                open={editOpen}
                onCancel={() => setEditOpen(false)}
                footer={null}
                width={420}
                maskClosable={false}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleEditSubmit} style={{ marginTop: 16 }}>
                    <Form.Item
                        name="fullName"
                        label="Full Name"
                        rules={[
                            { required: true, message: "Full name is required" },
                            { min: 2, max: 100, message: "2–100 characters" },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="Phone"
                        rules={[
                            { required: true, message: "Phone is required" },
                            { pattern: /^\+?[0-9]{7,15}$/, message: "Enter a valid phone number" },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                        <Button onClick={() => setEditOpen(false)} disabled={isUpdating}>Cancel</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isUpdating}
                            style={{ background: "#E8001C", borderColor: "#E8001C" }}
                        >
                            Save Changes
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminProfilePage;
