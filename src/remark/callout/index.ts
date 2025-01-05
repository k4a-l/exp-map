// ref: https://github.com/escwxyz/remark-obsidian-callout

import type { Plugin } from "unified";
import type { Data, Node } from "unist";
import { visit } from "unist-util-visit";
import {
	alertTriangleIcon,
	bugIcon,
	checkCircleIcon,
	checkIcon,
	clipboardListIcon,
	flameIcon,
	helpCircleIcon,
	infoIcon,
	listIcon,
	pencilIcon,
	quoteIcon,
	xIcon,
	zapIcon,
} from "./icons";

import type { BlockContent, Root } from "mdast";

type Callout = Record<string, unknown>;

interface ExtendedNode extends Node {
	data?: {
		hProperties?: Record<string, unknown>;
	};
}
interface HtmlNode extends Node {
	type: "html";
	data: Data;
	value: string;
}

/**
 * Plugin configuration
 *
 * @export
 * @interface Config
 */
export interface Config {
	/**
	 * the data attribute name to be added to the blockquote
	 *
	 * @type {string}
	 */
	dataAttribute: string;
	/**
	 * the custom class name to be added to the blockquote, by default it's `${dataAttribute}-${calloutType}` if not specified
	 * @date 3/23/2023 - 5:16:26 PM
	 *
	 * @type {string | undefined}
	 */
	blockquoteClass: string | undefined;
	/**
	 * the custom class name to be added to the div, the parent element of icon & title text
	 * @date 3/23/2023 - 5:16:26 PM
	 *
	 * @type {string}
	 */
	titleClass: string;
	/**
	 * the tag name for the title text element, default to `div`
	 * @date 3/23/2023 - 5:16:26 PM
	 *
	 * @type {string}
	 */
	titleTextTagName: string;
	/**
	 * the custom class name to be added to the title text element
	 * @date 3/23/2023 - 5:16:26 PM
	 *
	 * @type {string}
	 */
	titleTextClass: string;
	/**
	 * a function to transform the title text, you can use it to append custom strings
	 * @date 3/23/2023 - 5:16:26 PM
	 *
	 * @type {(title: string) => string}
	 */
	titleTextTransform: (title: string) => string;
	/**
	 * the tag name for the title icon element, default to `div`
	 * @date 3/23/2023 - 5:16:26 PM
	 *
	 * @type {string}
	 */
	iconTagName: string;
	/**
	 * the custom class name to be added to the title icon element
	 * @date 3/23/2023 - 5:16:26 PM
	 *
	 * @type {string}
	 */
	iconClass: string;
	/**
	 * the custom class name to be added to the content element
	 * @date 7/16/2024 - 7:20:26 PM
	 *
	 * @type {string}
	 */
	contentClass: string;
	/**
	 * predefined callouts, an object with callout's name as key, its SVG icon as value,
	 *
	 * see https://help.obsidian.md/Editing+and+formatting/Callouts#Supported+types,
	 *
	 * you can customize it by overriding the same callout's icon or passing new callout with customized name and icon
	 * @date 10/07/2024 - 8:16:26 PM
	 *
	 * @type {Record<string, string>}
	 */
	callouts: Record<string, string>;
}

/**
 * Default configuration
 * @date 3/23/2023 - 5:16:26 PM
 *
 * @type {Config}
 */
const defaultConfig: Config = {
	dataAttribute: "callout",
	blockquoteClass: undefined,
	titleClass: "callout-title",
	titleTextTagName: "div",
	titleTextClass: "callout-title-text",
	titleTextTransform: (title: string) => title.trim(),
	iconTagName: "div",
	iconClass: "callout-title-icon",
	contentClass: "callout-content",
	callouts: {
		note: pencilIcon,
		abstract: clipboardListIcon,
		summary: clipboardListIcon,
		tldr: clipboardListIcon,
		info: infoIcon,
		todo: checkCircleIcon,
		tip: flameIcon,
		hint: flameIcon,
		important: flameIcon,
		success: checkIcon,
		check: checkIcon,
		done: checkIcon,
		question: helpCircleIcon,
		help: helpCircleIcon,
		faq: helpCircleIcon,
		warning: alertTriangleIcon,
		attention: alertTriangleIcon,
		caution: alertTriangleIcon,
		failure: xIcon,
		missing: xIcon,
		fail: xIcon,
		danger: zapIcon,
		error: zapIcon,
		bug: bugIcon,
		example: listIcon,
		quote: quoteIcon,
		cite: quoteIcon,
	},
};

