import type { FC } from "react";
import { Crown, Ticket } from "lucide-react";

import MemberCard from "./MemberCard";
import VoucherCard from "./VoucherCard";
import type { MemberInfo } from "@/features/booking/types/payment.types";



interface Props {
    member: MemberInfo | null;

    voucherCode: string;
    setVoucherCode: (value: string) => void;

    appliedVoucher: string;

    availableVouchers: {
        code: string;
        description: string;
        value: number;
    }[];

    checkAndApplyVoucher: (code: string) => void;
}

const BenefitCard: FC<Props> = ({
    member,
    voucherCode,
    setVoucherCode,
    appliedVoucher,
    availableVouchers,
    checkAndApplyVoucher,
}) => {
    return (
        <div className="benefit-card">

            <h3 className="benefit-title">
                Ưu đãi & Thành viên
            </h3>

            {/* ===== MEMBER ===== */}
            <div className="benefit-section">

                <div className="benefit-section-title">
                    <Crown size={18} />
                    <span>CGV Premium Member</span>
                </div>

                {member ? (
                    <MemberCard member={member} />
                ) : (
                    <div className="benefit-empty">
                        Khách hàng chưa có tài khoản thành viên.
                    </div>
                )}

            </div>

            <div className="benefit-divider" />

            {/* ===== VOUCHER ===== */}
            <div className="benefit-section">

                <div className="benefit-section-title">
                    <Ticket size={18} />
                    <span>Voucher</span>
                </div>

                <VoucherCard
                    voucherCode={voucherCode}
                    setVoucherCode={setVoucherCode}
                    appliedVoucher={appliedVoucher}
                    availableVouchers={availableVouchers}
                    checkAndApplyVoucher={checkAndApplyVoucher}
                />

            </div>

        </div>
    );
};

export default BenefitCard;