"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { normalizeLocale } from "@/lib/data/localization";
import { autoTranslateText } from "@/lib/i18n/auto-translate";

const sourceLocale = "no";
const translatableAttributes = ["title", "placeholder", "aria-label", "alt"] as const;
const originalTextByNode = new WeakMap<Text, string>();
const originalAttrByElement = new WeakMap<Element, Map<string, string>>();

function readCookieLocale() {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(/(?:^|; )lang=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function hasTranslatableText(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  if (!/[A-Za-zÆØÅæøå]/.test(trimmed)) {
    return false;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return false;
  }

  if (/^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/i.test(trimmed)) {
    return false;
  }

  return true;
}

function shouldSkipElement(element: Element | null) {
  if (!element) {
    return true;
  }

  if (
    element.closest(
      "script,style,noscript,textarea,select,option,code,pre,[data-no-auto-translate],[contenteditable='true']",
    )
  ) {
    return true;
  }

  return false;
}

function collectTextNodes(root: Node) {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }

  return nodes;
}

function collectElementsWithAttributes(root: Node) {
  const elements: Element[] = [];

  if (root instanceof Element) {
    elements.push(root);
  }

  if ("querySelectorAll" in root) {
    const matches = (root as ParentNode).querySelectorAll(
      "[title],[placeholder],[aria-label],img[alt]",
    );
    for (const match of matches) {
      elements.push(match);
    }
  }

  return elements;
}

export function PageAutoTranslator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();

  const locale = useMemo(() => {
    const searchLocale = searchParams.get("lang");
    const cookieLocale = readCookieLocale();
    return normalizeLocale(searchLocale ?? cookieLocale ?? sourceLocale, sourceLocale);
  }, [searchParams]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    let cancelled = false;
    const activeLocale = locale;

    const translateTextNode = (node: Text) => {
      const parentElement = node.parentElement;
      if (shouldSkipElement(parentElement)) {
        return;
      }

      const originalValue = originalTextByNode.get(node) ?? node.textContent ?? "";
      if (!originalTextByNode.has(node)) {
        originalTextByNode.set(node, originalValue);
      }

      if (activeLocale === sourceLocale) {
        if (node.textContent !== originalValue) {
          node.textContent = originalValue;
        }
        return;
      }

      if (!hasTranslatableText(originalValue)) {
        return;
      }

      void autoTranslateText(originalValue, sourceLocale, activeLocale).then((translated) => {
        if (cancelled || !node.isConnected) {
          return;
        }
        if (!translated) {
          return;
        }
        if (locale !== activeLocale) {
          return;
        }
        if (node.textContent === originalValue) {
          node.textContent = translated;
        }
      });
    };

    const translateElementAttributes = (element: Element) => {
      if (shouldSkipElement(element)) {
        return;
      }

      let originalMap = originalAttrByElement.get(element);
      if (!originalMap) {
        originalMap = new Map<string, string>();
        originalAttrByElement.set(element, originalMap);
      }

      for (const attribute of translatableAttributes) {
        const currentValue = element.getAttribute(attribute);
        if (currentValue === null) {
          continue;
        }

        const originalValue = originalMap.get(attribute) ?? currentValue;
        if (!originalMap.has(attribute)) {
          originalMap.set(attribute, originalValue);
        }

        if (activeLocale === sourceLocale) {
          if (currentValue !== originalValue) {
            element.setAttribute(attribute, originalValue);
          }
          continue;
        }

        if (!hasTranslatableText(originalValue)) {
          continue;
        }

        void autoTranslateText(originalValue, sourceLocale, activeLocale).then((translated) => {
          if (cancelled || !element.isConnected) {
            return;
          }
          if (!translated) {
            return;
          }
          if (locale !== activeLocale) {
            return;
          }

          if (element.getAttribute(attribute) === originalValue) {
            element.setAttribute(attribute, translated);
          }
        });
      }
    };

    const processSubtree = (root: Node) => {
      for (const textNode of collectTextNodes(root)) {
        translateTextNode(textNode);
      }

      for (const element of collectElementsWithAttributes(root)) {
        translateElementAttributes(element);
      }
    };

    processSubtree(document.body);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const addedNode of mutation.addedNodes) {
          processSubtree(addedNode);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [locale, pathname, searchParamsKey]);

  return null;
}
