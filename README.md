# NexaMarket

Aplicación móvil de marketplace desarrollada con Expo y React Native.

## Requisitos

- Node.js 18 o superior
- npm
- Expo Go en un dispositivo móvil o Android/iOS Studio para emuladores

## Instalación

Desde la carpeta del proyecto:

```bash
npm install
```

## Ejecutar la aplicación

Inicia el servidor de Expo:

```bash
npm start
```

También puedes ejecutar una plataforma específica:

```bash
npm run web
npm run android
npm run ios
```

Para móvil:

1. Ejecuta `npm start`.
2. Escanea el código QR con Expo Go.
3. En un emulador, usa la opción correspondiente de la terminal de Expo.

## Validación

Ejecuta el lint:

```bash
npm run lint
```

Genera el paquete web:

```bash
npx expo export --platform web
```
