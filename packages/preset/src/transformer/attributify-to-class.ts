import { SourceCodeTransformer, expandVariantGroup } from "unocss";
import { MagicString } from "vue/compiler-sfc";

type AttributifyOptions = {
  /**
   * the list of attributes to ignore
   * @default []
   */
  ignorelist?: (string | RegExp)[];
}

const elementRE = /(<\w[\w:\.$-]*\s)((?:'[^>]*?'|"[^>]*?"|`(?:[^>]|[\S])*?`|\{(?:[^>]|[\S])*?\}|[^>]*?)*)/g;
const attributeRE = /([a-zA-Z()#][\[?a-zA-Z0-9-_:()#%\]?]*)(?:\s*=\s*((?:'[^']*')|(?:"[^"]*")|\S+))?/g;

export const TransformerAttributifyToClass = (options: AttributifyOptions = {}): SourceCodeTransformer => {

  const {
    ignorelist = [],
  } = options;

  const isIgnored = (matchedRule: string) => {
    for (const blockedRule of ignorelist) {
      if (blockedRule instanceof RegExp) {
        if (blockedRule.test(matchedRule)) {
          return true;
        }
      } else if (matchedRule === blockedRule) {
        return true;
      }
    }
    return false;
  }

  return {
    name: "@uno-preset/transformer-attributify-to-class",
    enforce: "pre",
    async transform(code, _, { uno }) {
      for (const ele of Array.from(code.original.matchAll(elementRE))) {
        const classVal = new MagicString("");

        for (const attr of (ele[2] || "").matchAll(attributeRE)) {
          if (isIgnored(attr[1]) || ["class", "className"].includes(attr[1])) {
            continue;
          }

          const attrString = attr[0].replace("=", '-').replace(/['"]/, "(").replace(/['"]/, ")");
          const expandString = expandVariantGroup(attrString);

          for (const item of expandString.split(" ")) {
            const matched = await uno.parseToken(item);
            if (matched) {
              const tag = ele[1];
              const startIdx = (ele.index || 0) + (attr.index || 0) + tag.length;
              const endIdx = startIdx + attr[0].length;
              code.remove(startIdx, endIdx);
              classVal.appendRight(0, `${expandString} `);
              break;
            }
          }
        }

        if (classVal.toString().length > 0) {
          const classIndex = ele[2].indexOf("class=");
          if (classIndex >= 0) {
            // 已经有class属性
            // 查看class有没有带`:`
            const appendIndex = (ele.index || 0) + ele[1].length + classIndex - 1;
            if (code.slice(appendIndex, appendIndex + 1) == ":") {
              code.appendRight(appendIndex + 9, `${classVal.toString()}`);
            } else {
              code.appendRight(appendIndex + 8, `${classVal.toString()}`);
            }
          } else {
            // 没有class属性
            code.appendRight((ele.index || 0) + ele[1].length, `class="${classVal.toString()}" `);
          }
        }
      }
    }
  }
}