(function ($) {
  "use strict";

  var ps_w,
    ps_h,
    ps_orientation,
    ps_ratio,
    ps_real_w,
    ps_real_h,
    ps_base = $('<div/>').addClass('ps-base ps-platen'),
    ps_shade = $('<div/>').addClass('ps-shade'),
    ps_platen = $('<div/>').addClass('ps-platen'),
    ps_platens = [ps_base, ps_platen],
    ps_handle = $('<div/>').addClass('ps-handle'),
    has_draggable = $.fn.draggable !== undefined,
    methods = {
      init : function (options) {
        options = $.extend({}, options);
        return this.each(function () {
          var lmnt = $(this),
            base_img = lmnt.find('img').first(),
            base = ps_base,
            stripper = ps_shade,
            img_css = {
              width: 'auto',
              height: 'auto',
              position: 'absolute',
              top: 0,
              left: 0
            };

          lmnt.save_style();
          lmnt.addClass('ps-paintstripper');

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
              $('<div/>')
                .addClass('ps-axle')
                .css(img_css)
                .append(base_img.detach())
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
              ps_platen.append(
                $('<div/>')
                  .addClass('ps-axle')
                  .css(img_css)
                  .append(lmnt.children('img').detach())
              ).css({
                width: ps_w,
                height: ps_h,
                top: 0,
                left: 0,
                overflow: 'hidden',
                position: 'absolute'
              })
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

      activate: function (id) {
        ps_shade.find('img#' + id).activate_layer();
        return this;
      },

      move: function (coord) {
        if (coord === undefined) {
          return ps_base.position();
        }

        coord = $.extend(ps_base.position(), coord);
        $.each(ps_platens, function () {
          $(this).css(coord);
        });

        return this;
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
              ps_handle.css({left: current - (ps_handle.outerWidth() / 2)});
            }

            if (callback !== undefined) {
              callback();
            }
          });
      },

      reset: function () {
        var lmnt = this,
          theta = lmnt.paintstripper('rotate');

        // Close windowshade
        lmnt.paintstripper('reveal', 0);

        // Return to home position
        $(ps_platens).each(function () {
          $(this).css({top: 0, left: 0});
        });

        //activate top layer
        ps_shade.find('img').first().activate_layer();

        // Rotate back to 12 o'clock in the shortest direction
        if (theta > 180) {
          lmnt.paintstripper('rotate', '+=' + (360 - theta));
        } else {
          lmnt.paintstripper('rotate', '-=' + theta);
        }

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
    if (!has_draggable) {
      return;
    }

    var x1 = this.offset().left,
      y1 = this.offset().top,
      x2 = x1 + this.width(),
      y2 = y1 + this.height(),
      handle_w,
      handle_h;

    this.append(ps_handle);
    handle_w = ps_handle.outerWidth() / 2;
    handle_h = ps_handle.outerHeight() / 2;
    ps_handle.css({left: -handle_w, top: (this.height() - handle_h) / 2});
    ps_handle.draggable({
      axis: 'x',
      containment: [x1 - handle_w, y1, x2 - handle_w, y2],
      drag: function (e, ui) {
        var left_offset = ui.position.left,
          handle_offset = ui.helper.outerWidth() / 2,
          new_offset = left_offset + handle_offset;
        ps_shade.width(new_offset);
      }
    });

    $(ps_platens).each(function () {
      $(this).draggable({
        drag: function (event, ui) {
          $('.ps-platen').css({top: ui.position.top, left: ui.position.left});
        }
      });
    });

    return this;
  };

  $.fn.activate_layer = function () {
    $(this).addClass('active').siblings().removeClass('active');
    return $(this);
  };

}(jQuery));