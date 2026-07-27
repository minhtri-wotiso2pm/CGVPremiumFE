import type { FC } from "react";
import { useTranslation } from "react-i18next";
import type { Product } from "../types/fnb.types";
import { formatPrice } from "../utils/seat.utils";
import { FnbBagIcon, BurgerIcon, MealIcon, DrinkCupIcon, JuiceBoxIcon } from "@/components/ui/BrandIcons";

const TYPE_ICON: Record<string, FC<{ size?: number }>> = {
    combo: FnbBagIcon,
    snack: BurgerIcon,
    food: MealIcon,
    drink: DrinkCupIcon,
    beverage: JuiceBoxIcon,
};

const TYPE_LABEL_KEY: Record<string, string> = {
    combo:    "fnb.typeCombo",
    snack:    "fnb.typeSnack",
    food:     "fnb.typeFood",
    drink:    "fnb.typeDrink",
    beverage: "fnb.typeDrink",
};

interface Props {
    product: Product;
    quantity: number;
    onAdd: () => void;
    onRemove: () => void;
}

const FnbProductCard: FC<Props> = ({ product, quantity, onAdd, onRemove }) => {
    const { t } = useTranslation("booking");
    const type  = (product.itemType ?? "").toLowerCase();
    const TypeIcon = TYPE_ICON[type] ?? FnbBagIcon;
    const labelKey = TYPE_LABEL_KEY[type];
    const label = labelKey ? t(labelKey) : product.itemType;
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
                    <TypeIcon size={40} />
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
                            aria-label={t("fnb.decreaseAria", { item: product.itemName })}
                        >
                            −
                        </button>
                        <span className="cgv-fnb-qty__count">{quantity}</span>
                        <button
                            className="cgv-fnb-qty__btn cgv-fnb-qty__btn--add"
                            onClick={onAdd}
                            disabled={maxReached}
                            aria-label={t("fnb.increaseAria", { item: product.itemName })}
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
