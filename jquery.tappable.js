/*
 * jquery.tappable.js version 0.2
 *
 * More responsive (iOS-like) touch behaviour for buttons and other 'tappable' UI
 * elements, instead of Mobile Safari's 300ms delay and ugly grey overlay:
 *
 *  - A 'touched' class is added to the element as soon as it is tapped (or, in
 *    the case of a "long tap" - when the user keeps their finger down for a
 *    moment - after a specified delay).
 *
 *  - The supplied callback is called as soon as the user lifts their finger.
 *
 *  - The class is removed, and firing of the callback cancelled, if the user moves
 *    their finger (though this can be disabled).
 *
 *  - If the browser doesn't support touch events, it falls back to click events.
 *
 * More detailed explanation of behaviour and background:
 * http://aanandprasad.com/articles/jquery-tappable/
 *
 * See it in action here: http://nnnnext.com
 *
 * I recommend that you add a `-webkit-tap-highlight-color: rgba(0,0,0,0)`
 * style rule to any elements you wish to make tappable, to hide the ugly grey
 * click overlay.
 *
 * Tested on iOS 4.3 and some version of Android, I don't know. Leave me alone.
 *
 * Basic usage:
 *
 *   $(element).tappable(function() { console.log("Hello World!") })
 *
 * Advanced usage:
 *
 *   $(element).tappable({
 *     callback:     function() { console.log("Hello World!") },
 *     cancelOnMove: false,
 *     touchDelay:   150,
 *     onlyIf:       function(el) { return $(el).hasClass('enabled') }
 *   })
 *
 * Options:
 *
 *   cancelOnMove: If truthy, then as soon as the user moves their finger, the
 *                 'touched' class is removed from the element. When they lift
 *                 their finger, the callback will *not* be fired. Defaults to
 *                 true.
 *
 *   touchDelay:   Time to wait (ms) before adding the 'touched' class when the
 *                 user performs a "long tap". Best employed on elements that the
 *                 user is likely to touch while scrolling. Around 150 will work
 *                 well. Defaults to 0.
 *   
 *   onlyIf:       Function to run as soon as the user touches the element, to
 *                 determine whether to do anything. If it returns a falsy value,
 *                 the 'touched' class will not be added and the callback will
 *                 not be fired.
 *
 */

(function($) {
  var touchSupported = ('ontouchstart' in window);

  function fireCallback(callback, $el, event, touched) {
    if (typeof callback == 'function')
      return callback.call($el[0], event, touched);
  }

  $.fn.tappable = function(options) {
    var opts = {
      cancelOnMove: true,
      onlyIf: function() { return true },
      touchDelay: 0,
      callback: undefined
    };

    switch(typeof options) {
      case 'function':
        opts.callback = options;
        break;
      
      case 'object':
        $.extend(opts, options);
        break;
    }

    if (touchSupported) {
      this.bind('touchstart', function(event) {
        var $el = $(this);

        if (opts.onlyIf(this)) {
          $el.prop('tappableEvent', event);

          window.setTimeout(function() {
            if ($el.prop('tappableEvent')) {
              $el.addClass('touched');
            }
          }, opts.touchDelay);
        }
      });
      
      this.bind('touchend', function(event) {
        var $el = $(this);

        if ($el.prop('tappableEvent')) {
          event = $el.prop('tappableEvent');
          
          $el
            .removeProp('tappableEvent')
            .removeClass('touched');

          return fireCallback(opts.callback, $el, event, true);
        }
      });

      if (opts.cancelOnMove) {
        this.bind('touchmove', function() {
          $(this)
            .removeProp('tappableEvent')
            .removeClass('touched')
        });
      }
    }
    else {
      this.bind('click', function(event) {
        if (opts.onlyIf(this)) {
          return fireCallback(opts.callback, $(this), event, false);
        }
      });
    }

    return this;
  }
})(jQuery);
