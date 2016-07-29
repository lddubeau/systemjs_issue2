### Versions

At the time of submitting the issue:

systemjs: 0.19.35
systemjs-builder: 0.15.25

### Steps to reproduce the problem

1. Clone this repo: https://github.com/lddubeau/systemjs_issue1

2. ``npm install``.

3. ``npm run build`` will produce ``js/out.js``.

4. Open ``index.html`` in a server. (You cannot just load it from ``file://`` due to cross-origin restrictions.)

You may need to reload, or play with the time parameter of `setTimeout` to get an error, the problem is a race condition.

The `index.html` contains the following:

```
<html>
  <head>
    <script type="text/javascript" src="node_modules/systemjs/dist/system.src.js"></script>
    <script type="text/javascript" src="system-config.js"></script>
    <script type="text/javascript">
      System.config({
      bundles: {
        "out.js": [ "lib/modB.js"],
      }
      });
      window.require = SystemJS.amdRequire;
      window.define = SystemJS.amdDefine;
      require(["modA"]);
      setTimeout(function () {
        require(["modC", "lib/modB"]);
      }, 10);
    </script>
  </head>
  <body>
  </body>
</html>
```

The `system-config.js` file contains:

```
System.config({
    baseURL: "js",
    packages: {
        '': {
            defaultExtension: "js"
        }
    }
});
```

### Expected behavior

Everything should load without error. Files should be loaded once and only once.

### Actual behavior

`modC.js` fails to load properly. Two HTTP requests are made for it, and its loading ends with an error.

Errors on the console:

```
Assertion failed: is loading Uncaught (in promise)
Error: (SystemJS) Unable to load dependency http://localhost:3000/js/modC.js.(…)
Uncaught (in promise) Error: (SystemJS) load.execute is not a function(…)
```

I've also seen an error triggered by `normalizedDeps` being `null` at [this line](https://github.com/systemjs/systemjs/blob/3d097d90485a3ceaf5751b5b2709ab7606502105/dist/system.src.js#L3086).

### Observations

I ran into this problem while trying to port a large application based on RequireJS to SystemJS. The code base has worked fine with RequireJS for years. It also works with SystemJS so long as I don't try to load a bundle that calls out to a module that lives outside the bundle.
