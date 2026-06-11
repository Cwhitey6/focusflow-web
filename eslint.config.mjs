/**
 * eslint.config.mjs
 *
 * ESLint configuration for the project
 * Uses the Next.js recommended rule sets for core web vitals and TypeScript
 * The globalIgnores block excludes build output folders that dont need linting
 */

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals, // Next.js core web vitals rules
  ...nextTs,     // Next.js TypeScript rules

  // exclude generated build folders from linting
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;