export function slugify(value) {
    return String(value ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function uniqueSlug(base, taken) {
    const slug = base || "produk";

    if (!taken.has(slug)) {
        return slug;
    }

    let sequence = 2;

    while (taken.has(`${slug}-${sequence}`)) {
        sequence++;
    }

    return `${slug}-${sequence}`;
}
