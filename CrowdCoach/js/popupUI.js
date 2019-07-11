//User Interface
(function($) 
  {

    var types = ['DOMMouseScroll', 'mousewheel'];

    if ($.event.fixHooks) {
        for ( var i=types.length; i; ) {
            $.event.fixHooks[ types[--i] ] = $.event.mouseHooks;
        }
    }

    $.event.special.mousewheel = {
        setup: function() {
            if ( this.addEventListener ) {
                for ( var i=types.length; i; ) {
                    this.addEventListener( types[--i], handler, false );
                }
            } else {
                this.onmousewheel = handler;
            }
        },

        teardown: function() {
            if ( this.removeEventListener ) {
                for ( var i=types.length; i; ) {
                    this.removeEventListener( types[--i], handler, false );
                }
            } else {
                this.onmousewheel = null;
            }
        }
    };

    $.fn.extend({
        mousewheel: function(fn) {
            return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
        },

        unmousewheel: function(fn) {
            return this.unbind("mousewheel", fn);
        }
    });


    function handler(event) {
        var orgEvent = event || window.event, args = [].slice.call( arguments, 1 ), delta = 0, returnValue = true, deltaX = 0, deltaY = 0;
        event = $.event.fix(orgEvent);
        event.type = "mousewheel";

        // Old school scrollwheel delta
        if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta/120; }
        if ( orgEvent.detail     ) { delta = -orgEvent.detail/3; }

        // New school multidimensional scroll (touchpads) deltas
        deltaY = delta;

        // Gecko
        if ( orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
            deltaY = 0;
            deltaX = -1*delta;
        }

        // Webkit
        if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY/120; }
        if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = -1*orgEvent.wheelDeltaX/120; }

        // Add event and delta to the front of the arguments
        args.unshift(event, delta, deltaX, deltaY);

        return ($.event.dispatch || $.event.handle).apply(this, args);
    }
  }
)(jQuery);

// EXTEND jQuery
$.js = function (el) {
    return $('[data-js=' + el + ']')
};

var mainWrapper = $.js('main-wrapper');
var sectionWrapper = $.js('sections-wrapper');

var vW = $(window).width();

mainWrapper.mousewheel(function(event, delta) {
            this.scrollLeft -= (delta * 50);

            event.preventDefault();
        });

Draggable.create(mainWrapper, {
  type: 'scrollLeft',
  throwProps: true,
  cursor: 'ew-resize'
});

function setWidth() {
  var section = $.js('section');
  var totalWidth = 0;
  
  section.each(function() {
    totalWidth += parseInt($(this).width(), 10);    
  });
  
  sectionWrapper.css('width', ''+ (totalWidth + 1) +'px');
}

function SetClickedColor(i){
  $('.drawerItem').css('background-color', '#77AB44');
  let clickedDIV = $.js('di_'+i);
  clickedDIV.css('background-color', '#4a9102');
}

setWidth();
SetClickedColor(0);

$(window).on('resize', function() {
  setWidth();
  
});

$('.drawerItem').click(function(e) {
  
  let ItemIndex = $(this).attr('data-js').slice(-1);
  SetClickedColor(ItemIndex);

});