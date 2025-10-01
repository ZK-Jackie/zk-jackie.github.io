import {sequence} from "astro:middleware";
import {customI18nMiddleware} from "./i18n.ts";


export const onRequest = sequence(
  customI18nMiddleware
)