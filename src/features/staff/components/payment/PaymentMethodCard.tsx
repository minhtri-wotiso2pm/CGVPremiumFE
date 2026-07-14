import {
    
    Wallet,
    
    CheckCircle2,

    CreditCard,
} from "lucide-react";
import type { FC } from "react";


type PaymentMethod = "cash" | "wallet" | "payos";


interface Props {
    method: PaymentMethod;

    setMethod: React.Dispatch<
        React.SetStateAction<PaymentMethod>
    >;
}



const methods: {
    value: PaymentMethod;
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}[] = [
    {
        value:"cash",
        label:"Tiền mặt",
        icon: Wallet
    },
    {
        value:"wallet",
        label:"Ví",
        icon: Wallet
    },
    {
        value:"payos",
        label:"PayOS",
        icon: CreditCard
    }
];

const PaymentMethodCard: FC<Props> = ({
    method,
    setMethod,
}) => {

    return (

        <div className="payment-card">

            <h2 className="card-title">
                Phương thức thanh toán
            </h2>

            <p className="card-subtitle">
                Chọn phương thức phù hợp
            </p>

            <div className="payment-method-list">

                {methods.map((item) => {

                    const Icon = item.icon;

                    const active =
                        method === item.value;

                    return (

                        <div
                            key={item.value}
                            className={`payment-method-card ${
                                active ? "active" : ""
                            }`}
                            onClick={() =>
                                setMethod(item.value)
                            }
                        >

                            <div className="payment-method-left">

                                <div className="payment-method-icon">

                                    <Icon />

                                </div>

                                <div>

                                    <h4>{item.label}</h4>

                                    <p>{item.label}</p>

                                </div>

                            </div>

                            <CheckCircle2
                                size={22}
                                className="method-check"
                            />

                        </div>

                    );
                })}

            </div>

        </div>

    );
};

export default PaymentMethodCard;