### Versions

At the time of submitting the issue:

systemjs: 0.19.35 and 0.19.36
systemjs-builder: 0.15.25 and 0.15.26

### Steps to reproduce the problem

1. Clone this repo: https://github.com/lddubeau/systemjs_issue2

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

Two HTTP requests are made for `modC.js`

Errors on the console:

```
Uncaught (in promise) Error: (SystemJS) Cannot read property 'length' of null(…)
Uncaught (in promise) Error: (SystemJS) Cannot read property 'length' of null(…)
```

By putting breakpoints and stepping through code I've found that this error is triggered by `normalizedDeps` being `null` at [this line](https://github.com/systemjs/systemjs/blob/3d097d90485a3ceaf5751b5b2709ab7606502105/dist/system.src.js#L3086).
