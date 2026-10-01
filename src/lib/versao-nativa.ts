/** Sobe quando muda algo NATIVO (plugin novo, permissão nova): o pacote web
 *  novo não roda num APK velho, e o app pede pra instalar o APK novo. O CI lê
 *  este número (android.yml, deploy.yml) — manter o formato da linha. */
export const NATIVE_VERSION = 1;

/** Versão do pacote web (sha curto do commit, injetado no CI). */
export const BUNDLE_VERSION: string = import.meta.env.VITE_BUNDLE_VERSION ?? "dev";
