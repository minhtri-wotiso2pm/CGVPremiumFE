/**
 * Turns one raw item fetched from a rule type's `dataSource` into a submittable
 * { value, label } pair. This exists because VOUCHER_SYSTEM_ARCHITECTURE.md's
 * validators compare different fields depending on rule type — some by numeric ID
 * (Cinema, Movie, Room, Product), some by name string (SeatType, Membership) — and
 * that isn't something the metadata response (GET /vouchers/rule-types) tells us.
 *
 * Unknown/future rule types fall back to a generic id/name guess so a brand-new
 * rule type still renders something usable without a frontend release.
 */
type RuleOptionExtractor = (item: Record<string, unknown>) => { value: string; label: string };

const RULE_VALUE_EXTRACTORS: Record<string, RuleOptionExtractor> = {
    Cinema: (i) => ({ value: String(i.cinemaId), label: String(i.cinemaName) }),
    Movie: (i) => ({ value: String(i.movieId), label: String(i.title) }),
    Room: (i) => ({ value: String(i.roomId), label: String(i.name) }),
    SeatType: (i) => ({ value: String(i.typeName), label: String(i.typeName) }),
    Membership: (i) => ({ value: String(i.tierName), label: String(i.tierName) }),
    Product: (i) => ({
        value: String(i.itemID ?? i.itemId ?? i.productId ?? i.id),
        label: String(i.itemName ?? i.name),
    }),
};

const genericExtractor: RuleOptionExtractor = (item) => {
    const entries = Object.entries(item);
    const idEntry = entries.find(([key]) => /(^id$|Id$|ID$)/.test(key));
    const nameEntry = entries.find(([key]) => /^(name|title|displayName)$/i.test(key));
    const value = idEntry?.[1] ?? nameEntry?.[1] ?? entries[0]?.[1];
    const label = nameEntry?.[1] ?? value;
    return { value: String(value), label: String(label) };
};

export const extractRuleOption = (ruleType: string, item: Record<string, unknown>): { value: string; label: string } =>
    (RULE_VALUE_EXTRACTORS[ruleType] ?? genericExtractor)(item);