const REGEX = /^\[\!(\w+)\]([+-]?)/;

/**
 * Check if the str is a valid callout type
 * @date 3/23/2023 - 5:16:26 PM
 *
 * @param {Callout} obj
 * @param {string} str
 * @returns {boolean}
 */
const memoizedContainsKey = memoize((obj: Callout, str: string) =>
	Object.keys(obj).includes(str.toLowerCase()),
);

function memoize<T extends (...args: Parameters<T>) => ReturnType<T>>(
	fn: T,
): T {
	const cache = new Map();
	return ((...args: Parameters<T>): ReturnType<T> => {
		const key = JSON.stringify(args);
		if (cache.has(key)) {
			return cache.get(key);
		}
		const result = fn(...args);
		cache.set(key, result);
		return result;
	}) as T;
}
/**
 * This is a remark plugin that parses Obsidian's callout syntax, and adds custom data attributes and classes to the HTML elements for further customizations.
 *
 * @param {?Partial<Config>} [customConfig]
 * @returns {(tree: Node) => void}
 */
const RemarkCalloutPlugin: Plugin = (
	customConfig?: Partial<Config>,
): ((tree: Root) => void) => {
	const mergedConfig = {
		...defaultConfig,
		...customConfig,
		callouts: {
			...defaultConfig.callouts,
			...customConfig?.callouts,
		},
	};

	const {
		dataAttribute,
		blockquoteClass,
		titleClass,
		iconTagName,
		iconClass,
		contentClass,
		callouts,
		titleTextClass,
		titleTextTagName,
		titleTextTransform,
	} = mergedConfig;

	return (tree: Root): void => {
		visit(tree, "blockquote", (node) => {
			if (!("children" in node) || node.children.length === 0) return;

			const firstChild = node.children[0];

			if (!firstChild) return;
			if (firstChild.type !== "paragraph") return;

			const [firstLine, ...remainingLines] = firstChild.children;
			if (!firstLine) return;

			if (firstLine.type !== "text") return;
			const matched = firstLine.value.match(REGEX);

			if (matched) {
				const array = REGEX.exec(firstLine.value);

				const calloutType = array?.at(1);
				const expandCollapseSign = array?.at(2);

				if (array && calloutType) {
					let icon: string;
					let validCalloutType: string;

					if (memoizedContainsKey(callouts, calloutType)) {
						icon = callouts[calloutType.toLowerCase()] ?? pencilIcon;
						validCalloutType = calloutType.toLowerCase();
					} else {
						icon = callouts.note ?? pencilIcon;
						validCalloutType = "note";
					}

					const title =
						array.input.slice(matched[0].length).trim() ||
						calloutType.toUpperCase();

					const titleHtmlNode: HtmlNode = {
						type: "html",
						data: {},
						value: `
                <div class="${titleClass}">
                  <${iconTagName} class="${iconClass}">${icon}</${iconTagName}>
                  ${
										title &&
										`<${titleTextTagName} class="${titleTextClass}">${titleTextTransform(
											title,
										)}</${titleTextTagName}>`
									}
                </div>
                `,
					};

					node.children.splice(0, 1, titleHtmlNode);

					const dataExpandable = Boolean(expandCollapseSign);
					const dataExpanded = expandCollapseSign === "+";

					node.data = {
						hProperties: {
							...(node.data?.hProperties || {}),
							className:
								blockquoteClass || `${dataAttribute}-${validCalloutType}`,
							[`data-${dataAttribute}`]: validCalloutType,
							"data-expandable": String(dataExpandable),
							"data-expanded": String(dataExpanded),
						},
					};
					node.children.push(...(remainingLines as BlockContent[]));
				}
			}
		});
	};
};

export default RemarkCalloutPlugin;
