(function ($) {
  "use strict";

  var methods = {
    init : function (options) {
      // init
      console.log('init paintstripper');
    },
    destroy : function () {
      //destroy
    }
  };

  $.fn.paintstripper = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    }

    if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    }

    $.error('Method ' +  method + ' does not exist');
  };
}(jQuery));