import { canAny } from './authorization';

/**
 * Pure permission check — deliberately NOT a hook.
 *
 * This used to call useAuthorization() internally, which meant it was a hook in
 * disguise. That was legal from a component body (Utils/Menu.jsx) but illegal
 * from a callback: Pages/Dashboard/Access.jsx calls it inside cards.filter(),
 * where hook order is not guaranteed.
 *
 * Callers must pass the auth object from usePage().props.auth.
 */
export default function hasAnyPermission(permissions, auth = {}) {
    const { permissions: given, super: isSuper } = auth ?? {};

    if (given) {
        return (
            isSuper === true ||
            (Array.isArray(permissions) &&
                permissions.some((permission) => given?.[permission] === true))
        );
    }

    return canAny(permissions, auth);
}
