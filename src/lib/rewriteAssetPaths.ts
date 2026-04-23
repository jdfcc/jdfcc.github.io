const ROOTED_PROTOCOL = /^(?:[a-z]+:)?\/\//i;
const ROOTED_SPECIAL = /^(?:#|\/|data:|mailto:|tel:)/i;

function normalizeStaticPath(value: string): string {
  if (!value || ROOTED_PROTOCOL.test(value) || ROOTED_SPECIAL.test(value)) {
    return value;
  }

  if (value.startsWith('./')) {
    value = value.slice(2);
  }

  if (value.startsWith('assets/')) {
    return `/${value}`;
  }

  if (value.startsWith('img/')) {
    return `/${value}`;
  }

  return value;
}

export function rewriteAssetPaths(content: string): string {
  return content
    .replace(/(<(?:img|audio|video|source)\b[^>]*?\s(?:src|poster)=['"])([^'"]+)(['"])/gi, (_, prefix: string, value: string, suffix: string) => {
      return `${prefix}${normalizeStaticPath(value)}${suffix}`;
    })
    .replace(/(\[[^\]]*\]\()([^\)\s]+)(\))/g, (_, prefix: string, value: string, suffix: string) => {
      return `${prefix}${normalizeStaticPath(value)}${suffix}`;
    })
    .replace(/(!\[[^\]]*\]\()([^\)\s]+)(\))/g, (_, prefix: string, value: string, suffix: string) => {
      return `${prefix}${normalizeStaticPath(value)}${suffix}`;
    });
}

export function rewriteStaticField(value?: string): string | undefined {
  if (!value) {
    return value;
  }

  return normalizeStaticPath(value);
}
