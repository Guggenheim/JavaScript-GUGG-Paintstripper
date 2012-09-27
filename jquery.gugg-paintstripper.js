(function ($) {
  "use strict";

  var ps_w,
    ps_h,
    ps_orientation,
    ps_ratio,
    ps_real_w,
    ps_real_h,
    methods = {
      init : function (options) {
        options = $.extend({}, options);
        var lmnt = $(this),
          base_img = lmnt.find('img').first(),
          img_css = {
            width: 'auto',
            height: 'auto',
            position: 'absolute',
            top: 0,
            left: 0
          };

        lmnt.save_style();

        if (options.hasOwnProperty('width')) {
          ps_w = options.width;
          lmnt.width(ps_w);
        } else {
          ps_w = lmnt.width();
        }

        if (options.hasOwnProperty('height')) {
          ps_h = options.height;
          lmnt.height(ps_h);
        } else {
          ps_h = lmnt.height();
        }

        ps_real_w = base_img.width();
        ps_real_h = base_img.height();

        if (ps_real_h >= ps_real_w) {
          ps_orientation = 'portrait';
          ps_ratio = ps_h / ps_real_h;
          img_css.width = ps_real_w * ps_ratio;
          img_css.height = ps_h;
          img_css.left = (ps_w - img_css.width) / 2;
        } else {
          ps_orientation = 'landscape';
          ps_ratio = ps_w / ps_real_w;
          img_css.width = ps_w;
          img_css.height = ps_real_h * ps_ratio;
          img_css.top = (ps_h - img_css.height) / 2;
        }

        lmnt.find('img').save_style().css(img_css);
        // lmnt.find('img').each(function () {
        //   // Save original style for destruction
        //   if (typeof $(this).attr('style') !== 'undefined') {
        //     $(this).data('orig-style', $(this).attr('style'));          
        //   } else {
        //     $(this).data('orig-style', null);
        //   }

        //   // Set required style
        //   $(this).css(img_css);
        // });

        console.log(base_img.data('orig-style'));

        return this;
      },

      max_zoom: function () {
        return 1 / ps_ratio;
      },

      ratio: function () {
        return ps_ratio;
      },

      destroy : function () {
        var lmnt = $(this);

        // return elements to original style
        lmnt.find('img').each(function () {
            $(this).attr('style', $(this).data('orig-style'));
            $(this).removeData('orig-style');        
        });

        lmnt.attr('style', $(this).data('orig-style'));
        lmnt.removeData('orig-style')  ;        
        return this;
      }
    };

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

  $.fn.save_style = function () {
    return this.each(function() {
      if (typeof $(this).attr('style') !== 'undefined') {
        $(this).data('orig-style', $(this).attr('style'));          
      } else {
        $(this).data('orig-style', null);
      }
    });
  };
}(jQuery));