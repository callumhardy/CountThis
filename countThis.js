/**
 *    ___       ___       ___       ___       ___       ___       ___       ___       ___   
 *   /\  \     /\  \     /\__\     /\__\     /\  \     /\  \     /\__\     /\  \     /\  \  
 *  /::\  \   /::\  \   /:/ _/_   /:| _|_    \:\  \    \:\  \   /:/__/_   _\:\  \   /::\  \ 
 * /:/\:\__\ /:/\:\__\ /:/_/\__\ /::|/\__\   /::\__\   /::\__\ /::\/\__\ /\/::\__\ /\:\:\__\
 * \:\ \/__/ \:\/:/  / \:\/:/  / \/|::/  /  /:/\/__/  /:/\/__/ \/\::/  / \::/\/__/ \:\:\/__/
 *  \:\__\    \::/  /   \::/  /    |:/  /   \/__/     \/__/      /:/  /   \:\__\    \::/  / 
 *   \/__/     \/__/     \/__/     \/__/                         \/__/     \/__/     \/__/  
 *
 * countThis Plugin
 * 
 * Helps animate some super dope counting numbers.
 *
 * Author: Callum Hardy <callum.hardy@absolute-design.co.uk>
 *
 * Version: 1.0
 *
 * ascii: smisome1
 * 
 */

