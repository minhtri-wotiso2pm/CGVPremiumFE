import type { FC } from "react";
import type { Product } from "../types/fnb.types";
import { formatPrice } from "../utils/seat.utils";

const TYPE_EMOJI: Record<string, string> = {
    combo: "🍿",
    snack: "🍔",
    food:  "🌮",
    drink: "🥤",
    beverage: "🧃",
};

const TYPE_LABEL: Record<string, string> = {
    combo:    "Combo",
    snack:    "Snack",
    food:     "Đồ ăn",
    drink:    "Đồ uống",
    beverage: "Đồ uống",
};

interface Props {
    product: Product;
    quantity: number;
    onAdd: () => void;
    onRemove: () => void;
}

const FnbProductCard: FC<Props> = ({ product, quantity, onAdd, onRemove }) => {
    const type  = (product.itemType ?? "").toLowerCase();
    const emoji = TYPE_EMOJI[type] ?? "🎬";
    const label = TYPE_LABEL[type] ?? product.itemType;
    const isSelected = quantity > 0;
    const maxReached = product.stockQuantity > 0 && quantity >= product.stockQuantity;

    return (
        <div className={`cgv-fnb-card${isSelected ? " cgv-fnb-card--selected" : ""}`}>
            {product.imageURL ? (
                <img
                    src={product.imageURL}
                    alt={product.itemName}
                    className="cgv-fnb-card__img"
                    loading="lazy"
                />
            ) : (
                <div className="cgv-fnb-card__placeholder" aria-hidden="true">
                    {emoji}
                </div>
            )}

            <div className="cgv-fnb-card__body">
                <span className="cgv-fnb-card__type">{label}</span>
                <p className="cgv-fnb-card__name">{product.itemName}</p>
                {product.description && (
                    <p className="cgv-fnb-card__desc">{product.description}</p>
                )}
                <div className="cgv-fnb-card__footer">
                    <span className="cgv-fnb-card__price">{formatPrice(product.price)}</span>
                    <div className="cgv-fnb-qty">
                        <button
                            className="cgv-fnb-qty__btn"
                            onClick={onRemove}
                            disabled={quantity === 0}
                            aria-label={`Giảm ${product.itemName}`}
                        >
                            −
                        </button>
                        <span className="cgv-fnb-qty__count">{quantity}</span>
                        <button
                            className="cgv-fnb-qty__btn cgv-fnb-qty__btn--add"
                            onClick={onAdd}
                            disabled={maxReached}
                            aria-label={`Thêm ${product.itemName}`}
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FnbProductCard;
