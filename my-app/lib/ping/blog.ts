import sanitizeHtml from "sanitize-html";

const SAFE_STYLE_TEXT = /^(?!.*(?:url|expression|javascript|var|attr)\()[\w\u0080-\uFFFF\s#(),.%+'"\/_+*-]+$/i;
const SAFE_COLOR = /^(?:#[\da-f]{3,8}|(?:rgba?|hsla?)\([\d\s,.%+-]+\)|[a-z]+)$/i;
const SAFE_LENGTH = /^(?:0|\d+(?:\.\d+)?(?:px|pt|em|rem|%|vh|vw))$/i;
const SAFE_LINE_HEIGHT = /^(?:normal|0|\d+(?:\.\d+)?(?:px|pt|em|rem|%)?)$/i;
const SAFE_TEXT_ALIGN = /^(?:left|right|center|justify|start|end)$/i;
const SAFE_FONT_WEIGHT = /^(?:normal|bold|bolder|lighter|[1-9]\d{2})$/i;
const SAFE_FONT_STYLE = /^(?:normal|italic|oblique)$/i;
const SAFE_TEXT_DECORATION = /^(?:none|underline|overline|line-through)(?:\s+(?:solid|double|dotted|dashed|wavy))?$/i;
const SAFE_WHITE_SPACE = /^(?:normal|nowrap|pre|pre-wrap|pre-line|break-spaces)$/i;

export function formatBlogDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Shanghai",
    year: "numeric",
  }).format(date);
}

export function sanitizeBlogContent(content?: string | null) {
  return sanitizeHtml(content ?? "", {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "figure",
      "figcaption",
      "img",
      "span",
    ],
    allowedAttributes: {
      "*": ["class", "style"],
      a: ["href", "name", "rel", "target", "title"],
      col: ["span", "width"],
      img: ["alt", "height", "loading", "src", "title", "width"],
      table: ["border", "cellpadding", "cellspacing", "width"],
      td: ["colspan", "merge_id", "rowspan", "width"],
      th: ["colspan", "rowspan", "scope", "width"],
    },
    allowedStyles: {
      "*": {
        "background-color": [SAFE_COLOR],
        color: [SAFE_COLOR],
        "font-family": [SAFE_STYLE_TEXT],
        "font-size": [SAFE_LENGTH],
        "font-style": [SAFE_FONT_STYLE],
        "font-weight": [SAFE_FONT_WEIGHT],
        "letter-spacing": [SAFE_LENGTH],
        "line-height": [SAFE_LINE_HEIGHT],
        "text-align": [SAFE_TEXT_ALIGN],
        "text-decoration": [SAFE_TEXT_DECORATION],
        "text-indent": [SAFE_LENGTH],
        "vertical-align": [SAFE_LENGTH],
        "white-space": [SAFE_WHITE_SPACE],
      },
    },
    allowedClasses: {
      "*": [
        "ql-align-center",
        "ql-align-justify",
        "ql-align-right",
        "ql-direction-rtl",
        "ql-font-monospace",
        "ql-font-serif",
        "ql-indent-1",
        "ql-indent-2",
        "ql-indent-3",
        "ql-indent-4",
        "ql-indent-5",
        "ql-indent-6",
        "ql-indent-7",
        "ql-indent-8",
        "quill-better-table-wrapper",
        "ql-editor__table--hideBorder",
        "ql-size-huge",
        "ql-size-large",
        "ql-size-small",
      ],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      img: ["http", "https"],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
      }),
      img: sanitizeHtml.simpleTransform("img", {
        loading: "lazy",
      }),
    },
  });
}
