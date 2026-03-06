import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DEFAULT_METADATA, getBaseUrl } from '@/data/defaultMetadata';

export interface PageMetadataProps {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  image?: string;
  robots?: string;
  canonicalPath?: string;
  noIndex?: boolean;
}

function setMetaTag(
  selector: string,
  attr: 'name' | 'property',
  key: string,
  content: string,
): void {
  let el = document.querySelector(`${selector}[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string): void {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function PageMetadata({
  title,
  description,
  keywords,
  author,
  image,
  robots,
  canonicalPath,
  noIndex,
}: PageMetadataProps) {
  const { pathname } = useLocation();
  const baseUrl = getBaseUrl();

  const resolvedTitle = title ?? DEFAULT_METADATA.title;
  const resolvedDescription = description ?? DEFAULT_METADATA.description;
  const resolvedKeywords = keywords ?? DEFAULT_METADATA.keywords;
  const resolvedAuthor = author ?? DEFAULT_METADATA.author;
  const resolvedRobots = noIndex ? 'noindex, nofollow' : (robots ?? DEFAULT_METADATA.robots);
  const imagePath = image ?? DEFAULT_METADATA.image;
  const imageUrl = imagePath.startsWith('http')
    ? imagePath
    : `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  const canonical = canonicalPath
    ? `${baseUrl}${canonicalPath.startsWith('/') ? '' : '/'}${canonicalPath}`
    : `${baseUrl}${pathname}`;
  const ogUrl = canonical;

  useEffect(() => {
    document.title = resolvedTitle;
    setMetaTag('meta', 'name', 'title', resolvedTitle);
    setMetaTag('meta', 'name', 'description', resolvedDescription);
    setMetaTag('meta', 'name', 'keywords', resolvedKeywords);
    setMetaTag('meta', 'name', 'author', resolvedAuthor);
    setMetaTag('meta', 'name', 'robots', resolvedRobots);
    setMetaTag('meta', 'property', 'og:type', DEFAULT_METADATA.ogType);
    setMetaTag('meta', 'property', 'og:url', ogUrl);
    setMetaTag('meta', 'property', 'og:title', resolvedTitle);
    setMetaTag('meta', 'property', 'og:description', resolvedDescription);
    setMetaTag('meta', 'property', 'og:image', imageUrl);
    setCanonical(canonical);
  }, [
    resolvedTitle,
    resolvedDescription,
    resolvedKeywords,
    resolvedAuthor,
    resolvedRobots,
    ogUrl,
    imageUrl,
    canonical,
  ]);

  return null;
}
