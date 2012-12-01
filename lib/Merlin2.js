/* ============================================================================

 >4SESz.,     _,     ,gSEE2zx.,_        .azx                    ,w.
@Sh. "QEE3.  JEE3.  &ss  `*4EEEEE2x.,_  "EEV  ,aS5^;dEEEE2x.,   VEEF  _
\E2`_,gF4EEEx.?jF   EE5L       `*4EEEEE2zpn..ZEEF ;sz.  `*EEESzw.w* '|EE.
  ,dEEF   `"?j]  _,_   ,_  _,     _,.     L.EEEF  !EEF  _,,  `"``    EE7   ,,_
 :EEE7 ,ws,`|EEL`JEEL`JEE)`JEEL zE5` E3. / [EE3  ,w.  zE2` Ek .zE5^JZE3.,6EF [3
 {EEE. VEE7.EE2  AE3. EEV  ZEEL{EEL ws. ;  [EE1  EEEt{E3. JEELEE3. JE5LJEEF ,w,
  \EEk,,>^ JEEL,@EEF ZE5L,ZE5^ "Q3. V2`.    \EEk,,J' "Q[ yE2^ VE[_zEE[,"QEL V5F
          ,ss  :EE7 ;EEF               L,szzw..            ,.,            ``
          \E5.,E5F  EE1.              /; ``*4EEEZhw._      EEEL
            ````     ``              JEEE.     `"45EEEhw.,,,]

From 2010 till ∞
typecode-js v 0.1
*/

