(function ($) {
  "use strict";

  var ps_w,
    ps_h,
    ps_orientation,
    ps_ratio,
    ps_real_w,
    ps_real_h,
    ps_shade = $('<div/>').addClass('ps-shade'),
    ps_handle = $('<div/>').addClass('handle'),
    has_draggable = $.fn.draggable !== undefined,
    methods = {
      init : function (options) {
        options = $.extend({}, options);
        return this.each(function () {
          var lmnt = $(this),
            base_img = lmnt.find('img').first(),
            base = $('<div/>').addClass('ps-base'),
            stripper = ps_shade,
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

          lmnt.init_draggable();

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
                $(this).css({ rotate: theta % 360 });
              } else if (theta < 0) {
                $(this).css({ rotate: (theta % 360) + 360 });
              }
              if (callback !== undefined) {
                callback();
              }
            });
        });
      },

      reveal: function (amount, duration, easing, callback) {
        var frame_w = $(this).width(),
          m;

        if (amount === undefined) {
          return ps_shade.width();
        }

        if ((typeof amount === 'string') &&
            ((m = amount.match(/^(\d+)\%/)) !== null)) {
          amount = frame_w * (m[1] / 100);
        } else if (typeof amount === 'number') {
          if (amount < 0) {
            amount = 0;
          } else if (amount > frame_w) {
            amount = frame_w;
          }
        }

        return ps_shade.animate({width: amount}, duration, easing,
          function () {
            var current = ps_shade.width();
            if (current < 0) {
              current = 0;
            } else if (current > frame_w) {
              current = frame_w;
            }

            ps_shade.width(current);
            if (has_draggable) {
              ps_handle.css({left: current - (ps_handle.width()/2)});
            }

            if (callback !== undefined) {
              callback();
            }
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

  $.fn.init_draggable = function () {
    if (! has_draggable) {
      return
    }

    var x1 = this.offset().left,
      y1 = this.offset().top,
      x2 = x1 + this.width(),
      y2 = y1 + this.height();

      console.log('x2: ' + x2);
      console.log(ps_handle.width());
    ps_handle.draggable({
        axis: 'x',
        containment: [x1-7, y1, 888.5-7, y2], //'parent',
        drag: function (e, ui) {
            var left_offset = ui.position.left,
                handle_offset = ui.helper.outerWidth()/2,
                new_offset = left_offset + handle_offset;
            ps_shade.width(new_offset);
        }
    });

    return this.append(ps_handle);
  }

}(jQuery));