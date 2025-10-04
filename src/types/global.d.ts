// 全局类型声明入口
/// <reference path="./app/index.d.ts" />

declare const __APP_VERSION__: string;


type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
type Nullable<T> = T | null | undefined;


declare global {
  export type DeepPartial<T> = globalThis.DeepPartial<T>;
  export type Nullable<T> = globalThis.Nullable<T>;

  namespace App {
    interface Locals {
      lang: string;
    }
  }
}
