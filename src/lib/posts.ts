import { getCollection, type CollectionEntry } from 'astro:content';

export type PostEntry = CollectionEntry<'posts'>;

export type HomeSection = {
  id: string;
  name: string;
  posts: PostEntry[];
};

export const FALLBACK_TAG = '杂谈';

export function normalizeTag(tag: string): string {
  return tag.trim();
}

export function toSectionId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{Letter}\p{Number}-]/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'section';
}

export function sortPostsByCreated(posts: PostEntry[]): PostEntry[] {
  return [...posts].sort((a, b) => b.data.created.getTime() - a.data.created.getTime());
}

export async function getAllPosts(): Promise<PostEntry[]> {
  const posts = await getCollection('posts');
  return sortPostsByCreated(posts);
}

export function getPostTags(post: PostEntry): string[] {
  const normalized = [...new Set(post.data.tags.map(normalizeTag).filter(Boolean))];
  return normalized.length > 0 ? normalized : [FALLBACK_TAG];
}

export function getHomeSections(posts: PostEntry[]): HomeSection[] {
  const sectionMap = new Map<string, PostEntry[]>();

  for (const post of sortPostsByCreated(posts)) {
    for (const tag of getPostTags(post)) {
      const current = sectionMap.get(tag) ?? [];
      current.push(post);
      sectionMap.set(tag, current);
    }
  }

  return [...sectionMap.entries()]
    .sort(([left], [right]) => {
      if (left === FALLBACK_TAG) return 1;
      if (right === FALLBACK_TAG) return -1;
      return left.localeCompare(right, 'zh-Hans-CN');
    })
    .map(([name, sectionPosts]) => ({
      id: toSectionId(name),
      name,
      posts: sortPostsByCreated(sectionPosts),
    }));
}

export function getPermalinkParam(post: PostEntry): string {
  return post.data.permalink.replace(/^\/+|\/+$/g, '');
}

export function findAdjacentPosts(posts: PostEntry[], current: PostEntry): { previous?: PostEntry; next?: PostEntry } {
  const sorted = sortPostsByCreated(posts);
  const index = sorted.findIndex((post) => post.id === current.id);

  return {
    previous: index > 0 ? sorted[index - 1] : undefined,
    next: index >= 0 && index < sorted.length - 1 ? sorted[index + 1] : undefined,
  };
}
