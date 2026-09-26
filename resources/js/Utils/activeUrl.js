function normalizePath(href) {
    if (typeof href !== 'string') {
        return null;
    }

    // route() returns an absolute URL; usePage().url is a pathname — normalize first
    if (href.startsWith('http')) {
        try {
            return new URL(href).pathname;
        } catch {
            return null;
        }
    }

    return href;
}

export function isActiveUrl(url, href) {
    const path = normalizePath(href);

    if (!path) {
        return false;
    }

    return url === path || url.startsWith(`${path}/`);
}

/**
 * Resolve which hrefs are "active" for the current url using longest-match,
 * so a parent route (/dashboard) never outshines a deeper one (/dashboard/products).
 */
export function resolveActiveHrefs(url, hrefs) {
    const matches = hrefs
        .map((href) => ({ href, path: normalizePath(href) }))
        .filter((m) => m.path && (url === m.path || url.startsWith(`${m.path}/`)));

    if (matches.length === 0) {
        return new Set();
    }

    const maxLen = Math.max(...matches.map((m) => m.path.length));

    return new Set(matches.filter((m) => m.path.length === maxLen).map((m) => m.href));
}
