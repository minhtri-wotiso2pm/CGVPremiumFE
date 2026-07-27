/**
 * ProfilePage.tsx
 * Displays user profile card with edit + avatar modals.
 * Business logic lives in hooks; this component is view-only.
 */

import { useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { Result, Button } from "antd";
import { useProfile } from "../hooks/useProfile";
import ProfileCard from "../components/ProfileCard";
import EditProfileModal from "../components/EditProfileModal";
import AvatarModal from "../components/AvatarModal";
import ChangePasswordModal from "../components/ChangePasswordModal";

const ProfilePage: FC = () => {
    const { t } = useTranslation("profile");
    const { data: profile, isLoading, isError, refetch } = useProfile();

    const [editOpen, setEditOpen] = useState(false);
    const [avatarOpen, setAvatarOpen] = useState(false);
    const [changePwOpen, setChangePwOpen] = useState(false);

    if (isError) {
        return (
            <Result
                status="error"
                title={t("page.loadErrorTitle")}
                subTitle={t("page.loadErrorSubtitle")}
                extra={
                    <Button onClick={() => refetch()} type="primary" danger>
                        {t("common:actions.tryAgain")}
                    </Button>
                }
                style={{ background: "rgba(16,4,4,0.96)", borderRadius: 14, padding: "48px 24px" }}
            />
        );
    }

    return (
        <>
            <ProfileCard
                profile={profile}
                loading={isLoading}
                onEdit={() => setEditOpen(true)}
                onAvatar={() => setAvatarOpen(true)}
                onChangePassword={() => setChangePwOpen(true)}
            />

            {profile && (
                <>
                    <EditProfileModal
                        open={editOpen}
                        profile={profile}
                        onClose={() => setEditOpen(false)}
                    />
                    <AvatarModal
                        open={avatarOpen}
                        profile={profile}
                        onClose={() => setAvatarOpen(false)}
                    />
                </>
            )}

            <ChangePasswordModal
                open={changePwOpen}
                onClose={() => setChangePwOpen(false)}
            />
        </>
    );
};

export default ProfilePage;