(function( $ ){

    "use strict";

    /**
     * defaultConfig
     *
     * The defult configuration arguments for the `countThis` function
     * 
     * @type {Object}
     */
    var defaultConfig = {

        /**
         * target
         *
         * This can either be `null` or a CSS selector.
         * By default this argument is `null` and will in turn target `$(this)`. 
         * If you specify a CSS selector it will target matching elements inside `$(this)`.
         * @type {string/null}
         */
        target: null,

        /**
         * easing
         *
         * Here the easing function can be set. These function are at the bottom of this file
         * 
         * @type {string}
         */
        easing: 'easeOutQuad',

        /**
         * start
         *
         * This is the number that the counters will start counting from.
         *
         * @type {number}
         */
        start: 0,

        /**
         * end
         * @type {number}
         */
        end: 1,

        /**
         * duration
         *
         * How many steps or frames before the animation is finished
         * Steps/frames run at 20fps
         * 
         * @type {number}
         */
        duration: 32,

        /**
         * autoRun
         *
         * Run the counter straight away
         * 
         * @type {Boolean}
         */
        autoRun: true,

        /**
         * frameLength
         *
         * The length of a frame ( Default is 50ms, ie: 20fps )
         * 
         * @type {number}
         */
        frameLength: 50,

        /**
         * before
         *
         * A callback function that runs before every frame is processed
         * 
         * @return {object}
         */
        before: function(){

            var self = this;

            return self;

        },

        /**
         * after
         *
         * A callback function that runs after every frame is processed
         * 
         * @return {object}
         */
        after: function(){

            var self = this;

            return self;

        },

    };

    /**
     * countThis
     * @param  {object} config
     * @return {[type]}        [description]
     */
    $.fn.countThis = function( config ) {

        //  Save thie for later!
        var $this = $(this);

        //  Merge/Overwrite the default and config arguments
        var config = $.extend( {}, defaultConfig, config );

        //  What are we targeting?
        if( config.target )
            var $counters = $(this).find( config.target );
        else
            var $counters = $(this);

        //  Create a counter for each target
        $counters.each(function(){

            //  Create a counter for each target
            var counter = Object.create( Counter );

            //  Storing useful things
            counter.$counter = $(this);
            counter.config = config;

            //  Begin the dope process of counting
            counter.init();

        });

        //  Return the original object so it can be chained
        return $this;

    };

    /**
     * Counter
     *
     * A dope Object to help organise the counting process
     * 
     * @type {Object}
     */
    var Counter = {

        /**
         * init
         *
         * Runs all the required methods
         * 
         * @return {object}
         */
        init: function(){

            var self = this,
                sc = self.config;

            self.setup();

            self.create();

            self.bindEvents();
            
            return self;

        },

        /**
         * setup
         *
         * Sets up the initial variables
         * 
         * @return {object}
         */
        setup: function(){

            var self = this,
                sc = self.config;

            self.text = self.$counter.text();
            self.$span = $('<span>').addClass('counter-number').text( sc.start )
            self.chars = self.text.split('');
            self.before = [];
            self.number = [];
            self.after = [];
            self.running = false;

            return self;

        },

        reset: function(){

            var self = this,
                sc = self.config;

            self.$span.attr({
                number: self.number,
                step: 0
            }).text( 0 );

        },

        /**
         * create
         *
         * Creates the inner elements of the counter element so it's ready to begin counting
         * 
         * @return {object}
         */
        create: function(){

            var self = this;

            //  Loop through each character
            $.each( self.chars, function( key, val ){

                //  If there are no number yet
                if( self.number.length == 0 ) {

                    //  Add character to number array if a number
                    if( isNaN( val ) === false && val != ' ' )
                        self.number.push(val);
                    else
                        self.before.push(val);

                } else {

                    //  Add character to number array if a number
                    if( isNaN( val ) === false && val != ' ' )
                        self.number.push(val);
                    else
                        self.after.push(val);

                }

            });

            //  Put the arrays back together
            self.before = self.before.join('');
            self.number = self.number.join('');
            self.after = self.after.join('');

            //  Update the span
            self.$span.attr({
                number: self.number,
                step: 0
            }).text( 0 );

            //  Add the elements to the counter
            self.$counter.html('');
            self.$counter.append( self.before, self.$span, self.after );

            return self;

        },

        /**
         * bindEvents
         *
         * Events and triggers
         * 
         * @return {object}
         */
        bindEvents: function(){

            var self = this,
                sc = self.config,
                scrolling = false;

            /**
             * Trigger the counter
             */
            self.$span.on('run-counter',function(){
                self.run();
            });

            /**
             * Window Scroll
             */
            $(window).scroll(function()
            {
                //  Clear the current time out
                clearTimeout(scrolling);

                //  runStretch after 50ms
                scrolling = setTimeout( function() {

                    if( !self.running ) {

                        if( sc.autoRun && self.$span.elementIsInView( true ) ) {

                            self.run();

                        } else {

                            self.reset();

                        }

                    }

                }, 50);
            });

            /**
             * Perhaps we need to run it straight away?
             */
            if( sc.autoRun && self.$span.elementIsInView( true ) && !self.running )
                self.run();

            return self;

        },

        /**
         * run
         *
         * Begins or continues counting on the targeted counter
         * 
         * @return {object}
         */
        run: function(){

            var self = this,
                sc = self.config;

            self.running = true;

            //  A before the increment callback... just in case you need one
            sc.before();

            var $counterNumber = self.$counter.find('.counter-number'),
                number = $counterNumber.attr('number'),
                step = $counterNumber.attr('step'),
                value = Math[ self.config.easing ]( step, sc.start, sc.end, sc.duration );

            //  Increment the steps
            step++;

            //  Update the counter data
            $counterNumber.attr({
                step: parseInt( step, 10 )
            }).text( Math.round( value * number ) );
            
            //  An after the increment callback... just in case you need it
            sc.after();

            //  If our duration is still okay, run the counter again
            if( step < sc.duration ) {

                window.setTimeout( function(){

                    self.run();

                }, sc.frameLength );

            //  Otherwise we are at the end, make the counter equal the maximum number
            } else {

                $counterNumber.text( number );

                self.running = false;

            }

            return self;

        }

    };

    /**
     * Easing functions
     * 
     * simple linear tweening - no easing, no acceleration
     */
    Math.linearTween = function (t, b, c, d) {
        return c*t/d + b;
    };
    
    /**
     * quadratic easing in - accelerating from zero velocity
     */
    Math.easeInQuad = function (t, b, c, d) {
        t /= d;
        return c*t*t + b;
    };
    
    /**
     *  quadratic easing out - decelerating to zero velocity
     */
    Math.easeOutQuad = function (t, b, c, d) {
        t /= d;
        return -c * t*(t-2) + b;
    };

    /**
     * quadratic easing in/out - acceleration until halfway, then deceleration
     */
    Math.easeInOutQuad = function (t, b, c, d) {
        t /= d/2;
        if (t < 1) return c/2*t*t + b;
        t--;
        return -c/2 * (t*(t-2) - 1) + b;
    };

    /**
     * cubic easing in - accelerating from zero velocity
     */
    Math.easeInCubic = function (t, b, c, d) {
        t /= d;
        return c*t*t*t + b;
    };

    /**
     *  cubic easing out - decelerating to zero velocity
     */
    Math.easeOutCubic = function (t, b, c, d) {
        t /= d;
        t--;
        return c*(t*t*t + 1) + b;
    };

    /**
     * cubic easing in/out - acceleration until halfway, then deceleration
     */
    Math.easeInOutCubic = function (t, b, c, d) {
        t /= d/2;
        if (t < 1) return c/2*t*t*t + b;
        t -= 2;
        return c/2*(t*t*t + 2) + b;
    };

    /**
     * quartic easing in - accelerating from zero velocity
     */
    Math.easeInQuart = function (t, b, c, d) {
        t /= d;
        return c*t*t*t*t + b;
    };

    /**
     * quartic easing out - decelerating to zero velocity
     */
    Math.easeOutQuart = function (t, b, c, d) {
        t /= d;
        t--;
        return -c * (t*t*t*t - 1) + b;
    };

    /**
     * quartic easing in/out - acceleration until halfway, then deceleration
     */
    Math.easeInOutQuart = function (t, b, c, d) {
        t /= d/2;
        if (t < 1) return c/2*t*t*t*t + b;
        t -= 2;
        return -c/2 * (t*t*t*t - 2) + b;
    };

    /**
     * quintic easing out - decelerating to zero velocity
     */
    Math.easeOutQuint = function (t, b, c, d) {
        t /= d;
        t--;
        return c*(t*t*t*t*t + 1) + b;
    };

    /**
     * quintic easing in/out - acceleration until halfway, then deceleration
     */
    Math.easeInOutQuint = function (t, b, c, d) {
        t /= d/2;
        if (t < 1) return c/2*t*t*t*t*t + b;
        t -= 2;
        return c/2*(t*t*t*t*t + 2) + b;
    };

    /**
     * sinusoidal easing in - accelerating from zero velocity
     */
    Math.easeInSine = function (t, b, c, d) {
        return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
    };

    /**
     * sinusoidal easing out - decelerating to zero velocity
     */
    Math.easeOutSine = function (t, b, c, d) {
        return c * Math.sin(t/d * (Math.PI/2)) + b;
    };

    /**
     * sinusoidal easing in/out - accelerating until halfway, then decelerating
     */
    Math.easeInOutSine = function (t, b, c, d) {
        return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
    };

    /**
     * exponential easing in - accelerating from zero velocity
     */
    Math.easeInExpo = function (t, b, c, d) {
        return c * Math.pow( 2, 10 * (t/d - 1) ) + b;
    };

    /**
     * exponential easing out - decelerating to zero velocity
     */
    Math.easeOutExpo = function (t, b, c, d) {
        return c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b;
    };

    /**
     * exponential easing in/out - accelerating until halfway, then decelerating
     */
    Math.easeInOutExpo = function (t, b, c, d) {
        t /= d/2;
        if (t < 1) return c/2 * Math.pow( 2, 10 * (t - 1) ) + b;
        t--;
        return c/2 * ( -Math.pow( 2, -10 * t) + 2 ) + b;
    };
            
    /**
     * circular easing in - accelerating from zero velocity
     */
    Math.easeInCirc = function (t, b, c, d) {
        t /= d;
        return -c * (Math.sqrt(1 - t*t) - 1) + b;
    };

    /**
     * circular easing out - decelerating to zero velocity
     */
    Math.easeOutCirc = function (t, b, c, d) {
        t /= d;
        t--;
        return c * Math.sqrt(1 - t*t) + b;
    };   

    /**
     * circular easing in/out - acceleration until halfway, then deceleration
     */
    Math.easeInOutCirc = function (t, b, c, d) {
        t /= d/2;
        if (t < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
        t -= 2;
        return c/2 * (Math.sqrt(1 - t*t) + 1) + b;
    };

    /**
     * Helper Functions and Methods
     * 
     * Fall back for older browsers that don't support Object.create
     */
    if( typeof Object.create !== 'function' ) {

        Object.create = function( object ) {

            function Obj(){}
            Obj.prototype = object;
            return new Obj();
        };
    }

    /**
     * Fall back for older browsers that don't support Object.keys
     */
    if (!Object.keys) {

      Object.keys = function(obj) {

        var keys = [];

        for (var i in obj) {
          if (obj.hasOwnProperty(i)) {
            keys.push(i);
          }
        }

        return keys;
      };
    }

    /**
     * elementIsInView
     *
     * This function tests whether an element is visible in the view port. It can test for partial or full visibility depending on the argument passed.
     * @param  {bool} entireElementInView
     * @return {bool} 
     */
    $.fn.elementIsInView = function( entireElementInView ){

        var $elem = $(this);
        var $window = $(window);

        var windowViewTop = $window.scrollTop();
        var windowViewBottom = windowViewTop + $window.height();

        var elemTop = $elem.offset().top;
        var elemBottom = elemTop + $elem.height();

        if( !entireElementInView )
            return ((elemBottom <= windowViewBottom) && (elemTop >= windowViewTop));
        else
            return ((windowViewTop < elemTop) && (windowViewBottom > elemBottom));

    };

})( jQuery );