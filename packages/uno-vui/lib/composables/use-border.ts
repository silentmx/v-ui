import type { ThemeType } from 'lib/preset/types';
import type { ComputedRef, DeepReadonly, Ref } from 'vue';
import { genCompClass } from './use-class';
import { globalKeywords, hasParseableColor } from './use-unocss';

// border类型
const borderStyles = ["solid", "dashed", "dotted", "double", "hidden", "none", "groove", "ridge", "inset", "outset", ...globalKeywords];
const directionMap: Record<string, string[]> = {
  'l': ['-left'],
  'r': ['-right'],
  't': ['-top'],
  'b': ['-bottom'],
  's': ['-inline-start'],
  'e': ['-inline-end'],
  'x': ['-left', '-right'],
  'y': ['-top', '-bottom'],
  '': [''],
  'bs': ['-block-start'],
  'be': ['-block-end'],
  'is': ['-inline-start'],
  'ie': ['-inline-end'],
  'block': ['-block-start', '-block-end'],
  'inline': ['-inline-start', '-inline-end'],
}

// border style正则表达式
const borderStyleRegList = [
  /(?:border|b)-(?:style-)?()(\S+)$/,
  /(?:border|b)-([xy])-(?:style-)?(\S+)$/,
  /(?:border|b)-([rltbse])-(?:style-)?(\S+)$/,
  /(?:border|b)-(block|inline)-(?:style-)?(\S+)$/,
  /(?:border|b)-([bi][se])-(?:style-)?(\S+)$/,
];

// border color正则表达式
const borderColorRegList = [
  /(?:border|b)-()(?:color-)?(\S+)$/,
  /(?:border|b)-([xy])-(?:color-)?(\S+)$/,
  /(?:border|b)-([rltbse])-(?:color-)?(\S+)$/,
  /(?:border|b)-(block|inline)-(?:color-)?(\S+)$/,
  /(?:border|b)-([bi][se])-(?:color-)?(\S+)$/,
];

// border rounded正则表达式
const borderRoundedRegList = [
  /(?:border-|b-)?(?:rounded|rd)()(?:-(\S+))?$/,
  /(?:border-|b-)?(?:rounded|rd)-([rltbse])(?:-(\S+))?$/,
  /(?:border-|b-)?(?:rounded|rd)-([rltb]{2})(?:-(\S+))?$/,
  /(?:border-|b-)?(?:rounded|rd)-([bise][se])(?:-(\S+))?$/,
  /(?:border-|b-)?(?:rounded|rd)-([bi][se]-[bi][se])(?:-(\S+))?$/,
];

/**
 * border属性
 * - hasBorder: 是否有边框
 * - borderClass: 边框class样式
 */
interface BorderProps {
  hasBorder: DeepReadonly<Ref<boolean>>,
  borderClass: DeepReadonly<ComputedRef<string[]>>,
}

/**
 * 组件通用的关于border的class样式计算属性
 * 主要用来计算border的默认颜色，radius，border style, size
 * @param { string } extraClass 使用组件时在组件属性上添加的class样式,可以通过一下方式获取
 * ```
 * import { useAttrs } from 'vue';
 * const attrs = useAttrs();
 * const extraClass = attrs.class;
 * ```
 * 
 * @returns `object` {@link BorderProps} 包含是否有border和class样式
 */
export function useBorder(extraClass: string = "", type: ThemeType = "default"): BorderProps {
  const hasBorder = ref(false);
  const borderClass = computed(() => {
    // border style 匹配, 只有border style被设置了，border才生效
    hasBorder.value = borderStyleRegList.some(reg => handlerBorderStyleReg(extraClass.match(reg)));
    const hasBorderColor = borderColorRegList.some(reg => handlerBorderColorReg(extraClass.match(reg)))
    const hasRounded = borderRoundedRegList.some(reg => reg.test(extraClass));

    if (!hasBorder.value) {
      return [
        // border rounded
        genCompClass([
          { condition: hasRounded, falseVal: `b-rd` }
        ]),
      ]
    }

    return [
      // border 默认宽度为1px
      "b",
      // border color
      genCompClass([
        { condition: hasBorderColor, falseVal: `b-${type}` }
      ]),
      // border rounded
      genCompClass([
        { condition: hasRounded, falseVal: `b-rd` }
      ]),
    ];
  });

  return {
    hasBorder: readonly(hasBorder),
    borderClass: readonly(borderClass),
  }
}

// 只有class样式指定了border style, 才算所border生效
function handlerBorderStyleReg(matchArray: RegExpMatchArray | null): boolean {
  if (matchArray == null) {
    return false;
  }

  const [, d = '', s]: string[] = matchArray;
  return borderStyles.includes(s) && d in directionMap;
}

function handlerBorderColorReg(matchArray: RegExpMatchArray | null): boolean {
  if (matchArray == null) {
    return false;
  }

  const [, d = '', c]: string[] = matchArray;
  return d in directionMap && hasParseableColor(c);
}