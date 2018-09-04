"use strict";

function _autoload() {
  $.each(ACC, function(section, obj) {
    if ($.isArray(obj._autoload)) {
      $.each(obj._autoload, function(key, value) {
        if ($.isArray(value)) {
          if (value[1]) {
            try {
              ACC[section][value[0]]();
            } catch (err) {
              console.log(
                "%c!!!ALARM!!! START ERROR!",
                "color: yellow; font-style: italic; background-color: blue; padding: 2px;"
              );
              console.log(
                "%cCan't find method:'%s' in ACC.%s.js",
                "color: red; font-weight: bold;text-decoration: underline;",
                value[0],
                section
              );
              console.log(
                "%c!!!ALARM!!! END ERROR!",
                "color: yellow; font-style: italic; background-color: blue; padding: 2px;"
              );
            }
          } else {
            if (value[2]) {
              try {
                ACC[section][value[2]]();
              } catch (err) {
                console.log(
                  "%c!!!ALARM!!! START ERROR!",
                  "color: yellow; font-style: italic; background-color: blue; padding: 2px;"
                );
                console.log(
                  "%cCan't find method:'%s' in ACC.%s.js",
                  "color: red; font-weight: bold;text-decoration: underline;",
                  value[2],
                  section
                );
                console.log(
                  "%c!!!ALARM!!! END ERROR!",
                  "color: yellow; font-style: italic; background-color: blue; padding: 2px;"
                );
              }
            }
          }
        } else {
          try {
            ACC[section][value]();
          } catch (err) {
            console.log(
              "%c!!!ALARM!!! START ERROR!",
              "color: yellow; font-style: italic; background-color: blue; padding: 2px;"
            );
            console.log(
              "%cCan't find method:'%s' in ACC.%s.js",
              "color: red; font-weight: bold;text-decoration: underline;",
              value,
              section
            );
            console.log(
              "%c!!!ALARM!!! END ERROR!",
              "color: yellow; font-style: italic; background-color: blue; padding: 2px;"
            );
          }
        }
      });
    }
  });
}

$(function() {
  _autoload();
});
