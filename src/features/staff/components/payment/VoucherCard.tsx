import type { Voucher } from "@/features/booking/types/payment.types";
import { TicketPercent, Check, X } from "lucide-react";
import type { FC } from "react";

interface Props {
    voucherCode: string;
    setVoucherCode: (v: string) => void;
    appliedVoucher: string;
    availableVouchers: Voucher[];
    checkAndApplyVoucher: (code: string) => Promise<void>;
}

const VoucherCard: FC<Props> = ({
    voucherCode,
    setVoucherCode,
    appliedVoucher,
    availableVouchers,
    checkAndApplyVoucher,
}) => {

    return (

        <div className="payment-card voucher-card">

            <div className="voucher-header">

                <div className="voucher-icon">
                    <TicketPercent size={18} />
                </div>

                <div>

                    <div className="voucher-title">
                        Voucher ưu đãi
                    </div>

                    <div className="voucher-sub">
                        Giảm giá trực tiếp cho đơn hàng
                    </div>

                </div>

            </div>

            {
                appliedVoucher && (

                    <div className="voucher-success">

                        <div>

                            <div className="voucher-success-label">
                                Đã áp dụng
                            </div>

                            <div className="voucher-success-code">
                                {appliedVoucher}
                            </div>

                        </div>

                        <Check size={22} />

                    </div>

                )
            }

            <div className="voucher-input-row">

                <input

                    value={voucherCode}

                    onChange={(e) =>
                        setVoucherCode(e.target.value)
                    }

                    placeholder="Nhập mã voucher"

                />

                <button
                    onClick={() => checkAndApplyVoucher(voucherCode)}
                >
                    Áp dụng
                </button>

            </div>

            {
                availableVouchers.length > 0 && (

                    <>

                        <div className="voucher-divider" />

                        <div className="voucher-list">

                            {

                                availableVouchers.map((voucher: Voucher) => (

                                    <button

                                        key={voucher.code}

                                        className="voucher-item"

                                        onClick={() =>
                                            setVoucherCode(voucher.code)
                                        }

                                    >

                                        <div>

                                            <div className="voucher-item-code">
                                                {voucher.code}
                                            </div>

                                            <div className="voucher-item-desc">

                                                Giảm {voucher.value.toLocaleString()} đ

                                            </div>

                                        </div>

                                        <X
                                            size={16}
                                            opacity={0.5}
                                        />

                                    </button>

                                ))

                            }

                        </div>

                    </>

                )
            }

        </div>

    );

};

export default VoucherCard;