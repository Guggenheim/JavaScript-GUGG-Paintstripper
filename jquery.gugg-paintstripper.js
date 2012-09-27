(function ($) {
  "use strict";

  var methods = {
      init : function (options) {
        options = $.extend({}, options);
        var lmnt = $(this),
          base_img = lmnt.find('img').first(),
          img_css = {
            width: 'auto', 
            height: 'auto', 
            position: 'absolute',
            top: 0, 
            left: 0};

        if (options.hasOwnProperty('width')) {
          ps_w = options.width;
        } else {
          ps_w = lmnt.width();
        }

        if (options.hasOwnProperty('height')) {
          ps_h = options.height;
        } else {
          ps_h = lmnt.height();
        }

        ps_real_w = base_img.width();
        ps_real_h = base_img.height();

        if (ps_real_h >= ps_real_w) {
          ps_orientation = 'portrait';
          ps_ratio = ps_h/ps_real_h;
          img_css.width = ps_real_w * ps_ratio;
          img_css.height = ps_h;
          img_css.left = (ps_w - img_css.width)/2;
        } else {
          ps_orientation = 'landscape';
          ps_ratio = ps_w/ps_real_w;
          img_css.width = ps_w;
          img_css.height = ps_real_h * ps_ratio;
          img_css.top = (ps_h - img_css.height)/2;
        }

        lmnt.find('img').css(img_css);
        return this;
      },
      destroy : function () {
        //destroy
      }
    },
    ps_w,
    ps_h,
    ps_orientation,
    ps_ratio,
    ps_real_w,
    ps_real_h;

  $.fn.paintstripper = function (method) {
    if (methods[method]) {
      return methods[method].apply(this,
        Array.prototype.slice.call(arguments, 1));
    }

    if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    }

    $.error('Method ' +  method + ' does not exist');
  };
}(jQuery));