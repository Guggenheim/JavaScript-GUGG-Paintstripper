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
        return this.each(function () {
          var lmnt = $(this),
            base_img = lmnt.find('img').first(),
            base = $('<div/>').addClass('ps-base'),
            stripper = $('<div/>').addClass('ps-stripper'),
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

          lmnt.find('img').save_style().css({
            width: img_css.width,
            height: img_css.height
          });

          lmnt.append(
            base.append(
              $('<div/>').addClass('ps-axle').css(img_css).append(
                base_img.detach()
              )
            ).css({
              width: ps_w,
              height: ps_h,
              top: 0,
              left: 0,
              position: 'absolute'
            })
          );

          lmnt.append(
            stripper.append(
              $('<div/>').addClass('ps-axle').css(img_css).append(
                lmnt.children('img').detach()
              )
            ).css({
              width: 0,
              height: ps_h,
              top: 0,
              left: 0,
              overflow: 'hidden',
              position: 'absolute'
            })
          );


        });
      },

      rotate: function (deg, duration, easing, callback) {
        var axles = $(this).find('.ps-axle');
        if (deg === undefined) {
          return parseInt(axles.first().css('rotate'), 10);
        }
        
        return axles.each(function () {
          $(this).transition({ rotate: deg }, duration, easing, 
            function (callback) {
              // Check to see if we've gone all the way around in either 
              // direction
              var theta = parseInt($(this).css('rotate'), 10);
              if (theta >= 360) {
                $(this).css({ rotate: theta - 360 });
              } else if (theta < 0) {
                $(this).css({ rotate: theta + 360 });
              }
              if (callback !== undefined) {
                callback();
              }
          });
        });
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
        lmnt.removeData('orig-style');
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
    return this.each(function () {
      if ($(this).attr('style') === undefined) {
        $(this).data('orig-style', $(this).attr('style'));
      } else {
        $(this).data('orig-style', null);
      }
    });
  };
}(jQuery));