"use strict";
exports.__esModule = true;
exports["default"] = {
    params: function (obj) {
        return Object.keys(obj).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]); }).join('&');
    }
};
