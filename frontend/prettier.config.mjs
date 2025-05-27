import solanaConfig from "@solana/prettier-config-solana" with { type: "json" };

const config = {
  ...solanaConfig,
  plugins: [solanaConfig.plugins ?? []].concat(["@ianvs/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"]),
  endOfLine: "lf",
  importOrder: [
    '.*styles.css$',
    '',
    '^react$',
    '^next$',
    '^next/.*$',
    '<BUILTIN_MODULES>',
    '<THIRD_PARTY_MODULES>',
    '^@docs/(.*)$',
    '^@/.*$',
    '^../(?!.*.css$).*$',
    '^./(?!.*.css$).*$',
    '\\.css$',
  ],

};
