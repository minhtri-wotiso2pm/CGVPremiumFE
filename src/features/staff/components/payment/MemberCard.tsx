import { Crown, Star } from "lucide-react";
import type { FC } from "react";

interface MemberInfo {
    fullName: string;
    rank: string;
    points: number;
}

interface Props {
    member: MemberInfo;
}

const MemberCard: FC<Props> = ({ member }) => {

    return (

        <div className="payment-card member-card">

            <div className="member-header">

                <div className="member-icon">
                    <Crown size={20}/>
                </div>

                <div>

                    <div className="member-small">
                        CGV PREMIUM
                    </div>

                    <div className="member-title">
                        Premium Member
                    </div>

                </div>

            </div>

            <div className="member-credit-card">

                <div className="member-credit-top">

                    <div>

                        <div className="member-label">
                            Card Holder
                        </div>

                        <div className="member-name">
                            {member.fullName}
                        </div>

                    </div>

                    <div className="member-rank">

                        <Star
                            size={14}
                            fill="currentColor"
                        />

                        {member.rank}

                    </div>

                </div>

                <div className="member-credit-bottom">

                    <div>

                        <div className="member-label">
                            Reward
                        </div>

                        <div className="member-point">
                            {member.points.toLocaleString()}
                        </div>

                    </div>

                    <div className="member-chip"/>

                </div>

            </div>

        </div>

    );

};

export default MemberCard;