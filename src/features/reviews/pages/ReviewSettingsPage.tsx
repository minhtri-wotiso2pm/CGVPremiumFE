import { type FC, useEffect } from "react";
import { Button, Form, InputNumber, Skeleton } from "antd";
import { useReviewSettings, useUpdateReviewSettings } from "../hooks/useReviewSettings";
import type { ReviewRewardSettings } from "../types/review.types";

const GiftGlyph: FC = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8" />
        <rect x="2" y="7" width="20" height="5" rx="1" />
        <path d="M12 7v14M12 7C11 4 7 4 7 6.5S10 9 12 7ZM12 7c1-3 5-3 5-.5S14 9 12 7Z" />
    </svg>
);

const ReviewSettingsPage: FC = () => {
    const [form] = Form.useForm<ReviewRewardSettings>();
    const { data, isLoading, isError, refetch } = useReviewSettings();
    const { mutate, isPending } = useUpdateReviewSettings();

    useEffect(() => {
        if (data) form.setFieldsValue(data);
    }, [data, form]);

    const handleSubmit = async () => {
        const values = await form.validateFields();
        mutate({
            firstReviewPoints: Number(values.firstReviewPoints),
            nextReviewPoints: Number(values.nextReviewPoints),
        });
    };

    return (
        <div className="dash-fade-in">
            <div className="dash-page-header" style={{ marginBottom: 20 }}>
                <h1 className="dash-page-title">Review Rewards</h1>
                <p className="dash-page-sub">
                    Set how many loyalty points customers earn for writing movie reviews.
                </p>
            </div>

            {isError ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "64px 24px", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--dash-text-1)" }}>Failed to load review settings</p>
                    <Button onClick={() => refetch()}>Retry</Button>
                </div>
            ) : (
                <div className="dash-card" style={{ maxWidth: 560, padding: 28 }}>
                    {isLoading ? (
                        <Skeleton active paragraph={{ rows: 4 }} />
                    ) : (
                        <Form form={form} layout="vertical" requiredMark={false}>
                            <Form.Item
                                label="First review points"
                                name="firstReviewPoints"
                                tooltip="Points awarded the very first time a customer writes any review."
                                rules={[
                                    { required: true, message: "First review points is required" },
                                    { type: "number", min: 0, message: "Must be 0 or greater" },
                                ]}
                            >
                                <InputNumber min={0} step={5} style={{ width: "100%" }} addonAfter="points" />
                            </Form.Item>

                            <Form.Item
                                label="Next review points"
                                name="nextReviewPoints"
                                tooltip="Points awarded for every subsequent review after the first one."
                                rules={[
                                    { required: true, message: "Next review points is required" },
                                    { type: "number", min: 0, message: "Must be 0 or greater" },
                                ]}
                            >
                                <InputNumber min={0} step={5} style={{ width: "100%" }} addonAfter="points" />
                            </Form.Item>

                            <div style={{
                                display: "flex", gap: 10, alignItems: "flex-start",
                                padding: "12px 14px", borderRadius: 10, marginBottom: 20,
                                background: "rgba(232,0,28,0.04)", border: "1px solid rgba(232,0,28,0.12)",
                                color: "var(--dash-text-2)",
                            }}>
                                <span style={{ color: "var(--dash-crimson)", flexShrink: 0, marginTop: 1 }}><GiftGlyph /></span>
                                <span style={{ fontSize: 12.5, lineHeight: 1.55 }}>
                                    Changes apply only to reviews created from now on. Existing reviews and previously
                                    awarded points are never recalculated.
                                </span>
                            </div>

                            <Button type="primary" onClick={handleSubmit} loading={isPending}>
                                Save Changes
                            </Button>
                        </Form>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReviewSettingsPage;
