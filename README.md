# 🛒 Lista Fácil & 🧁 Fichas Técnicas

> **Slogan:** "Sua lista de compras e precificação de receitas sempre com você."

O **Lista Fácil** é um aplicativo Android completo, moderno e 100% offline desenvolvido com **React Native**, **Expo SDK**, **TypeScript**, **Redux Toolkit (RTK)** e **React Native Paper**.

---

## 📲 Como Gerar o Instalador Android (.APK)

Já deixamos o projeto pré-configurado com o `eas.json` para gerar o arquivo `.apk` de instalação direta para qualquer celular Android.

### Método 1: Nuvem Expo EAS Build (Recomendado - Mais Fácil)

1. **Fazer login na sua conta do Expo**:
   ```bash
   npx eas login
   ```
2. **Gerar o arquivo `.apk` de instalação**:
   ```bash
   npx eas build -p android --profile preview
   ```
3. Ao finalizar, o Expo fornecerá um **link direto e um QR Code** para baixar e instalar o aplicativo `.apk` no seu celular Android.

---

### Método 2: Gerar APK Localmente na sua Máquina

Caso tenha o **Android Studio** e **JDK 17** instalados na sua máquina:

1. **Gerar a pasta nativa do Android**:
   ```bash
   npx expo prebuild --platform android
   ```
2. **Compilar o APK de Release**:
   ```bash
   cd android
   .\gradlew assembleRelease
   ```
3. O instalador estará salvo em:
   `android/app/build/outputs/apk/release/app-release.apk`

---

## 💻 Instalação em Modo de Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar servidor Expo
npm run start
```
