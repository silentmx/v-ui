import { deOptimisePaths, importDirectory, runSVGO } from '@iconify/tools';
import { presetUnoVui } from 'uno-vui';
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      // scale: 1.2,
      collections: {
        // Loading custom icon set
        "csvg": async () => {
          // load icons
          const iconSet = await importDirectory("assets/svgs", {
            prefix: "svg",
          });

          await iconSet.forEach(async (name, type) => {
            if (type !== "icon") {
              return;
            }

            const svg = iconSet.toSVG(name);
            if (svg) {
              // Optimise
              runSVGO(svg);

              // Update paths for compatibility with old software
              await deOptimisePaths(svg);
            } else {
              iconSet.remove(name);
              return;
            }
          });
          // Export as IconifyJson
          return iconSet.export();
        }
      },
      extraProperties: {
        "display": "inline-block",
        "vertical-align": "middle",
      }
    }),
    presetUnoVui({
      themes: [
        { primary: "blue", accent: "purple" },
        { primary: "blue", accent: "purple" },
        { primary: "pink", accent: "violet" },
      ]
    }),
  ],
  transformers: [
    transformerVariantGroup(),
    transformerDirectives(),
  ],
  include: [/.*\/uno-vui\.js(.*)?$/, './**/*.vue', './**/*.md']
});