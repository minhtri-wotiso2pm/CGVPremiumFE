import { useState, useEffect, type FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCreateBooking } from "@/features/booking/hooks/useCreateBooking";
import axiosInstance from "@/services/axios/axiosInstance";
import { useInitiatePayment } from "@/features/booking/hooks/useInitiatePayment";

import { X, User } from "lucide-react";
import type { SeatNavState } from "@/features/booking/types/seat.types";

import "../../booking/components/payment.css";
import MovieInfoCard from "../components/MovieInfoCard";
import PaymentMethodCard from "../components/payment/PaymentMethodCard";
import InvoiceCard from "../components/payment/InvoiceCard";

import MemberCard from "../components/payment/MemberCard";
import VoucherCard from "../components/payment/VoucherCard";
import { createPayOS } from "@/services/api/payment.service";

interface Voucher {
    code: string;
    description: string;
    value: number;
}


interface FnBItem {
    productId?: string | number;
    productName?: string;
    quantity?: number;
}

interface MemberInfo {
    fullName: string;
    rank: string;
    points: number;
    email?: string;
    phone?: string;
}


type PaymentMethod = "cash" | "wallet" | "payos";

const CounterPaymentPage: FC = () => {
    const { state } = useLocation(); console.log(state);
    const navState = (state ?? {}) as SeatNavState & { fnbItems?: FnBItem[] };
console.log(state);

console.log(navState.bookingId);
const { mutateAsync: doCreateBooking } = useCreateBooking();
const { mutateAsync: doInitiatePayment } = useInitiatePayment();

const navigate = useNavigate();
 const {
    showtimeId,
    seatIds,

    movieTitle,
    moviePoster,
    cinemaName,
    roomName,
    startTime,

    selectedSeats = [],
    fnbItems = [],

    seatTotal = 0,
    fnbTotal = 0,
} = navState;

    const [method, setMethod] = useState<PaymentMethod>("cash");
    const [isAgreed, setIsAgreed] = useState<boolean>(false);

   
const handlePay = async () => {

    if (!showtimeId || !seatIds?.length) {
        alert("Không tìm thấy thông tin đặt vé.");
        return;
    }

    try {

        const booking = await doCreateBooking({

            customerId: null,

            showtimeId,

            seatIds,

            fnbItems: fnbItems.map(item => ({
                itemId: Number(item.productId),
                quantity: item.quantity ?? 1,
            })),

            voucherCode: appliedVoucher || null,

        });

        // ======================
        // CASH
        // ======================

        if (method === "cash") {

            await doInitiatePayment({
    bookingId: booking.bookingID,
    paymentMethod: "cash",
});

           navigate("/staff/payment-success", {
    state: {
          booking,
        paymentMethod: method,
        paymentId: null,
    },
});
            return;
        }

        // ======================
        // PAYOS
        // ======================

       const payment = await doInitiatePayment({
    bookingId: booking.bookingID,
    paymentMethod: "payos",
});

const payos = await createPayOS(
    booking.bookingID,
    "PAYOS",
);

// Lưu để khi PayOS redirect về còn biết kiểm tra payment nào
sessionStorage.setItem("paymentId", String(payment.paymentId));
sessionStorage.setItem("booking", JSON.stringify(booking));

window.location.assign(payos.data.checkoutUrl);

    } catch (err) {

        console.error(err);

        alert("Thanh toán thất bại.");

    }

};

    // ==========================================
    // STATE THÀNH VIÊN & VOUCHER LINK API
    // ==========================================
    const [showMemberModal, setShowMemberModal] = useState<boolean>(true);
    const [inputEmail, setInputEmail] = useState<string>("");
    const [inputPhone, setInputPhone] = useState<string>("");
    const [isSearchingMember, setIsSearchingMember] = useState<boolean>(false);

    const [member, setMember] = useState<MemberInfo | null>(null);
    const [voucherCode, setVoucherCode] = useState<string>("");
    const [discountAmount, setDiscountAmount] = useState<number>(0);
    const [appliedVoucher, setAppliedVoucher] = useState<string>("");
    const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);

    // Hãy đảm bảo bạn đã import axiosInstance ở đầu file:
    // import axiosInstance from "@/api/axiosInstance"; 
    const handleLookupMember = async () => {
        if (!inputEmail && !inputPhone) {
            alert("Vui lòng nhập Email hoặc Số điện thoại để tìm kiếm!");
            return;
        }

        setIsSearchingMember(true);

        const searchParams: Record<string, string> = {};
        if (inputEmail) searchParams.email = inputEmail.trim();
        if (inputPhone) searchParams.phone = inputPhone.trim();

        // Gọi API qua axiosInstance, tự động ném lỗi ra ngoài nếu status >= 400
        const response = await axiosInstance.get("/users/lookup", {
            params: searchParams
        });

        const data = response.data;

        setMember({
            fullName: data.fullName ?? data.name ?? "Khách hàng thành viên",
            rank: data.rank ?? "MEMBER",
            points: data.points ?? 0
        });
        setShowMemberModal(false);
        setIsSearchingMember(false);
    };
    useEffect(() => {
        if (member) {
            const fetchUserVouchers = async () => {
                try {
                    // Thay fetch bằng axiosInstance để tự động kèm Token
                    const response = await axiosInstance.get("/vouchers/available");
                    setAvailableVouchers(response.data);
                } catch (error) {
                    console.error("Lỗi lấy danh sách voucher:", error);
                }
            };
            fetchUserVouchers();
        }
    }, [member]);
    

    const checkAndApplyVoucher = async (code: string) => {
        if (appliedVoucher === code) {
            setAppliedVoucher("");
            setDiscountAmount(0);
            return;
        }
        try {
            // Thay thế fetch POST bằng axiosInstance.post
            const response = await axiosInstance.post(`/vouchers/verify`,
                { totalAmount: seatTotal + fnbTotal }, // Body request
                { params: { code } } // Query parameter (?code=...)
            );

            const result = response.data;
            if (result.valid) {
                setAppliedVoucher(code);
                setVoucherCode(code);
                setDiscountAmount(result.value);
            } else {
                alert(result.message ?? "Mã không hợp lệ!");
            }
        } catch (error) {
            console.error("Lỗi check voucher:", error);
            alert("Không thể xác thực mã giảm giá vào lúc này.");
        }
    };

    // Đã thay đổi kiểu dữ liệu tích lũy rõ ràng, loại bỏ hoàn toàn any
    const totalFnBQuantity = fnbItems.reduce((acc: number, item: FnBItem) => {
        const itemQty = item.quantity ?? 1;
        return acc + itemQty;
    }, 0);

    const subTotal = seatTotal + fnbTotal;
    const finalTotal = Math.max(0, subTotal - discountAmount);

    return (
       <div className="payment-page">

    
             {/* MODAL HỎI THÀNH VIÊN KHI VÀO TRANG */}
            {showMemberModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                    backgroundColor: "rgba(0,0,0,0.85)", zIndex: 9999,
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <div style={{
                        background: "#151518", width: "100%", maxWidth: 480,
                        borderRadius: 16, padding: 32, border: "1px solid #222", position: "relative"
                    }}>
                        <button
                            onClick={() => setShowMemberModal(false)}
                            style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#666" }}
                        >
                            <X size={20} />
                        </button>

                        <div style={{ textAlign: "center", marginBottom: 24 }}>
                            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,30,39,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                                <User size={28} color="#ff1e27" />
                            </div>
                            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Bạn có thẻ thành viên không?</h2>
                            <p style={{ fontSize: 13, color: "#777" }}>Nhập thông tin tra cứu để nhận ưu đãi giảm giá và tích lũy điểm thưởng.</p>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                            <div>
                                <label style={{ fontSize: 12, color: "#aaa", display: "block", marginBottom: 6 }}>Email tài khoản</label>
                                <input
                                    type="text" placeholder="Nhập email..." value={inputEmail}
                                    onChange={(e) => setInputEmail(e.target.value)}
                                    style={{ width: "100%", background: "#1c1c21", border: "1px solid #333", borderRadius: 8, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none" }}
                                />
                            </div>
                            <div style={{ textAlign: "center", color: "#444", fontSize: 12, fontWeight: 600 }}>- HOẶC -</div>
                            <div>
                                <label style={{ fontSize: 12, color: "#aaa", display: "block", marginBottom: 6 }}>Số điện thoại</label>
                                <input
                                    type="text" placeholder="Nhập số điện thoại..." value={inputPhone}
                                    onChange={(e) => setInputPhone(e.target.value)}
                                    style={{ width: "100%", background: "#1c1c21", border: "1px solid #333", borderRadius: 8, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none" }}
                                />
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <button
                                onClick={() => setShowMemberModal(false)}
                                style={{ background: "#222", color: "#aaa", border: "none", padding: "14px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 }}
                            >
                                Không, tiếp tục
                            </button>
                            <button
                                onClick={handleLookupMember}
                                disabled={isSearchingMember}
                                style={{ background: "linear-gradient(90deg, #ff1e27, #d6000b)", color: "#fff", border: "none", padding: "14px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 }}
                            >
                                {isSearchingMember ? "Đang kiểm tra..." : "Xác nhận mẫu"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

     <div className="payment-page">

    <div className="payment-header">

        <div>

            <h1 className="payment-page-title">
                Xác nhận thanh toán
            </h1>

            <p className="payment-page-subtitle">
                Kiểm tra thông tin trước khi hoàn tất giao dịch
            </p>

        </div>

    </div>

    <div className="payment-layout">

        {/* ================= LEFT ================= */}

        <section className="payment-left">

            {/* Movie */}

            <MovieInfoCard
                movieTitle={movieTitle}
                moviePoster={moviePoster}
                cinemaName={cinemaName}
                roomName={roomName}
                startTime={startTime}
                selectedSeats={selectedSeats}
                fnbItems={fnbItems}
            />

            {/* Member + Voucher */}

            {member && (

                <div className="payment-row">

                    <div className="payment-col">

                        <MemberCard
                            member={member}
                        />

                    </div>

                    <div className="payment-col">

                        <VoucherCard
                            voucherCode={voucherCode}
                            setVoucherCode={setVoucherCode}
                            appliedVoucher={appliedVoucher}
                            availableVouchers={availableVouchers}
                            checkAndApplyVoucher={checkAndApplyVoucher}
                        />

                    </div>

                </div>

            )}

            {/* Payment */}

            <PaymentMethodCard
                method={method}
                setMethod={setMethod}
            />

        </section>

        {/* ================= RIGHT ================= */}

        <aside className="payment-right">

            <div className="payment-sticky">

                <InvoiceCard
    seatCount={selectedSeats.length}
    fnbCount={totalFnBQuantity}
    seatTotal={seatTotal}
    fnbTotal={fnbTotal}
    discountAmount={discountAmount}
    appliedVoucher={appliedVoucher}
    finalTotal={finalTotal}
    isAgreed={isAgreed}
    setIsAgreed={setIsAgreed}
    onPay={handlePay}
/>

            </div>

        </aside>

    </div>

</div>
    </div>
            );
                    
};

export default CounterPaymentPage;  