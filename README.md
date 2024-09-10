# Plugins

<p align="center">
    <img src="https://github.com/Kompakkt/Assets/raw/main/official-plugins-logo.svg" alt="Kompakkt Official Plugins logo" width="600">
</p>

This is the official repository for Kompakkt Repo and Viewer plugins.
Plugins depend on the `Extender` library, which is also home in this repository.

More information about the `Extender` and how to use it can be found in the [`extender/README.md`-file](./extender/README.md).

## Creating a new plugin

Run the following command, replacing with the name of your plugin.

Note: The full plugin name will be extended to `@kompakkt/pluginname-plugin`.

```sh
npm run new-plugin pluginname
```

## Building plugins

To build a single plugin, run:

```sh
npm run build pluginname
```

To build all plugins, you can run the CI build script:

```sh
npm run ci:build
```

## Developing plugins

You can refer to the example 'hello-world' plugin, or to the [`extender/README.md`-file](./extender/README.md) to find out how the plugin system works.
