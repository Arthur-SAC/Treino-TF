import { Capacitor } from "@capacitor/core";

/** Rodando dentro do APK? No Chrome (PWA) e nos testes, false. */
export const isNativo = (): boolean => Capacitor.isNativePlatform();
