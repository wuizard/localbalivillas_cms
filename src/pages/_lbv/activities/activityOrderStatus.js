/**
 * The activity order lifecycle, shared by the list, the filter and the detail screen.
 * It lives in its own module rather than on the list page because the filter is a child
 * of the list — importing it back from the page makes a cycle, and the constant lands
 * in its consumer's temporal dead zone.
 */
export const ORDER_STATUS = [
    { value: "waiting_payment", label: "Waiting payment", color: "warning" },
    { value: "paid", label: "Paid", color: "info" },
    { value: "confirmed", label: "Confirmed", color: "success" },
    { value: "cancelled", label: "Cancelled", color: "error" },
    { value: "refunded", label: "Refunded", color: "secondary" },
];

export const statusMeta = (value) =>
    ORDER_STATUS.find((s) => s.value === value) || ORDER_STATUS[0];

// Same tinted pill the villa orders table uses (helper/bookingStatus). A filled MUI
// warning Chip puts white on amber, which measures 1.74:1 — unreadable.
export const statusChipSx = (value) => {
    const { color } = statusMeta(value);
    return {
        bgcolor: `${color}.lighter`,
        color: color === 'secondary' ? 'text.secondary' : `${color}.main`,
        fontWeight: 500,
    };
};