define(['jquery', 'NIseed'], function($) {

    var window = this,
    NI = window.NI;

    NI.co.Merlin = {
        PREVIOUS_STEP: 'prev',
        NEXT_STEP: 'next',
        CURRENT_STEP: 'current',

        DISABLED_CLASS: 'state-disabled'
    };

    var Merlin = function(options) {

        var self = this, o, internal, fn, handlers;

        o = $.extend({
            name: null,
            $e: null,
            selector: '',
            steps: {},
            data: {},
            extensions: {},
            controls: {
                prev: null,
                next: null
            },
            transition: null,
            first_step: null
        }, options);

        internal = {
            name: (o.name ? o.name : 'mod.Merlin'),
            $e: (o.$e ? o.$e : $(o.selector)),
            steps: o.steps,
            data: o.data,
            controls: o.controls,
            last_step: null,
            current_step: null,
            n_step_renders: 0
        };

        fn = {
            init: function() {
                this.init_controls();
                this.init_steps();
                if (o.first_step) {
                    this.show_step(o.first_step);
                }
            },
            init_controls: function() {
                $.each(internal.controls, function(k, control) {
                    if (handlers[k]) {
                        if (typeof control === 'string') {
                            control = $(control);
                        }
                        control.on('click.Merlin', handlers[k]);
                    }
                });
            },
            init_steps: function() {
                $.each(internal.steps, function(k, step) {
                    step.name = k;
                    step.n_times_shown = 0;
                    if (!step.$e) {
                        if (step.selector) {
                            step.$e = internal.$e.find(step.selector);
                        } else {
                            return true;
                        }
                    }
                    step.$e.hide();
                    if (step.fields) {
                        //TODO
                    }
                });
            },
            show_step: function(name) {

                // Sanity

                if (typeof name !== 'string' && !$.isFunction(name)) {
                    return false;
                }

                // Validation

                if (internal.current_step && internal.current_step.valid === false) {
                    return false;
                }

                // Special names

                if ($.isFunction(name)) {
                    name = name(self);
                }

                if (name === NI.co.Merlin.PREVIOUS_STEP) {
                    if (internal.current_step && internal.current_step.prev) {
                        fn.show_step(internal.current_step.prev);
                    }
                    return;
                } else if (name === NI.co.Merlin.NEXT_STEP) {
                    if (internal.current_step && internal.current_step.next) {
                        fn.show_step(internal.current_step.next);
                    }
                    return;
                } else if (name === NI.co.Merlin.CURRENT_STEP) {
                    if (internal.current_step) {
                        fn.show_step(internal.current_step.name);
                    }
                    return;
                }

                if (!internal.steps[name]) {
                    return false;
                }

                if (internal.current_step) {
                    if (name === internal.current_step.name) {
                        if ($.isFunction(internal.current_step.visible)) {
                            internal.current_step.visible.apply(internal.current_step, [self]);
                        }
                        return true;
                    }
                    if ($.isFunction(internal.current_step.finish)) {
                        if (internal.current_step.finish.apply(internal.current_step, [self]) === false) {
                            return false;
                        }
                    }

                    internal.last_step = internal.current_step;
                }

                internal.current_step = internal.steps[name];

                fn.transition_steps();

                if (internal.current_step.n_times_shown === 0) {
                    if ($.isFunction(internal.current_step.init)) {
                        internal.current_step.init.apply(internal.current_step, [self]);
                    }
                }

                fn.update_controls();

                if ($.isFunction(internal.current_step.visible)) {
                    internal.n_step_renders += 1;
                    internal.current_step.visible.apply(internal.current_step, [self]);
                }

                internal.current_step.n_times_shown += 1;
            },
            transition_steps: function() {
                var last_step = internal.last_step,
                current_step = internal.current_step;

                if ($.isFunction(o.transition)) {
                    o.transition.apply(self, [last_step, current_step]);
                } else {
                    if (last_step) {
                        last_step.$e.hide();
                    }
                    current_step.$e.show();
                }
            },
            update_controls: function() {
                var current_step = internal.current_step;
                if (internal.controls.prev) {
                    if (current_step.prev) {
                        internal.controls.prev.removeClass(NI.co.Merlin.DISABLED_CLASS);
                    } else {
                        internal.control.prev.addClass(NI.co.Merlin.DISABLED_CLASS);
                    }
                }
                if (internal.controls.next) {
                    if (current_step.next) {
                        internal.controls.next.removeClass(NI.co.Merlin.DISABLED_CLASS);
                    } else {
                        internal.control.next.addClass(NI.co.Merlin.DISABLED_CLASS);
                    }
                }
            },
            set_data: function(data) {
                internal.data = data;
            },
            get_data: function(data) {
                return internal.data;
            },
            set_val: function(k, v) {
                internal.data[k] = v;
            },
            get_val: function(k) {
                return internal.data[k];
            },
            destroy: function() {
                $.each(internal.controls, function(k, control) {
                    if (handlers[k]) {
                        if (typeof control === 'string') {
                            control = $(control);
                        }
                        control.off('click.Merlin', handlers[k]);
                    }
                });
                $.each(internal.steps, function() {
                    if ($.isFunction(this.destroy)) {
                        this.destroy.apply(this, [self]);
                    }
                });
            }
        };

        handlers = {
            prev: function(e) {
                e.preventDefault();
                if ($(this).hasClass(NI.co.Merlin.DISABLED_CLASS)) {
                    return;
                }
                fn.show_step(NI.co.Merlin.PREVIOUS_STEP);
            },
            next: function(e) {
                e.preventDefault();
                if ($(this).hasClass(NI.co.Merlin.DISABLED_CLASS)) {
                    return;
                }
                fn.show_step(NI.co.Merlin.NEXT_STEP);
            },
            refresh: function(e) {
                e.preventDefault();
                fn.show_step(NI.co.Merlin.CURRENT_STEP);
            }
        };

        this.extensions = o.extensions;

        this.show_step = fn.show_step;
        this.set_data = fn.set_data;
        this.get_data = fn.get_data;
        this.set_val = fn.set_val;
        this.get_val = fn.get_val;
        this.destroy = fn.destroy;

        fn.init();
        console.log(internal);
    };

    NI.Merlin = Merlin;

    return Merlin;
});