import { reactLocalStorage } from 'reactjs-localstorage';

/**
 * The superadmin check, in one place. It was duplicated in menu-items/index.js,
 * the menu group files and routes/LBVRoutes.js; Activities and Events would
 * have made it five copies.
 *
 * Known limitation, unchanged by this extraction: the value is read once at module
 * load, so a role change only takes effect after a reload.
 */
export function isSuperAdmin() {
    let userInfo = reactLocalStorage.get('user_info')
    userInfo = userInfo ? JSON.parse(userInfo) : null
    return Boolean(userInfo && (!userInfo.role || userInfo.role === 'superadmin'))
}
