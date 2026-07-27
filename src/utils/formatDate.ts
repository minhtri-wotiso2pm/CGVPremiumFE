/**
 * Shared date/time formatters — the single source of formatting truth for
 * customer-facing surfaces. Output is numeric and locale-stable by design:
 * dates stay dd/MM/yyyy in both EN and VI.
 */
import dayjs, { type ConfigType } from "dayjs";

export const formatDate = (input: ConfigType): string =>
    dayjs(input).format("DD/MM/YYYY");

export const formatTime = (input: ConfigType): string =>
    dayjs(input).format("HH:mm");

export const formatDateTime = (input: ConfigType): string =>
    `${formatTime(input)} · ${formatDate(input)}`;

/** Compact day/month label, e.g. for chart axes. */
export const formatShortDate = (input: ConfigType): string =>
    dayjs(input).format("DD/MM");
