/**
 * ProfilePage.tsx
 * Displays user profile card with edit + avatar modals.
 * Business logic lives in hooks; this component is view-only.
 */

import { useState, type FC } from "react";
import { Result, Button } from "antd";
import { useProfile } from "../hooks/useProfile";
import ProfileCard from "../components/ProfileCard";
import EditProfileModal from "../components/EditProfileModal";
import AvatarModal from "../components/AvatarModal";

const ProfilePage: FC = () => {
    const { data: profile, isLoading, isError, refetch } = useProfile();

    const [editOpen, setEditOpen] = useState(false);
    const [avatarOpen, setAvatarOpen] = useState(false);

    if (isError) {
        return (
            <Result
                status="error"
                title="Unable to load profile"
                subTitle="Something went wrong while fetching your profile information."
                extra={
                    <Button onClick={() => refetch()} type="primary" danger>
                        Try Again
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
        </>
    );
};

export default ProfilePage;