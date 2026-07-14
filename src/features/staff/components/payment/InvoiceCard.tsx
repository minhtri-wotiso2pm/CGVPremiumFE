import { Receipt, Ticket, Popcorn, BadgePercent } from "lucide-react";
import type { FC } from "react";

interface Props {

    seatCount:number;

    fnbCount:number;

    seatTotal:number;

    fnbTotal:number;

    discountAmount:number;

    appliedVoucher:string;

    finalTotal:number;

    isAgreed:boolean;

    setIsAgreed:(v:boolean)=>void;

    onPay:()=>void;

}

const InvoiceCard:FC<Props>=({

    seatCount,

    fnbCount,

    seatTotal,

    fnbTotal,

    discountAmount,

    appliedVoucher,

    finalTotal,

    isAgreed,

    setIsAgreed,

    onPay

})=>{

    return(

        <div className="invoice-card">

            <div className="invoice-header">

                <Receipt size={26}/>

                <div>

                    <h2>Chi tiết hóa đơn</h2>

                    <p>Kiểm tra lần cuối trước khi thanh toán</p>

                </div>

            </div>

            <div className="invoice-list">

                <div className="invoice-row">

                    <div>

                        <Ticket size={16}/>

                        Vé xem phim ({seatCount})

                    </div>

                    <b>{seatTotal.toLocaleString()} đ</b>

                </div>

                <div className="invoice-row">

                    <div>

                        <Popcorn size={16}/>

                        Combo ({fnbCount})

                    </div>

                    <b>{fnbTotal.toLocaleString()} đ</b>

                </div>

                {

                    appliedVoucher && (

                        <div className="invoice-row discount">

                            <div>

                                <BadgePercent size={16}/>

                                Voucher

                            </div>

                            <b>

                                -{discountAmount.toLocaleString()} đ

                            </b>

                        </div>

                    )

                }

            </div>

            <div className="invoice-divider"/>

            <div className="invoice-total">

                <span>Tổng thanh toán</span>

                <h1>

                    {finalTotal.toLocaleString()} đ

                </h1>

            </div>

            <label className="invoice-check">

                <input

                    type="checkbox"

                    checked={isAgreed}

                    onChange={(e)=>

                        setIsAgreed(e.target.checked)

                    }

                />

                <span>

                    Tôi đồng ý với điều khoản mua vé CGV Premium

                </span>

            </label>

            <button

                className="checkout-btn"

                disabled={!isAgreed}

                onClick={onPay}

            >

                Thanh toán ngay

            </button>

        </div>

    );

};

export default InvoiceCard;