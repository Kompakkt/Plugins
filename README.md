# Plugins

<p align="center">
    <img src="https://github.com/Kompakkt/Assets/raw/main/official-plugins-logo.svg" alt="Kompakkt Official Plugins logo" width="600">
</p>

## Creating a new plugin

Run the following command, replacing with the name of your plugin.

Note: The full plugin name will be extended to `@kompakkt/pluginname-plugin`.

```sh 
npm run new-plugin pluginname
```

## Building plugins

To build a single plugin, run:

```sh
npx nx build pluginname
```

To build all plugins, run the build script:

```sh
npm run build
```

## Developing plugins

You can refer to the example 'hello-world' plugin, or to the [Kompakkt Extender library](https://github.com/Kompakkt/Extender) to find out how the plugin system works.