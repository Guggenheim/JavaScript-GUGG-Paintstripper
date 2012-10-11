/*
 * Guggenheim Paintstripper: Interactive layered image viewer
 * 
 * Guggenheim Paintstripper is a jQuery plugin that you to take a "stack" of
 * coordinated images meant to be different "layers" of a single object (such
 * as a painting) and interactively manipulate them by panning, zooming, 
 * rotating and, most-importantly, revealing the layers with a "windowshade"
 * effect.
 *
 * Uses transit.js <https://github.com/rstacruz/jquery.transit> but currently
 * requires a patched version: 
 *   <https://github.com/luxanimals/jquery.transit>
 *
 * Requires jQuery UI 1.8 (a build including at draggable) if you want dragging
 * effects
 *
 * © 2012 The Solomon R. Guggenheim Foundation, New York.
 *
 * This file is part of Guggenheim Paintstripper.
 * 
 * Guggenheim Paintstripper is free software: you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your
 * option) any later version.
 * 
 * Guggenheim Paintstripper is distributed in the hope that it will be useful, 
 * but WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General 
 * Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along
 * with Guggenheim Paintstripper.  If not, see <http://www.gnu.org/licenses/>.
 */

(function ($) {
  "use strict";

  $.widget('gugg.paintstripper', {
    options: {
      x: 1
    },
    ps_w: undefined,
    ps_h: undefined,
    ps_orientation: undefined,
    ps_ratio: undefined,
    ps_real_w: undefined,
    ps_real_h: undefined,
    ps_images: undefined,
    ps_base: $('<div/>').addClass('ps-base ps-platen'),
    ps_shade: $('<div/>').addClass('ps-shade'),
    ps_platen: $('<div/>').addClass('ps-platen'),
    ps_platens: undefined, //[this.ps_base, this.ps_platen],
    ps_handle: $('<div/>').addClass('ps-handle'), //undefined,
    has_draggable: $.fn.draggable !== undefined,

    _create: function () {
      // options = $.extend({}, options);
      // return this.each(function () {
        var self = this,
          lmnt = self.element,
          ps_images = lmnt.find('img'),
          base_img = $(ps_images[0]),
          img_css = {
            width: 'auto',
            height: 'auto',
            position: 'absolute',
            top: 0,
            left: 0
          };

        self.lmnt = lmnt;
        self.ps_images = lmnt.find('img');
        base_img = $(self.ps_images[0])
        self.ps_base = $('<div/>').addClass('ps-base ps-platen');

        self._save_style(lmnt);
        lmnt.addClass('ps-paintstripper');

        if (self.options.hasOwnProperty('width')) {
          ps_w = options.width;
          lmnt.width(ps_w);
        } else {
          self.ps_w = lmnt.width();
        }

        if (self.options.hasOwnProperty('height')) {
          ps_h = options.height;
          lmnt.height(ps_h);
        } else {
          self.ps_h = lmnt.height();
        }

        self.ps_real_w = base_img.width();
        self.ps_real_h = base_img.height();

        if (self.ps_real_h >= self.ps_real_w) {
          self.ps_orientation = 'portrait';
          self.ps_ratio = self.ps_h / self.ps_real_h;
          img_css.width = self.ps_real_w * self.ps_ratio;
          img_css.height = self.ps_h;
          img_css.left = (self.ps_w - img_css.width) / 2;
        } else {
          self.ps_orientation = 'landscape';
          self.ps_ratio = self.ps_w / self.ps_real_w;
          img_css.width = self.ps_w;
          img_css.height = self.ps_real_h * self.ps_ratio;
          img_css.top = (self.ps_h - img_css.height) / 2;
        }

        self._save_style(lmnt.find('img')).css({
          width: img_css.width,
          height: img_css.height
        });

        lmnt.append(
          self.ps_base.append(
            $('<div/>')
              .addClass('ps-axle')
              .css(img_css)
              .append(base_img.detach())
          ).css({
            width: self.ps_w,
            height: self.ps_h,
            top: 0,
            left: 0,
            position: 'absolute'
          })

        );

        lmnt.append(
          self.ps_shade.append(
            self.ps_platen.append(
              $('<div/>')
                .addClass('ps-axle')
                .css(img_css)
                .append(lmnt.children('img').detach())
            ).css({
              width: self.ps_w,
              height: self.ps_h,
              top: 0,
              left: 0,
              position: 'absolute'
            })
          ).css({
            width: 0,
            height: self.ps_h,
            top: 0,
            left: 0,
            overflow: 'hidden',
            position: 'absolute'
          })
        );

        self.ps_platens = [self.ps_base, self.ps_platen];
        self._init_draggable(lmnt);

    },

    activate: function (id) {
      var self = this;

      self.element.addClass('has-active');
      self._activate_layer(self.ps_shade.find('img#' + id));
      return this;
    },

    deactivate: function () {
      var self = this;
      self.ps_shade
        .css({width: 0})
        .find('img').removeClass('active');
      return self.element.removeClass('has-active');
    },

    max_zoom: function () {
      return 1 / this.ps_ratio;
    },

    move: function (coord) {
      var self = this;

      if (coord === undefined) {
        return self.ps_base.position();
      }

      coord = $.extend(self.ps_base.position(), coord);
      $.each(self.ps_platens, function () {
        this.css(coord);
      });

      return this;
    },

    ratio: function () {
      return this.ps_ratio;
    },

    reset: function (duration) {
      var self = this,
        theta = self.rotate();

      duration = (duration === undefined) ? 0 : duration;

      self.reveal(0, duration);
      self.zoom(100, duration);

      // Return to home position
      $.each(self.ps_platens, function () {
        $(this).css({top: 0, left: 0});
      });

      // deactivate windowshade
      self.deactivate();

      // Rotate back to 12 o'clock in the shortest direction
      if (theta > 180) {
        self.rotate('+=' + (360 - theta), duration);
      } else {
        self.rotate('-=' + theta, duration);
      }

      return this;
    },

    reveal: function (amount, duration, easing, callback) {
      var self = this,
        lmnt = self.element,
        frame_w = lmnt.width(),
        m;

      if (!lmnt.hasClass('has-active')) {
        return this;
      }

      if (amount === undefined) {
        return self.ps_shade.width();
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

      return self.ps_shade.animate({width: amount}, 
        {duration: duration, easing: easing, step: self._sync_handle, complete: self._sync_handle});
    },

    rotate: function (deg, duration, easing, callback) {
      var self = this,
        axles = self.element.find('.ps-axle');

      console.log(deg);

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

    zoom: function (zoom) {
      var self = this;
      if (zoom === undefined) {
        return self.ps_images.first().css('scale');
      }

      $(".ps-platen img").each(function () {
        $(this).transition({ scale: (zoom / 100)}, 0);
      });
    },


    destroy: function () {

    },

    _activate_layer: function (lmnt) {
      lmnt.addClass('active').siblings().removeClass('active');
      return lmnt;
    },

    _init_draggable: function (lmnt) {
      var self = this;

      if (self.has_draggable === false) {
        console.log('NO DRAG');
        return;
      }

      var x1 = lmnt.offset().left,
        y1 = lmnt.offset().top,
        x2 = x1 + lmnt.width(),
        y2 = y1 + lmnt.height(),
        handle_w,
        handle_h;

      lmnt.append(self.ps_handle);
      handle_w = self.ps_handle.outerWidth() / 2;
      handle_h = self.ps_handle.outerHeight() / 2;
      self.ps_handle.css({left: -handle_w, top: (lmnt.height() - handle_h) / 2});
      self.ps_handle.draggable({
        axis: 'x',
        containment: [x1 - handle_w, y1, x2 - handle_w, y2],
        drag: function (e, ui) {
          var left_offset = ui.position.left,
            handle_offset = ui.helper.outerWidth() / 2,
            new_offset = left_offset + handle_offset;
          self.ps_shade.width(new_offset);
        }
      });

      console.log(self.ps_base);
      $.each([self.ps_base, self.ps_platen], function (i, e) {
        console.log(e);
        $(this).draggable({
          drag: function (event, ui) {
            $('.ps-platen').css({top: ui.position.top, left: ui.position.left});
          }
        });
      });

      return lmnt;
    },

    _save_style: function (e) {
      return $.each(e, function () {
        if ($(this).attr('style') === undefined) {
          $(this).data('orig-style', $(this).attr('style'));
        } else {
          $(this).data('orig-style', null);
        }
      });
    },

    // Move handle when windowshade is moved. Callback used in reveal()
    _sync_handle: function (now, fx) {
      var shade = $(this),
        handle = shade.siblings('.ps-handle').first(),
        current = shade.width(),
        frame_w = shade.closest('.ps-paintstripper').width();

      if (current < 0) {
        current = 0;
      } else if (current > frame_w) {
        current = frame_w;
      }

      if (handle.length > 0) {
        handle.css({left: current - (handle.outerWidth() / 2)});
      }
      return this;
    }
  });
}(jQuery));
