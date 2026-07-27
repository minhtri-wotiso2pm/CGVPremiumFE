import { type FC } from "react";
import { Select, Input, InputNumber, Button, Spin } from "antd";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import type { VoucherRule, VoucherRuleTypeMetadata } from "../types/voucher.types";
import { useRuleOptions } from "../hooks/useVouchers";

interface Props {
    value: VoucherRule[];
    onChange: (rules: VoucherRule[]) => void;
    metadata: VoucherRuleTypeMetadata[];
    metadataLoading?: boolean;
    disabled?: boolean;
}

// Doc doesn't name a delimiter for multiselect rule values — comma is the common default.
const MULTISELECT_DELIMITER = ",";

// Rule types the server offers but we don't expose in the voucher editor.
// PaymentMethod isn't enforced anywhere in our checkout flow, and FoodCategory is a
// free-text field superseded by the Product rule (which picks from the F&B catalogue at
// /api/products), so both are hidden from the "Add a rule" picker. Kept in metadata so any
// legacy rule of these types still renders/edits instead of hanging on a spinner.
const HIDDEN_RULE_TYPES = new Set(["PaymentMethod", "FoodCategory"]);

const RuleValueControl: FC<{
    meta: VoucherRuleTypeMetadata;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}> = ({ meta, value, onChange, disabled }) => {
    // Only fires a request when this row's rule type actually has a dynamic dataSource.
    const { data: dynamicOptions, isFetching } = useRuleOptions(meta.ruleType, meta.dataSource);

    const options = meta.dataSource
        ? (dynamicOptions ?? []).map((o) => ({ value: o.value, label: o.label }))
        : (meta.options ?? []).map((o) => ({ value: o, label: o }));

    if (meta.inputType === "select") {
        return (
            <Select
                value={value || undefined}
                onChange={(v) => onChange(String(v))}
                options={options}
                loading={isFetching}
                placeholder="Select a value"
                style={{ width: "100%" }}
                disabled={disabled}
                showSearch
                optionFilterProp="label"
            />
        );
    }

    if (meta.inputType === "multiselect") {
        const selected = value ? value.split(MULTISELECT_DELIMITER).filter(Boolean) : [];
        return (
            <Select
                mode="multiple"
                value={selected}
                onChange={(v) => onChange((v as string[]).join(MULTISELECT_DELIMITER))}
                options={options}
                loading={isFetching}
                placeholder="Select one or more"
                style={{ width: "100%" }}
                disabled={disabled}
                showSearch
                optionFilterProp="label"
            />
        );
    }

    if (meta.inputType === "number") {
        return (
            <InputNumber
                value={value === "" ? undefined : Number(value)}
                onChange={(v) => onChange(v === null || v === undefined ? "" : String(v))}
                style={{ width: "100%" }}
                disabled={disabled}
            />
        );
    }

    return (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${meta.displayName.toLowerCase()}`}
            disabled={disabled}
        />
    );
};

/**
 * Renders/edits a voucher's Rules array purely from server-owned metadata
 * (GET /vouchers/rule-types) — no rule type, option list, or per-type branch
 * is hardcoded here beyond the input-type switch mandated by the API contract.
 */
const VoucherRulesEditor: FC<Props> = ({ value, onChange, metadata, metadataLoading, disabled }) => {
    const metaByType = new Map(metadata.map((m) => [m.ruleType, m]));
    const usedTypes = new Set(value.map((r) => r.ruleType));
    const availableToAdd = metadata.filter(
        (m) => !usedTypes.has(m.ruleType) && !HIDDEN_RULE_TYPES.has(m.ruleType),
    );

    const addRule = (ruleType: string) => {
        onChange([...value, { ruleType, ruleValue: "" }]);
    };

    const updateRuleValue = (index: number, ruleValue: string) => {
        const next = value.slice();
        next[index] = { ...next[index], ruleValue };
        onChange(next);
    };

    const removeRule = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {value.length === 0 && (
                <div
                    style={{
                        padding: "10px 12px",
                        border: "1px dashed var(--dash-border)",
                        borderRadius: 8,
                        color: "var(--dash-text-3)",
                        fontSize: 13,
                        background: "var(--dash-bg)",
                    }}
                >
                    No rules — this voucher applies to every booking.
                </div>
            )}

            {value.map((rule, index) => {
                const meta = metaByType.get(rule.ruleType);
                return (
                    <div key={`${rule.ruleType}-${index}`} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <div style={{ width: 108, flexShrink: 0, fontSize: 13, color: "var(--dash-text-2)", paddingTop: 6 }}>
                            {meta?.displayName ?? rule.ruleType}
                        </div>
                        <div style={{ flex: 1 }}>
                            {meta ? (
                                <RuleValueControl
                                    meta={meta}
                                    value={rule.ruleValue}
                                    onChange={(v) => updateRuleValue(index, v)}
                                    disabled={disabled}
                                />
                            ) : (
                                <Spin size="small" />
                            )}
                        </div>
                        <Button
                            type="text"
                            danger
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={() => removeRule(index)}
                            disabled={disabled}
                        />
                    </div>
                );
            })}

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <PlusOutlined style={{ color: "var(--dash-text-3)", fontSize: 12 }} />
                <Select<string>
                    value={undefined}
                    placeholder="Add a rule..."
                    options={availableToAdd.map((m) => ({ value: m.ruleType, label: m.displayName }))}
                    onChange={(v) => addRule(v)}
                    style={{ width: 220 }}
                    disabled={disabled || metadataLoading || availableToAdd.length === 0}
                    loading={metadataLoading}
                    showSearch
                    optionFilterProp="label"
                />
            </div>
        </div>
    );
};

export default VoucherRulesEditor;
