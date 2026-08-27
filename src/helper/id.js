// Stable client-side identity for list rows that do not have a server _id yet.
//
// Rooms used to be keyed on `value._id`, which is undefined until the property is
// saved - so every unsaved room shared `key={undefined}` and `draggableId="undefined"`.
// React then reused component instances across rooms (typing in one room showing
// up in another) and react-beautiful-dnd could not tell them apart.
let counter = 0;

export function clientId(prefix = 'tmp') {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return `${prefix}-${crypto.randomUUID()}`;
    }
    counter += 1;
    return `${prefix}-${Date.now()}-${counter}`;
}

// Existing records key off their _id so identity survives a reload.
export function ensureClientId(item, prefix = 'room') {
    if (item.clientId) { return item.clientId; }
    return item._id ? String(item._id) : clientId(prefix);
}
