// Display names and blurbs for the gateways the API knows. A name the API returns
// that is missing here still renders - as itself - so a new backend provider does
// not break the screen before the CMS catches up.
export const PAYMENT_PROVIDERS = {
    xendit: {
        label: 'Xendit',
        description: 'Hosted invoice page. Cards, virtual accounts, e-wallets and QRIS.',
    },
    doku: {
        label: 'DOKU',
        description: 'DOKU Checkout hosted page. Paid orders are marked automatically when DOKU confirms the payment.',
    },
};

// Orders created before the switch existed carry no provider - they were all Xendit.
export const providerOf = (order) => (order && order.paymentProvider) || 'xendit';

export const providerLabel = (name) => (PAYMENT_PROVIDERS[name] || {}).label || name || '—';

// DOKU reports channels as e.g. VIRTUAL_ACCOUNT_BCA - readable once the
// underscores go.
export const channelLabel = (channel) => channel
    ? String(channel).toLowerCase().split('_').map((word) => (
        word.length <= 4 && word !== 'card' ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1)
    )).join(' ')
    : null;
