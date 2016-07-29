var SystemJSBuilder = require("systemjs-builder");

var builder = new SystemJSBuilder('js', 'system-config.js');
builder.bundle("lib/modB - modC", "js/out.js");
