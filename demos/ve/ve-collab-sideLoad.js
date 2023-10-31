( function () {
/*!
 * ==========================================================
 *  COLOR PICKER PLUGIN 1.3.5
 * ==========================================================
 * Author: Taufik Nurrohman <https://github.com/tovic>
 * License: MIT
 * ----------------------------------------------------------
 */

(function(win, doc, NS) {

    var instance = '__instance__',
        first = 'firstChild',
        scroll_left = 'scrollLeft',
        scroll_top = 'scrollTop',
        offset_left = 'offsetLeft',
        offset_top = 'offsetTop',
        delay = setTimeout;

    function is_set(x) {
        return typeof x !== "undefined";
    }

    function is_string(x) {
        return typeof x === "string";
    }

    function is_object(x) {
        return typeof x === "object";
    }

    function object_length(x) {
        return Object.keys(x).length;
    }

    function edge(a, b, c) {
        if (a < b) return b;
        if (a > c) return c;
        return a;
    }

    function num(i, j) {
        return parseInt(i, j || 10);
    }

    function round(i) {
        return Math.round(i);
    }

    // [h, s, v] ... 0 <= h, s, v <= 1
    function HSV2RGB(a) {
        var h = +a[0],
            s = +a[1],
            v = +a[2],
            r, g, b, i, f, p, q, t;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        i = i || 0;
        q = q || 0;
        t = t || 0;
        switch (i % 6) {
            case 0:
                r = v, g = t, b = p;
                break;
            case 1:
                r = q, g = v, b = p;
                break;
            case 2:
                r = p, g = v, b = t;
                break;
            case 3:
                r = p, g = q, b = v;
                break;
            case 4:
                r = t, g = p, b = v;
                break;
            case 5:
                r = v, g = p, b = q;
                break;
        }
        return [round(r * 255), round(g * 255), round(b * 255)];
    }

    function HSV2HEX(a) {
        return RGB2HEX(HSV2RGB(a));
    }

    // [r, g, b] ... 0 <= r, g, b <= 255
    function RGB2HSV(a) {
        var r = +a[0],
            g = +a[1],
            b = +a[2],
            max = Math.max(r, g, b),
            min = Math.min(r, g, b),
            d = max - min,
            h, s = (max === 0 ? 0 : d / max),
            v = max / 255;
        switch (max) {
            case min:
                h = 0;
                break;
            case r:
                h = (g - b) + d * (g < b ? 6 : 0);
                h /= 6 * d;
                break;
            case g:
                h = (b - r) + d * 2;
                h /= 6 * d;
                break;
            case b:
                h = (r - g) + d * 4;
                h /= 6 * d;
                break;
        }
        return [h, s, v];
    }

    function RGB2HEX(a) {
        var s = +a[2] | (+a[1] << 8) | (+a[0] << 16);
        s = '000000' + s.toString(16);
        return s.slice(-6);
    }

    // rrggbb or rgb
    function HEX2HSV(s) {
        return RGB2HSV(HEX2RGB(s));
    }

    function HEX2RGB(s) {
        if (s.length === 3) {
            s = s.replace(/./g, '$&$&');
        }
        return [num(s[0] + s[1], 16), num(s[2] + s[3], 16), num(s[4] + s[5], 16)];
    }

    // convert range from `0` to `360` and `0` to `100` in color into range from `0` to `1`
    function _2HSV_pri(a) {
        return [+a[0] / 360, +a[1] / 100, +a[2] / 100];
    }

    // convert range from `0` to `1` into `0` to `360` and `0` to `100` in color
    function _2HSV_pub(a) {
        return [round(+a[0] * 360), round(+a[1] * 100), round(+a[2] * 100)];
    }

    // convert range from `0` to `255` in color into range from `0` to `1`
    function _2RGB_pri(a) {
        return [+a[0] / 255, +a[1] / 255, +a[2] / 255];
    }

    // *
    function parse(x) {
        if (is_object(x)) return x;
        var rgb = /\s*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)\s*$/i.exec(x),
            hsv = /\s*hsv\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)\s*$/i.exec(x),
            hex = x[0] === '#' && x.match(/^#([\da-f]{3}|[\da-f]{6})$/i);
        if (hex) {
            return HEX2HSV(x.slice(1));
        } else if (hsv) {
            return _2HSV_pri([+hsv[1], +hsv[2], +hsv[3]]);
        } else if (rgb) {
            return RGB2HSV([+rgb[1], +rgb[2], +rgb[3]]);
        }
        return [0, 1, 1]; // default is red
    }

    (function($) {

        // plugin version
        $.version = '1.3.5';

        // collect all instance(s)
        $[instance] = {};

        // plug to all instance(s)
        $.each = function(fn, t) {
            return delay(function() {
                var ins = $[instance], i;
                for (i in ins) {
                    fn(ins[i], i, ins);
                }
            }, t === 0 ? 0 : (t || 1)), $;
        };

        // static method(s)
        $.parse = parse;
        $._HSV2RGB = HSV2RGB;
        $._HSV2HEX = HSV2HEX;
        $._RGB2HSV = RGB2HSV;
        $._HEX2HSV = HEX2HSV;
        $._HEX2RGB = function(a) {
            return _2RGB_pri(HEX2RGB(a));
        };
        $.HSV2RGB = function(a) {
            return HSV2RGB(_2HSV_pri(a));
        };
        $.HSV2HEX = function(a) {
            return HSV2HEX(_2HSV_pri(a));
        };
        $.RGB2HSV = function(a) {
            return _2HSV_pub(RGB2HSV(a));
        };
        $.RGB2HEX = RGB2HEX;
        $.HEX2HSV = function(s) {
            return _2HSV_pub(HEX2HSV(s));
        };
        $.HEX2RGB = HEX2RGB;

    })(win[NS] = function(target, events) {

        var b = doc.body,
            h = doc.documentElement,
            $ = this,
            $$ = win[NS],
            _ = false,
            hooks = {},
            picker = doc.createElement('div'),
            on_down = "touchstart mousedown",
            on_move = "touchmove mousemove",
            on_up = "touchend mouseup",
            on_resize = "orientationchange resize";

        // return a new instance if `CP` was called without the `new` operator
        if (!($ instanceof $$)) {
            return new $$(target, events);
        }

        // store color picker instance to `CP.__instance__`
        $$[instance][target.id || target.name || object_length($$[instance])] = $;

        // trigger color picker panel on click by default
        if (!is_set(events)) {
            events = on_down;
        }

        // add event
        function on(ev, el, fn) {
            ev = ev.split(/\s+/);
            for (var i = 0, ien = ev.length; i < ien; ++i) {
                el.addEventListener(ev[i], fn, false);
            }
        }

        // remove event
        function off(ev, el, fn) {
            ev = ev.split(/\s+/);
            for (var i = 0, ien = ev.length; i < ien; ++i) {
                el.removeEventListener(ev[i], fn);
            }
        }

        // get mouse/finger coordinate
        function point(el, e) {
            var x = !!e.touches ? e.touches[0].pageX : e.pageX,
                y = !!e.touches ? e.touches[0].pageY : e.pageY,
                o = offset(el);
            return {
                x: x - o.l,
                y: y - o.t
            };
        }

        // get position
        function offset(el) {
            if (el === win) {
                var left = win.pageXOffset || h[scroll_left],
                    top = win.pageYOffset || h[scroll_top];
            } else {
                var left = el[offset_left],
                    top = el[offset_top];
                while (el = el.offsetParent) {
                    left += el[offset_left];
                    top += el[offset_top];
                }
            }
            return {
                l: left,
                t: top
            };
        }

        // get closest parent
        function closest(a, b) {
            while ((a = a.parentElement) && a !== b);
            return a;
        }

        // prevent default
        function prevent(e) {
            if (e) e.preventDefault();
        }

        // get dimension
        function size(el) {
            return el === win ? {
                w: win.innerWidth,
                h: win.innerHeight
            } : {
                w: el.offsetWidth,
                h: el.offsetHeight
            };
        }

        // get color data
        function get_data(a) {
            return _ || (is_set(a) ? a : false);
        }

        // set color data
        function set_data(a) {
            _ = a;
        }

        // add hook
        function add(ev, fn, id) {
            if (!is_set(ev)) return hooks;
            if (!is_set(fn)) return hooks[ev];
            if (!is_set(hooks[ev])) hooks[ev] = {};
            if (!is_set(id)) id = object_length(hooks[ev]);
            return hooks[ev][id] = fn, $;
        }

        // remove hook
        function remove(ev, id) {
            if (!is_set(ev)) return hooks = {}, $;
            if (!is_set(id)) return hooks[ev] = {}, $;
            return delete hooks[ev][id], $;
        }

        // trigger hook
        function trigger(ev, a, id) {
            if (!is_set(hooks[ev])) return $;
            if (!is_set(id)) {
                for (var i in hooks[ev]) {
                    hooks[ev][i].apply($, a);
                }
            } else {
                if (is_set(hooks[ev][id])) {
                    hooks[ev][id].apply($, a);
                }
            }
            return $;
        }

        // initialize data ...
        set_data($$.parse(target.getAttribute('data-color') || target.value || [0, 1, 1]));

        // generate color picker pane ...
        picker.className = 'color-picker';
        picker.innerHTML = '<div class="color-picker-control"><span class="color-picker-h"><i></i></span><span class="color-picker-sv"><i></i></span></div>';
        var c = picker[first].children,
            HSV = get_data([0, 1, 1]), // default is red
            H = c[0],
            SV = c[1],
            H_point = H[first],
            SV_point = SV[first],
            start_H = 0,
            start_SV = 0,
            drag_H = 0,
            drag_SV = 0,
            left = 0,
            top = 0,
            P_W = 0,
            P_H = 0,
            v = HSV2HEX(HSV),
            set;

        // on update ...
        function trigger_(k, x) {
            if (!k || k === "h") {
                trigger("change:h", x);
            }
            if (!k || k === "sv") {
                trigger("change:sv", x);
            }
            trigger("change", x);
        }

        // is visible?
        function visible() {
            return picker.parentNode;
        }

        // create
        function create(first, bucket) {
            if (!first) {
                (bucket || b).appendChild(picker), $.visible = true;
            }
            P_W = size(picker).w;
            P_H = size(picker).h;
            var SV_size = size(SV),
                SV_point_size = size(SV_point),
                H_H = size(H).h,
                SV_W = SV_size.w,
                SV_H = SV_size.h,
                H_point_H = size(H_point).h,
                SV_point_W = SV_point_size.w,
                SV_point_H = SV_point_size.h;
            if (first) {
                picker.style.left = picker.style.top = '-9999px';
                function click(e) {
                    var t = e.target,
                        is_target = t === target || closest(t, target) === target;
                    if (is_target) {
                        create();
                    } else {
                        $.exit();
                    }
                    trigger(is_target ? "enter" : "exit", [$]);
                }
                if (events !== false) {
                    on(events, target, click);
                }
                $.create = function() {
                    return create(1), trigger("create", [$]), $;
                };
                $.destroy = function() {
                    if (events !== false) {
                        off(events, target, click);
                    }
                    $.exit(), set_data(false);
                    return trigger("destroy", [$]), $;
                };
            } else {
                fit();
            }
            set = function() {
                HSV = get_data(HSV), color();
                H_point.style.top = (H_H - (H_point_H / 2) - (H_H * +HSV[0])) + 'px';
                SV_point.style.right = (SV_W - (SV_point_W / 2) - (SV_W * +HSV[1])) + 'px';
                SV_point.style.top = (SV_H - (SV_point_H / 2) - (SV_H * +HSV[2])) + 'px';
            };
            $.exit = function(e) {
                if (visible()) {
                    visible().removeChild(picker);
                    $.visible = false;
                }
                off(on_down, H, down_H);
                off(on_down, SV, down_SV);
                off(on_move, doc, move);
                off(on_up, doc, stop);
                off(on_resize, win, fit);
                return $;
            };
            function color(e) {
                var a = HSV2RGB(HSV),
                    b = HSV2RGB([HSV[0], 1, 1]);
                SV.style.backgroundColor = 'rgb(' + b.join(',') + ')';
                set_data(HSV);
                prevent(e);
            };
            set();
            function do_H(e) {
                var y = edge(point(H, e).y, 0, H_H);
                HSV[0] = (H_H - y) / H_H;
                H_point.style.top = (y - (H_point_H / 2)) + 'px';
                color(e);
            }
            function do_SV(e) {
                var o = point(SV, e),
                    x = edge(o.x, 0, SV_W),
                    y = edge(o.y, 0, SV_H);
                HSV[1] = 1 - ((SV_W - x) / SV_W);
                HSV[2] = (SV_H - y) / SV_H;
                SV_point.style.right = (SV_W - x - (SV_point_W / 2)) + 'px';
                SV_point.style.top = (y - (SV_point_H / 2)) + 'px';
                color(e);
            }
            function move(e) {
                if (drag_H) {
                    do_H(e), v = HSV2HEX(HSV);
                    if (!start_H) {
                        trigger("drag:h", [v, $]);
                        trigger("drag", [v, $]);
                        trigger_("h", [v, $]);
                    }
                }
                if (drag_SV) {
                    do_SV(e), v = HSV2HEX(HSV);
                    if (!start_SV) {
                        trigger("drag:sv", [v, $]);
                        trigger("drag", [v, $]);
                        trigger_("sv", [v, $]);
                    }
                }
                start_H = 0,
                start_SV = 0;
            }
            function stop(e) {
                var t = e.target,
                    k = drag_H ? "h" : "sv",
                    a = [HSV2HEX(HSV), $],
                    is_target = t === target || closest(t, target) === target,
                    is_picker = t === picker || closest(t, picker) === picker;
                if (!is_target && !is_picker) {
                    // click outside the target or picker element to exit
                    if (visible() && events !== false) $.exit(), trigger("exit", [$]), trigger_(0, a);
                } else {
                    if (is_picker) {
                        trigger("stop:" + k, a);
                        trigger("stop", a);
                        trigger_(k, a);
                    }
                }
                drag_H = 0,
                drag_SV = 0;
            }
            function down_H(e) {
                start_H = 1,
                drag_H = 1,
                move(e), prevent(e);
                trigger("start:h", [v, $]);
                trigger("start", [v, $]);
                trigger_("h", [v, $]);
            }
            function down_SV(e) {
                start_SV = 1,
                drag_SV = 1,
                move(e), prevent(e);
                trigger("start:sv", [v, $]);
                trigger("start", [v, $]);
                trigger_("sv", [v, $]);
            }
            if (!first) {
                on(on_down, H, down_H);
                on(on_down, SV, down_SV);
                on(on_move, doc, move);
                on(on_up, doc, stop);
                on(on_resize, win, fit);
            }
        } create(1);

        delay(function() {
            var a = [HSV2HEX(HSV), $];
            trigger("create", a);
            trigger_(0, a);
        }, 0);

        // fit to window
        $.fit = function(o) {
            var w = size(win),
                y = size(h),
                z = y.h > w.h, // has vertical scroll bar
                ww = offset(win),
                yy = offset(h),
                w_W = z ? /* Math.max(y.w, w.w) */ y.w : w.w + ww.l,
                w_H = z ? w.h + ww.t : Math.max(y.h, w.h),
                to = offset(target);
            left = to.l;
            top = to.t + size(target).h; // drop!
            if (is_object(o)) {
                is_set(o[0]) && (left = o[0]);
                is_set(o[1]) && (top = o[1]);
            } else {
                if (left + P_W > w_W) {
                    left = w_W - P_W;
                }
                if (top + P_H > w_H) {
                    top = w_H - P_H;
                }
            }
            picker.style.left = left + 'px';
            picker.style.top = top + 'px';
            return trigger("fit", [$]), $;
        };

        // for event listener ID
        function fit() {
            return $.fit();
        }

        // set hidden color picker data
        $.set = function(a) {
            if (!is_set(a)) return get_data();
            if (is_string(a)) {
                a = $$.parse(a);
            }
            return set_data(a), set(), $;
        };

        // alias for `$.set()`
        $.get = function(a) {
            return get_data(a);
        };

        // register to global ...
        $.target = target;
        $.picker = picker;
        $.visible = false;
        $.on = add;
        $.off = remove;
        $.trigger = trigger;
        $.hooks = hooks;
        $.enter = function(bucket) {
            return create(0, bucket);
        };

        // return the global object
        return $;

    });

})(window, document, 'CP');
!function(){function e(e,t,n,r){Object.defineProperty(e,t,{get:n,set:r,enumerable:!0,configurable:!0})}function t(e){return e&&e.__esModule?e.default:e}var n,r,o;function i(e){return e&&e.constructor===Symbol?"symbol":typeof e}var a={};a.useBlobBuilder=function(){try{return new Blob([]),!1}catch(e){return!0}}(),a.useArrayBufferView=!a.useBlobBuilder&&function(){try{return 0===new Blob([new Uint8Array([])]).size}catch(e){return!0}}(),r=a;var s=o;function c(){this._pieces=[],this._parts=[]}"undefined"!=typeof window&&(s=o=window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder||window.BlobBuilder),c.prototype.append=function(e){"number"==typeof e?this._pieces.push(e):(this.flush(),this._parts.push(e))},c.prototype.flush=function(){if(this._pieces.length>0){var e=new Uint8Array(this._pieces);a.useArrayBufferView||(e=e.buffer),this._parts.push(e),this._pieces=[]}},c.prototype.getBuffer=function(){if(this.flush(),a.useBlobBuilder){for(var e=new s,t=0,n=this._parts.length;t<n;t++)e.append(this._parts[t]);return e.getBlob()}return new Blob(this._parts)};var u=c,p=r;function d(e){this.index=0,this.dataBuffer=e,this.dataView=new Uint8Array(this.dataBuffer),this.length=this.dataBuffer.byteLength}function l(){this.bufferBuilder=new u}function f(e){var t=e.codePointAt(0);return t<=2047?"00":t<=65535?"000":t<=2097151?"0000":t<=67108863?"00000":"000000"}function h(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}n={unpack:function(e){return new d(e).unpack()},pack:function(e){var t=new l;return t.pack(e),t.getBuffer()}},d.prototype.unpack=function(){var e,t=this.unpack_uint8();if(t<128)return t;if((224^t)<32)return(224^t)-32;if((e=160^t)<=15)return this.unpack_raw(e);if((e=176^t)<=15)return this.unpack_string(e);if((e=144^t)<=15)return this.unpack_array(e);if((e=128^t)<=15)return this.unpack_map(e);switch(t){case 192:return null;case 193:case 212:case 213:case 214:case 215:return;case 194:return!1;case 195:return!0;case 202:return this.unpack_float();case 203:return this.unpack_double();case 204:return this.unpack_uint8();case 205:return this.unpack_uint16();case 206:return this.unpack_uint32();case 207:return this.unpack_uint64();case 208:return this.unpack_int8();case 209:return this.unpack_int16();case 210:return this.unpack_int32();case 211:return this.unpack_int64();case 216:return e=this.unpack_uint16(),this.unpack_string(e);case 217:return e=this.unpack_uint32(),this.unpack_string(e);case 218:return e=this.unpack_uint16(),this.unpack_raw(e);case 219:return e=this.unpack_uint32(),this.unpack_raw(e);case 220:return e=this.unpack_uint16(),this.unpack_array(e);case 221:return e=this.unpack_uint32(),this.unpack_array(e);case 222:return e=this.unpack_uint16(),this.unpack_map(e);case 223:return e=this.unpack_uint32(),this.unpack_map(e)}},d.prototype.unpack_uint8=function(){var e=255&this.dataView[this.index];return this.index++,e},d.prototype.unpack_uint16=function(){var e=this.read(2),t=256*(255&e[0])+(255&e[1]);return this.index+=2,t},d.prototype.unpack_uint32=function(){var e=this.read(4),t=256*(256*(256*e[0]+e[1])+e[2])+e[3];return this.index+=4,t},d.prototype.unpack_uint64=function(){var e=this.read(8),t=256*(256*(256*(256*(256*(256*(256*e[0]+e[1])+e[2])+e[3])+e[4])+e[5])+e[6])+e[7];return this.index+=8,t},d.prototype.unpack_int8=function(){var e=this.unpack_uint8();return e<128?e:e-256},d.prototype.unpack_int16=function(){var e=this.unpack_uint16();return e<32768?e:e-65536},d.prototype.unpack_int32=function(){var e=this.unpack_uint32();return e<Math.pow(2,31)?e:e-Math.pow(2,32)},d.prototype.unpack_int64=function(){var e=this.unpack_uint64();return e<Math.pow(2,63)?e:e-Math.pow(2,64)},d.prototype.unpack_raw=function(e){if(this.length<this.index+e)throw new Error("BinaryPackFailure: index is out of range "+this.index+" "+e+" "+this.length);var t=this.dataBuffer.slice(this.index,this.index+e);return this.index+=e,t},d.prototype.unpack_string=function(e){for(var t,n,r=this.read(e),o=0,i="";o<e;)(t=r[o])<160?(n=t,o++):(192^t)<32?(n=(31&t)<<6|63&r[o+1],o+=2):(224^t)<16?(n=(15&t)<<12|(63&r[o+1])<<6|63&r[o+2],o+=3):(n=(7&t)<<18|(63&r[o+1])<<12|(63&r[o+2])<<6|63&r[o+3],o+=4),i+=String.fromCodePoint(n);return this.index+=e,i},d.prototype.unpack_array=function(e){for(var t=new Array(e),n=0;n<e;n++)t[n]=this.unpack();return t},d.prototype.unpack_map=function(e){for(var t={},n=0;n<e;n++){var r=this.unpack(),o=this.unpack();t[r]=o}return t},d.prototype.unpack_float=function(){var e=this.unpack_uint32(),t=(e>>23&255)-127;return(0===e>>31?1:-1)*(8388607&e|8388608)*Math.pow(2,t-23)},d.prototype.unpack_double=function(){var e=this.unpack_uint32(),t=this.unpack_uint32(),n=(e>>20&2047)-1023;return(0===e>>31?1:-1)*((1048575&e|1048576)*Math.pow(2,n-20)+t*Math.pow(2,n-52))},d.prototype.read=function(e){var t=this.index;if(t+e<=this.length)return this.dataView.subarray(t,t+e);throw new Error("BinaryPackFailure: read index out of range")},l.prototype.getBuffer=function(){return this.bufferBuilder.getBuffer()},l.prototype.pack=function(e){var t=void 0===e?"undefined":i(e);if("string"===t)this.pack_string(e);else if("number"===t)Math.floor(e)===e?this.pack_integer(e):this.pack_double(e);else if("boolean"===t)!0===e?this.bufferBuilder.append(195):!1===e&&this.bufferBuilder.append(194);else if("undefined"===t)this.bufferBuilder.append(192);else{if("object"!==t)throw new Error('Type "'+t+'" not yet supported');if(null===e)this.bufferBuilder.append(192);else{var n=e.constructor;if(n==Array)this.pack_array(e);else if(n==Blob||n==File||e instanceof Blob||e instanceof File)this.pack_bin(e);else if(n==ArrayBuffer)p.useArrayBufferView?this.pack_bin(new Uint8Array(e)):this.pack_bin(e);else if("BYTES_PER_ELEMENT"in e)p.useArrayBufferView?this.pack_bin(new Uint8Array(e.buffer)):this.pack_bin(e.buffer);else if(n==Object||n.toString().startsWith("class"))this.pack_object(e);else if(n==Date)this.pack_string(e.toString());else{if("function"!=typeof e.toBinaryPack)throw new Error('Type "'+n.toString()+'" not yet supported');this.bufferBuilder.append(e.toBinaryPack())}}}this.bufferBuilder.flush()},l.prototype.pack_bin=function(e){var t=e.length||e.byteLength||e.size;if(t<=15)this.pack_uint8(160+t);else if(t<=65535)this.bufferBuilder.append(218),this.pack_uint16(t);else{if(!(t<=4294967295))throw new Error("Invalid length");this.bufferBuilder.append(219),this.pack_uint32(t)}this.bufferBuilder.append(e)},l.prototype.pack_string=function(e){var t=function(e){return e.length>600?new Blob([e]).size:e.replace(/[\ud800-\udbff][\udc00-\udfff]|[^\u0000-\u007f]/g,f).length}(e);if(t<=15)this.pack_uint8(176+t);else if(t<=65535)this.bufferBuilder.append(216),this.pack_uint16(t);else{if(!(t<=4294967295))throw new Error("Invalid length");this.bufferBuilder.append(217),this.pack_uint32(t)}this.bufferBuilder.append(e)},l.prototype.pack_array=function(e){var t=e.length;if(t<=15)this.pack_uint8(144+t);else if(t<=65535)this.bufferBuilder.append(220),this.pack_uint16(t);else{if(!(t<=4294967295))throw new Error("Invalid length");this.bufferBuilder.append(221),this.pack_uint32(t)}for(var n=0;n<t;n++)this.pack(e[n])},l.prototype.pack_integer=function(e){if(e>=-32&&e<=127)this.bufferBuilder.append(255&e);else if(e>=0&&e<=255)this.bufferBuilder.append(204),this.pack_uint8(e);else if(e>=-128&&e<=127)this.bufferBuilder.append(208),this.pack_int8(e);else if(e>=0&&e<=65535)this.bufferBuilder.append(205),this.pack_uint16(e);else if(e>=-32768&&e<=32767)this.bufferBuilder.append(209),this.pack_int16(e);else if(e>=0&&e<=4294967295)this.bufferBuilder.append(206),this.pack_uint32(e);else if(e>=-2147483648&&e<=2147483647)this.bufferBuilder.append(210),this.pack_int32(e);else if(e>=-0x8000000000000000&&e<=0x8000000000000000)this.bufferBuilder.append(211),this.pack_int64(e);else{if(!(e>=0&&e<=0x10000000000000000))throw new Error("Invalid integer");this.bufferBuilder.append(207),this.pack_uint64(e)}},l.prototype.pack_double=function(e){var t=0;e<0&&(t=1,e=-e);var n=Math.floor(Math.log(e)/Math.LN2),r=e/Math.pow(2,n)-1,o=Math.floor(r*Math.pow(2,52)),i=Math.pow(2,32),a=t<<31|n+1023<<20|o/i&1048575,s=o%i;this.bufferBuilder.append(203),this.pack_int32(a),this.pack_int32(s)},l.prototype.pack_object=function(e){var t=Object.keys(e).length;if(t<=15)this.pack_uint8(128+t);else if(t<=65535)this.bufferBuilder.append(222),this.pack_uint16(t);else{if(!(t<=4294967295))throw new Error("Invalid length");this.bufferBuilder.append(223),this.pack_uint32(t)}for(var n in e)e.hasOwnProperty(n)&&(this.pack(n),this.pack(e[n]))},l.prototype.pack_uint8=function(e){this.bufferBuilder.append(e)},l.prototype.pack_uint16=function(e){this.bufferBuilder.append(e>>8),this.bufferBuilder.append(255&e)},l.prototype.pack_uint32=function(e){var t=4294967295&e;this.bufferBuilder.append((4278190080&t)>>>24),this.bufferBuilder.append((16711680&t)>>>16),this.bufferBuilder.append((65280&t)>>>8),this.bufferBuilder.append(255&t)},l.prototype.pack_uint64=function(e){var t=e/Math.pow(2,32),n=e%Math.pow(2,32);this.bufferBuilder.append((4278190080&t)>>>24),this.bufferBuilder.append((16711680&t)>>>16),this.bufferBuilder.append((65280&t)>>>8),this.bufferBuilder.append(255&t),this.bufferBuilder.append((4278190080&n)>>>24),this.bufferBuilder.append((16711680&n)>>>16),this.bufferBuilder.append((65280&n)>>>8),this.bufferBuilder.append(255&n)},l.prototype.pack_int8=function(e){this.bufferBuilder.append(255&e)},l.prototype.pack_int16=function(e){this.bufferBuilder.append((65280&e)>>8),this.bufferBuilder.append(255&e)},l.prototype.pack_int32=function(e){this.bufferBuilder.append(e>>>24&255),this.bufferBuilder.append((16711680&e)>>>16),this.bufferBuilder.append((65280&e)>>>8),this.bufferBuilder.append(255&e)},l.prototype.pack_int64=function(e){var t=Math.floor(e/Math.pow(2,32)),n=e%Math.pow(2,32);this.bufferBuilder.append((4278190080&t)>>>24),this.bufferBuilder.append((16711680&t)>>>16),this.bufferBuilder.append((65280&t)>>>8),this.bufferBuilder.append(255&t),this.bufferBuilder.append((4278190080&n)>>>24),this.bufferBuilder.append((16711680&n)>>>16),this.bufferBuilder.append((65280&n)>>>8),this.bufferBuilder.append(255&n)};var m=!0,y=!0;function v(e,t,n){var r=e.match(t);return r&&r.length>=n&&parseInt(r[n],10)}function g(e,t,n){if(e.RTCPeerConnection){var r=e.RTCPeerConnection.prototype,o=r.addEventListener;r.addEventListener=function(e,r){if(e!==t)return o.apply(this,arguments);var i=function(e){var t=n(e);t&&(r.handleEvent?r.handleEvent(t):r(t))};return this._eventMap=this._eventMap||{},this._eventMap[t]||(this._eventMap[t]=new Map),this._eventMap[t].set(r,i),o.apply(this,[e,i])};var i=r.removeEventListener;r.removeEventListener=function(e,n){if(e!==t||!this._eventMap||!this._eventMap[t])return i.apply(this,arguments);if(!this._eventMap[t].has(n))return i.apply(this,arguments);var r=this._eventMap[t].get(n);return this._eventMap[t].delete(n),0===this._eventMap[t].size&&delete this._eventMap[t],0===Object.keys(this._eventMap).length&&delete this._eventMap,i.apply(this,[e,r])},Object.defineProperty(r,"on"+t,{get:function(){return this["_on"+t]},set:function(e){this["_on"+t]&&(this.removeEventListener(t,this["_on"+t]),delete this["_on"+t]),e&&this.addEventListener(t,this["_on"+t]=e)},enumerable:!0,configurable:!0})}}function b(e){return"boolean"!=typeof e?new Error("Argument type: "+(void 0===e?"undefined":i(e))+". Please use a boolean."):(m=e,e?"adapter.js logging disabled":"adapter.js logging enabled")}function _(e){return"boolean"!=typeof e?new Error("Argument type: "+(void 0===e?"undefined":i(e))+". Please use a boolean."):(y=!e,"adapter.js deprecation warnings "+(e?"disabled":"enabled"))}function C(){if("object"==typeof window){if(m)return;"undefined"!=typeof console&&"function"==typeof console.log&&console.log.apply(console,arguments)}}function S(e,t){y&&console.warn(e+" is deprecated, please use "+t+" instead.")}function k(e){return"[object Object]"===Object.prototype.toString.call(e)}function w(e){return k(e)?Object.keys(e).reduce((function(t,n){var r=k(e[n]),o=r?w(e[n]):e[n],i=r&&!Object.keys(o).length;return void 0===o||i?t:Object.assign(t,h({},n,o))}),{}):e}function T(e,t,n){t&&!n.has(t.id)&&(n.set(t.id,t),Object.keys(t).forEach((function(r){r.endsWith("Id")?T(e,e.get(t[r]),n):r.endsWith("Ids")&&t[r].forEach((function(t){T(e,e.get(t),n)}))})))}function P(e,t,n){var r=n?"outbound-rtp":"inbound-rtp",o=new Map;if(null===t)return o;var i=[];return e.forEach((function(e){"track"===e.type&&e.trackIdentifier===t.id&&i.push(e)})),i.forEach((function(t){e.forEach((function(n){n.type===r&&n.trackId===t.id&&T(e,n,o)}))})),o}var R={};function E(e){if(Array.isArray(e))return e}function x(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}function O(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function D(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}function I(e,t){if(e){if("string"==typeof e)return D(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(n):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?D(e,t):void 0}}function M(e,t){return E(e)||x(e)||I(e,t)||O()}e(R,"shimMediaStream",(function(){return L})),e(R,"shimOnTrack",(function(){return F})),e(R,"shimGetSendersWithDtmf",(function(){return N})),e(R,"shimGetStats",(function(){return z})),e(R,"shimSenderReceiverGetStats",(function(){return U})),e(R,"shimAddTrackRemoveTrackWithNative",(function(){return V})),e(R,"shimAddTrackRemoveTrack",(function(){return J})),e(R,"shimPeerConnection",(function(){return G})),e(R,"fixNegotiationNeeded",(function(){return W})),e(R,"shimGetUserMedia",(function(){return A})),e(R,"shimGetDisplayMedia",(function(){return B}));var j=C;function A(e,t){var n=e&&e.navigator;if(n.mediaDevices){var r=function(e){if("object"!=typeof e||e.mandatory||e.optional)return e;var t={};return Object.keys(e).forEach((function(n){if("require"!==n&&"advanced"!==n&&"mediaSource"!==n){var r="object"==typeof e[n]?e[n]:{ideal:e[n]};void 0!==r.exact&&"number"==typeof r.exact&&(r.min=r.max=r.exact);var o=function(e,t){return e?e+t.charAt(0).toUpperCase()+t.slice(1):"deviceId"===t?"sourceId":t};if(void 0!==r.ideal){t.optional=t.optional||[];var i={};"number"==typeof r.ideal?(i[o("min",n)]=r.ideal,t.optional.push(i),(i={})[o("max",n)]=r.ideal,t.optional.push(i)):(i[o("",n)]=r.ideal,t.optional.push(i))}void 0!==r.exact&&"number"!=typeof r.exact?(t.mandatory=t.mandatory||{},t.mandatory[o("",n)]=r.exact):["min","max"].forEach((function(e){void 0!==r[e]&&(t.mandatory=t.mandatory||{},t.mandatory[o(e,n)]=r[e])}))}})),e.advanced&&(t.optional=(t.optional||[]).concat(e.advanced)),t},o=function(e,o){if(t.version>=61)return o(e);if((e=JSON.parse(JSON.stringify(e)))&&"object"==typeof e.audio){var i=function(e,t,n){t in e&&!(n in e)&&(e[n]=e[t],delete e[t])};i((e=JSON.parse(JSON.stringify(e))).audio,"autoGainControl","googAutoGainControl"),i(e.audio,"noiseSuppression","googNoiseSuppression"),e.audio=r(e.audio)}if(e&&"object"==typeof e.video){var a=e.video.facingMode;a=a&&("object"==typeof a?a:{ideal:a});var s,c=t.version<66;if(a&&("user"===a.exact||"environment"===a.exact||"user"===a.ideal||"environment"===a.ideal)&&(!n.mediaDevices.getSupportedConstraints||!n.mediaDevices.getSupportedConstraints().facingMode||c))if(delete e.video.facingMode,"environment"===a.exact||"environment"===a.ideal?s=["back","rear"]:"user"!==a.exact&&"user"!==a.ideal||(s=["front"]),s)return n.mediaDevices.enumerateDevices().then((function(t){var n=(t=t.filter((function(e){return"videoinput"===e.kind}))).find((function(e){return s.some((function(t){return e.label.toLowerCase().includes(t)}))}));return!n&&t.length&&s.includes("back")&&(n=t[t.length-1]),n&&(e.video.deviceId=a.exact?{exact:n.deviceId}:{ideal:n.deviceId}),e.video=r(e.video),j("chrome: "+JSON.stringify(e)),o(e)}));e.video=r(e.video)}return j("chrome: "+JSON.stringify(e)),o(e)},i=function(e){return t.version>=64?e:{name:{PermissionDeniedError:"NotAllowedError",PermissionDismissedError:"NotAllowedError",InvalidStateError:"NotAllowedError",DevicesNotFoundError:"NotFoundError",ConstraintNotSatisfiedError:"OverconstrainedError",TrackStartError:"NotReadableError",MediaDeviceFailedDueToShutdown:"NotAllowedError",MediaDeviceKillSwitchOn:"NotAllowedError",TabCaptureError:"AbortError",ScreenCaptureError:"AbortError",DeviceCaptureError:"AbortError"}[e.name]||e.name,message:e.message,constraint:e.constraint||e.constraintName,toString:function(){return this.name+(this.message&&": ")+this.message}}};if(n.getUserMedia=function(e,t,r){o(e,(function(e){n.webkitGetUserMedia(e,t,(function(e){r&&r(i(e))}))}))}.bind(n),n.mediaDevices.getUserMedia){var a=n.mediaDevices.getUserMedia.bind(n.mediaDevices);n.mediaDevices.getUserMedia=function(e){return o(e,(function(e){return a(e).then((function(t){if(e.audio&&!t.getAudioTracks().length||e.video&&!t.getVideoTracks().length)throw t.getTracks().forEach((function(e){e.stop()})),new DOMException("","NotFoundError");return t}),(function(e){return Promise.reject(i(e))}))}))}}}}function B(e,t){e.navigator.mediaDevices&&"getDisplayMedia"in e.navigator.mediaDevices||e.navigator.mediaDevices&&("function"==typeof t?e.navigator.mediaDevices.getDisplayMedia=function(n){return t(n).then((function(t){var r=n.video&&n.video.width,o=n.video&&n.video.height,i=n.video&&n.video.frameRate;return n.video={mandatory:{chromeMediaSource:"desktop",chromeMediaSourceId:t,maxFrameRate:i||3}},r&&(n.video.mandatory.maxWidth=r),o&&(n.video.mandatory.maxHeight=o),e.navigator.mediaDevices.getUserMedia(n)}))}:console.error("shimGetDisplayMedia: getSourceId argument is not a function"))}function L(e){e.MediaStream=e.MediaStream||e.webkitMediaStream}function F(e){if("object"==typeof e&&e.RTCPeerConnection&&!("ontrack"in e.RTCPeerConnection.prototype)){Object.defineProperty(e.RTCPeerConnection.prototype,"ontrack",{get:function(){return this._ontrack},set:function(e){this._ontrack&&this.removeEventListener("track",this._ontrack),this.addEventListener("track",this._ontrack=e)},enumerable:!0,configurable:!0});var t=e.RTCPeerConnection.prototype.setRemoteDescription;e.RTCPeerConnection.prototype.setRemoteDescription=function(){var n=this;return this._ontrackpoly||(this._ontrackpoly=function(t){t.stream.addEventListener("addtrack",(function(r){var o;o=e.RTCPeerConnection.prototype.getReceivers?n.getReceivers().find((function(e){return e.track&&e.track.id===r.track.id})):{track:r.track};var i=new Event("track");i.track=r.track,i.receiver=o,i.transceiver={receiver:o},i.streams=[t.stream],n.dispatchEvent(i)})),t.stream.getTracks().forEach((function(r){var o;o=e.RTCPeerConnection.prototype.getReceivers?n.getReceivers().find((function(e){return e.track&&e.track.id===r.id})):{track:r};var i=new Event("track");i.track=r,i.receiver=o,i.transceiver={receiver:o},i.streams=[t.stream],n.dispatchEvent(i)}))},this.addEventListener("addstream",this._ontrackpoly)),t.apply(this,arguments)}}else g(e,"track",(function(e){return e.transceiver||Object.defineProperty(e,"transceiver",{value:{receiver:e.receiver}}),e}))}function N(e){if("object"==typeof e&&e.RTCPeerConnection&&!("getSenders"in e.RTCPeerConnection.prototype)&&"createDTMFSender"in e.RTCPeerConnection.prototype){var t=function(e,t){return{track:t,get dtmf(){return void 0===this._dtmf&&("audio"===t.kind?this._dtmf=e.createDTMFSender(t):this._dtmf=null),this._dtmf},_pc:e}};if(!e.RTCPeerConnection.prototype.getSenders){e.RTCPeerConnection.prototype.getSenders=function(){return this._senders=this._senders||[],this._senders.slice()};var n=e.RTCPeerConnection.prototype.addTrack;e.RTCPeerConnection.prototype.addTrack=function(e,r){var o=n.apply(this,arguments);return o||(o=t(this,e),this._senders.push(o)),o};var r=e.RTCPeerConnection.prototype.removeTrack;e.RTCPeerConnection.prototype.removeTrack=function(e){r.apply(this,arguments);var t=this._senders.indexOf(e);-1!==t&&this._senders.splice(t,1)}}var o=e.RTCPeerConnection.prototype.addStream;e.RTCPeerConnection.prototype.addStream=function(e){var n=this;this._senders=this._senders||[],o.apply(this,[e]),e.getTracks().forEach((function(e){n._senders.push(t(n,e))}))};var i=e.RTCPeerConnection.prototype.removeStream;e.RTCPeerConnection.prototype.removeStream=function(e){var t=this;this._senders=this._senders||[],i.apply(this,[e]),e.getTracks().forEach((function(e){var n=t._senders.find((function(t){return t.track===e}));n&&t._senders.splice(t._senders.indexOf(n),1)}))}}else if("object"==typeof e&&e.RTCPeerConnection&&"getSenders"in e.RTCPeerConnection.prototype&&"createDTMFSender"in e.RTCPeerConnection.prototype&&e.RTCRtpSender&&!("dtmf"in e.RTCRtpSender.prototype)){var a=e.RTCPeerConnection.prototype.getSenders;e.RTCPeerConnection.prototype.getSenders=function(){var e=this,t=a.apply(this,[]);return t.forEach((function(t){return t._pc=e})),t},Object.defineProperty(e.RTCRtpSender.prototype,"dtmf",{get:function(){return void 0===this._dtmf&&("audio"===this.track.kind?this._dtmf=this._pc.createDTMFSender(this.track):this._dtmf=null),this._dtmf}})}}function z(e){if(e.RTCPeerConnection){var t=e.RTCPeerConnection.prototype.getStats;e.RTCPeerConnection.prototype.getStats=function(){var e=this,n=M(arguments,3),r=n[0],o=n[1],i=n[2];if(arguments.length>0&&"function"==typeof r)return t.apply(this,arguments);if(0===t.length&&(0===arguments.length||"function"!=typeof r))return t.apply(this,[]);var a=function(e){var t={};return e.result().forEach((function(e){var n={id:e.id,timestamp:e.timestamp,type:{localcandidate:"local-candidate",remotecandidate:"remote-candidate"}[e.type]||e.type};e.names().forEach((function(t){n[t]=e.stat(t)})),t[n.id]=n})),t},s=function(e){return new Map(Object.keys(e).map((function(t){return[t,e[t]]})))};if(arguments.length>=2){return t.apply(this,[function(e){o(s(a(e)))},r])}return new Promise((function(n,r){t.apply(e,[function(e){n(s(a(e)))},r])})).then(o,i)}}}function U(e){if("object"==typeof e&&e.RTCPeerConnection&&e.RTCRtpSender&&e.RTCRtpReceiver){if(!("getStats"in e.RTCRtpSender.prototype)){var t=e.RTCPeerConnection.prototype.getSenders;t&&(e.RTCPeerConnection.prototype.getSenders=function(){var e=this,n=t.apply(this,[]);return n.forEach((function(t){return t._pc=e})),n});var n=e.RTCPeerConnection.prototype.addTrack;n&&(e.RTCPeerConnection.prototype.addTrack=function(){var e=n.apply(this,arguments);return e._pc=this,e}),e.RTCRtpSender.prototype.getStats=function(){var e=this;return this._pc.getStats().then((function(t){return P(t,e.track,!0)}))}}if(!("getStats"in e.RTCRtpReceiver.prototype)){var r=e.RTCPeerConnection.prototype.getReceivers;r&&(e.RTCPeerConnection.prototype.getReceivers=function(){var e=this,t=r.apply(this,[]);return t.forEach((function(t){return t._pc=e})),t}),g(e,"track",(function(e){return e.receiver._pc=e.srcElement,e})),e.RTCRtpReceiver.prototype.getStats=function(){var e=this;return this._pc.getStats().then((function(t){return P(t,e.track,!1)}))}}if("getStats"in e.RTCRtpSender.prototype&&"getStats"in e.RTCRtpReceiver.prototype){var o=e.RTCPeerConnection.prototype.getStats;e.RTCPeerConnection.prototype.getStats=function(){if(arguments.length>0&&arguments[0]instanceof e.MediaStreamTrack){var t,n,r,i=arguments[0];return this.getSenders().forEach((function(e){e.track===i&&(t?r=!0:t=e)})),this.getReceivers().forEach((function(e){return e.track===i&&(n?r=!0:n=e),e.track===i})),r||t&&n?Promise.reject(new DOMException("There are more than one sender or receiver for the track.","InvalidAccessError")):t?t.getStats():n?n.getStats():Promise.reject(new DOMException("There is no sender or receiver for the track.","InvalidAccessError"))}return o.apply(this,arguments)}}}}function V(e){e.RTCPeerConnection.prototype.getLocalStreams=function(){var e=this;return this._shimmedLocalStreams=this._shimmedLocalStreams||{},Object.keys(this._shimmedLocalStreams).map((function(t){return e._shimmedLocalStreams[t][0]}))};var t=e.RTCPeerConnection.prototype.addTrack;e.RTCPeerConnection.prototype.addTrack=function(e,n){if(!n)return t.apply(this,arguments);this._shimmedLocalStreams=this._shimmedLocalStreams||{};var r=t.apply(this,arguments);return this._shimmedLocalStreams[n.id]?-1===this._shimmedLocalStreams[n.id].indexOf(r)&&this._shimmedLocalStreams[n.id].push(r):this._shimmedLocalStreams[n.id]=[n,r],r};var n=e.RTCPeerConnection.prototype.addStream;e.RTCPeerConnection.prototype.addStream=function(e){var t=this;this._shimmedLocalStreams=this._shimmedLocalStreams||{},e.getTracks().forEach((function(e){if(t.getSenders().find((function(t){return t.track===e})))throw new DOMException("Track already exists.","InvalidAccessError")}));var r=this.getSenders();n.apply(this,arguments);var o=this.getSenders().filter((function(e){return-1===r.indexOf(e)}));this._shimmedLocalStreams[e.id]=[e].concat(o)};var r=e.RTCPeerConnection.prototype.removeStream;e.RTCPeerConnection.prototype.removeStream=function(e){return this._shimmedLocalStreams=this._shimmedLocalStreams||{},delete this._shimmedLocalStreams[e.id],r.apply(this,arguments)};var o=e.RTCPeerConnection.prototype.removeTrack;e.RTCPeerConnection.prototype.removeTrack=function(e){var t=this;return this._shimmedLocalStreams=this._shimmedLocalStreams||{},e&&Object.keys(this._shimmedLocalStreams).forEach((function(n){var r=t._shimmedLocalStreams[n].indexOf(e);-1!==r&&t._shimmedLocalStreams[n].splice(r,1),1===t._shimmedLocalStreams[n].length&&delete t._shimmedLocalStreams[n]})),o.apply(this,arguments)}}function J(e,t){var n=function(e,t){var n=t.sdp;return Object.keys(e._reverseStreams||[]).forEach((function(t){var r=e._reverseStreams[t],o=e._streams[r.id];n=n.replace(new RegExp(o.id,"g"),r.id)})),new RTCSessionDescription({type:t.type,sdp:n})},r=function(e,t){var n=t.sdp;return Object.keys(e._reverseStreams||[]).forEach((function(t){var r=e._reverseStreams[t],o=e._streams[r.id];n=n.replace(new RegExp(r.id,"g"),o.id)})),new RTCSessionDescription({type:t.type,sdp:n})};if(e.RTCPeerConnection){if(e.RTCPeerConnection.prototype.addTrack&&t.version>=65)return V(e);var o=e.RTCPeerConnection.prototype.getLocalStreams;e.RTCPeerConnection.prototype.getLocalStreams=function(){var e=this,t=o.apply(this);return this._reverseStreams=this._reverseStreams||{},t.map((function(t){return e._reverseStreams[t.id]}))};var i=e.RTCPeerConnection.prototype.addStream;e.RTCPeerConnection.prototype.addStream=function(t){var n=this;if(this._streams=this._streams||{},this._reverseStreams=this._reverseStreams||{},t.getTracks().forEach((function(e){if(n.getSenders().find((function(t){return t.track===e})))throw new DOMException("Track already exists.","InvalidAccessError")})),!this._reverseStreams[t.id]){var r=new e.MediaStream(t.getTracks());this._streams[t.id]=r,this._reverseStreams[r.id]=t,t=r}i.apply(this,[t])};var a=e.RTCPeerConnection.prototype.removeStream;e.RTCPeerConnection.prototype.removeStream=function(e){this._streams=this._streams||{},this._reverseStreams=this._reverseStreams||{},a.apply(this,[this._streams[e.id]||e]),delete this._reverseStreams[this._streams[e.id]?this._streams[e.id].id:e.id],delete this._streams[e.id]},e.RTCPeerConnection.prototype.addTrack=function(t,n){var r=this;if("closed"===this.signalingState)throw new DOMException("The RTCPeerConnection's signalingState is 'closed'.","InvalidStateError");var o=[].slice.call(arguments,1);if(1!==o.length||!o[0].getTracks().find((function(e){return e===t})))throw new DOMException("The adapter.js addTrack polyfill only supports a single  stream which is associated with the specified track.","NotSupportedError");if(this.getSenders().find((function(e){return e.track===t})))throw new DOMException("Track already exists.","InvalidAccessError");this._streams=this._streams||{},this._reverseStreams=this._reverseStreams||{};var i=this._streams[n.id];if(i)i.addTrack(t),Promise.resolve().then((function(){r.dispatchEvent(new Event("negotiationneeded"))}));else{var a=new e.MediaStream([t]);this._streams[n.id]=a,this._reverseStreams[a.id]=n,this.addStream(a)}return this.getSenders().find((function(e){return e.track===t}))},["createOffer","createAnswer"].forEach((function(t){var r=e.RTCPeerConnection.prototype[t],o=h({},t,(function(){var e=this,t=arguments;return arguments.length&&"function"==typeof arguments[0]?r.apply(this,[function(r){var o=n(e,r);t[0].apply(null,[o])},function(e){t[1]&&t[1].apply(null,e)},arguments[2]]):r.apply(this,arguments).then((function(t){return n(e,t)}))}));e.RTCPeerConnection.prototype[t]=o[t]}));var s=e.RTCPeerConnection.prototype.setLocalDescription;e.RTCPeerConnection.prototype.setLocalDescription=function(){return arguments.length&&arguments[0].type?(arguments[0]=r(this,arguments[0]),s.apply(this,arguments)):s.apply(this,arguments)};var c=Object.getOwnPropertyDescriptor(e.RTCPeerConnection.prototype,"localDescription");Object.defineProperty(e.RTCPeerConnection.prototype,"localDescription",{get:function(){var e=c.get.apply(this);return""===e.type?e:n(this,e)}}),e.RTCPeerConnection.prototype.removeTrack=function(e){var t,n=this;if("closed"===this.signalingState)throw new DOMException("The RTCPeerConnection's signalingState is 'closed'.","InvalidStateError");if(!e._pc)throw new DOMException("Argument 1 of RTCPeerConnection.removeTrack does not implement interface RTCRtpSender.","TypeError");if(!(e._pc===this))throw new DOMException("Sender was not created by this connection.","InvalidAccessError");this._streams=this._streams||{},Object.keys(this._streams).forEach((function(r){n._streams[r].getTracks().find((function(t){return e.track===t}))&&(t=n._streams[r])})),t&&(1===t.getTracks().length?this.removeStream(this._reverseStreams[t.id]):t.removeTrack(e.track),this.dispatchEvent(new Event("negotiationneeded")))}}}function G(e,t){!e.RTCPeerConnection&&e.webkitRTCPeerConnection&&(e.RTCPeerConnection=e.webkitRTCPeerConnection),e.RTCPeerConnection&&t.version<53&&["setLocalDescription","setRemoteDescription","addIceCandidate"].forEach((function(t){var n=e.RTCPeerConnection.prototype[t],r=h({},t,(function(){return arguments[0]=new("addIceCandidate"===t?e.RTCIceCandidate:e.RTCSessionDescription)(arguments[0]),n.apply(this,arguments)}));e.RTCPeerConnection.prototype[t]=r[t]}))}function W(e,t){g(e,"negotiationneeded",(function(e){var n=e.target;if(!(t.version<72||n.getConfiguration&&"plan-b"===n.getConfiguration().sdpSemantics)||"stable"===n.signalingState)return e}))}var H={};function K(e){if(Array.isArray(e))return D(e)}function Y(){throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function Q(e){return K(e)||x(e)||I(e)||Y()}function q(e,t){var n=e&&e.navigator,r=e&&e.MediaStreamTrack;if(n.getUserMedia=function(e,t,r){S("navigator.getUserMedia","navigator.mediaDevices.getUserMedia"),n.mediaDevices.getUserMedia(e).then(t,r)},!(t.version>55&&"autoGainControl"in n.mediaDevices.getSupportedConstraints())){var o=function(e,t,n){t in e&&!(n in e)&&(e[n]=e[t],delete e[t])},i=n.mediaDevices.getUserMedia.bind(n.mediaDevices);if(n.mediaDevices.getUserMedia=function(e){return"object"==typeof e&&"object"==typeof e.audio&&(e=JSON.parse(JSON.stringify(e)),o(e.audio,"autoGainControl","mozAutoGainControl"),o(e.audio,"noiseSuppression","mozNoiseSuppression")),i(e)},r&&r.prototype.getSettings){var a=r.prototype.getSettings;r.prototype.getSettings=function(){var e=a.apply(this,arguments);return o(e,"mozAutoGainControl","autoGainControl"),o(e,"mozNoiseSuppression","noiseSuppression"),e}}if(r&&r.prototype.applyConstraints){var s=r.prototype.applyConstraints;r.prototype.applyConstraints=function(e){return"audio"===this.kind&&"object"==typeof e&&(e=JSON.parse(JSON.stringify(e)),o(e,"autoGainControl","mozAutoGainControl"),o(e,"noiseSuppression","mozNoiseSuppression")),s.apply(this,[e])}}}}function X(e,t){e.navigator.mediaDevices&&"getDisplayMedia"in e.navigator.mediaDevices||e.navigator.mediaDevices&&(e.navigator.mediaDevices.getDisplayMedia=function(n){if(!n||!n.video){var r=new DOMException("getDisplayMedia without video constraints is undefined");return r.name="NotFoundError",r.code=8,Promise.reject(r)}return!0===n.video?n.video={mediaSource:t}:n.video.mediaSource=t,e.navigator.mediaDevices.getUserMedia(n)})}function Z(e){"object"==typeof e&&e.RTCTrackEvent&&"receiver"in e.RTCTrackEvent.prototype&&!("transceiver"in e.RTCTrackEvent.prototype)&&Object.defineProperty(e.RTCTrackEvent.prototype,"transceiver",{get:function(){return{receiver:this.receiver}}})}function $(e,t){if("object"==typeof e&&(e.RTCPeerConnection||e.mozRTCPeerConnection)){!e.RTCPeerConnection&&e.mozRTCPeerConnection&&(e.RTCPeerConnection=e.mozRTCPeerConnection),t.version<53&&["setLocalDescription","setRemoteDescription","addIceCandidate"].forEach((function(t){var n=e.RTCPeerConnection.prototype[t],r=h({},t,(function(){return arguments[0]=new("addIceCandidate"===t?e.RTCIceCandidate:e.RTCSessionDescription)(arguments[0]),n.apply(this,arguments)}));e.RTCPeerConnection.prototype[t]=r[t]}));var n={inboundrtp:"inbound-rtp",outboundrtp:"outbound-rtp",candidatepair:"candidate-pair",localcandidate:"local-candidate",remotecandidate:"remote-candidate"},r=e.RTCPeerConnection.prototype.getStats;e.RTCPeerConnection.prototype.getStats=function(){var e=M(arguments,3),o=e[0],i=e[1],a=e[2];return r.apply(this,[o||null]).then((function(e){if(t.version<53&&!i)try{e.forEach((function(e){e.type=n[e.type]||e.type}))}catch(t){if("TypeError"!==t.name)throw t;e.forEach((function(t,r){e.set(r,Object.assign({},t,{type:n[t.type]||t.type}))}))}return e})).then(i,a)}}}function ee(e){if("object"==typeof e&&e.RTCPeerConnection&&e.RTCRtpSender&&(!e.RTCRtpSender||!("getStats"in e.RTCRtpSender.prototype))){var t=e.RTCPeerConnection.prototype.getSenders;t&&(e.RTCPeerConnection.prototype.getSenders=function(){var e=this,n=t.apply(this,[]);return n.forEach((function(t){return t._pc=e})),n});var n=e.RTCPeerConnection.prototype.addTrack;n&&(e.RTCPeerConnection.prototype.addTrack=function(){var e=n.apply(this,arguments);return e._pc=this,e}),e.RTCRtpSender.prototype.getStats=function(){return this.track?this._pc.getStats(this.track):Promise.resolve(new Map)}}}function te(e){if("object"==typeof e&&e.RTCPeerConnection&&e.RTCRtpSender&&(!e.RTCRtpSender||!("getStats"in e.RTCRtpReceiver.prototype))){var t=e.RTCPeerConnection.prototype.getReceivers;t&&(e.RTCPeerConnection.prototype.getReceivers=function(){var e=this,n=t.apply(this,[]);return n.forEach((function(t){return t._pc=e})),n}),g(e,"track",(function(e){return e.receiver._pc=e.srcElement,e})),e.RTCRtpReceiver.prototype.getStats=function(){return this._pc.getStats(this.track)}}}function ne(e){e.RTCPeerConnection&&!("removeStream"in e.RTCPeerConnection.prototype)&&(e.RTCPeerConnection.prototype.removeStream=function(e){var t=this;S("removeStream","removeTrack"),this.getSenders().forEach((function(n){n.track&&e.getTracks().includes(n.track)&&t.removeTrack(n)}))})}function re(e){e.DataChannel&&!e.RTCDataChannel&&(e.RTCDataChannel=e.DataChannel)}function oe(e){if("object"==typeof e&&e.RTCPeerConnection){var t=e.RTCPeerConnection.prototype.addTransceiver;t&&(e.RTCPeerConnection.prototype.addTransceiver=function(){this.setParametersPromises=[];var e=arguments[1]&&arguments[1].sendEncodings;void 0===e&&(e=[]);var n=(e=Q(e)).length>0;n&&e.forEach((function(e){if("rid"in e){if(!/^[a-z0-9]{0,16}$/i.test(e.rid))throw new TypeError("Invalid RID value provided.")}if("scaleResolutionDownBy"in e&&!(parseFloat(e.scaleResolutionDownBy)>=1))throw new RangeError("scale_resolution_down_by must be >= 1.0");if("maxFramerate"in e&&!(parseFloat(e.maxFramerate)>=0))throw new RangeError("max_framerate must be >= 0.0")}));var r=t.apply(this,arguments);if(n){var o=r.sender,i=o.getParameters();(!("encodings"in i)||1===i.encodings.length&&0===Object.keys(i.encodings[0]).length)&&(i.encodings=e,o.sendEncodings=e,this.setParametersPromises.push(o.setParameters(i).then((function(){delete o.sendEncodings})).catch((function(){delete o.sendEncodings}))))}return r})}}function ie(e){if("object"==typeof e&&e.RTCRtpSender){var t=e.RTCRtpSender.prototype.getParameters;t&&(e.RTCRtpSender.prototype.getParameters=function(){var e=t.apply(this,arguments);return"encodings"in e||(e.encodings=[].concat(this.sendEncodings||[{}])),e})}}function ae(e){if("object"==typeof e&&e.RTCPeerConnection){var t=e.RTCPeerConnection.prototype.createOffer;e.RTCPeerConnection.prototype.createOffer=function(){var e=this;return this.setParametersPromises&&this.setParametersPromises.length?Promise.all(this.setParametersPromises).then((function(){return t.apply(e,arguments)})).finally((function(){e.setParametersPromises=[]})):t.apply(this,arguments)}}}function se(e){if("object"==typeof e&&e.RTCPeerConnection){var t=e.RTCPeerConnection.prototype.createAnswer;e.RTCPeerConnection.prototype.createAnswer=function(){var e=this;return this.setParametersPromises&&this.setParametersPromises.length?Promise.all(this.setParametersPromises).then((function(){return t.apply(e,arguments)})).finally((function(){e.setParametersPromises=[]})):t.apply(this,arguments)}}}e(H,"shimOnTrack",(function(){return Z})),e(H,"shimPeerConnection",(function(){return $})),e(H,"shimSenderGetStats",(function(){return ee})),e(H,"shimReceiverGetStats",(function(){return te})),e(H,"shimRemoveStream",(function(){return ne})),e(H,"shimRTCDataChannel",(function(){return re})),e(H,"shimAddTransceiver",(function(){return oe})),e(H,"shimGetParameters",(function(){return ie})),e(H,"shimCreateOffer",(function(){return ae})),e(H,"shimCreateAnswer",(function(){return se})),e(H,"shimGetUserMedia",(function(){return q})),e(H,"shimGetDisplayMedia",(function(){return X}));var ce={};function ue(e){if("object"==typeof e&&e.RTCPeerConnection){if("getLocalStreams"in e.RTCPeerConnection.prototype||(e.RTCPeerConnection.prototype.getLocalStreams=function(){return this._localStreams||(this._localStreams=[]),this._localStreams}),!("addStream"in e.RTCPeerConnection.prototype)){var t=e.RTCPeerConnection.prototype.addTrack;e.RTCPeerConnection.prototype.addStream=function(e){var n=this;this._localStreams||(this._localStreams=[]),this._localStreams.includes(e)||this._localStreams.push(e),e.getAudioTracks().forEach((function(r){return t.call(n,r,e)})),e.getVideoTracks().forEach((function(r){return t.call(n,r,e)}))},e.RTCPeerConnection.prototype.addTrack=function(e){for(var n=arguments.length,r=new Array(n>1?n-1:0),o=1;o<n;o++)r[o-1]=arguments[o];var i=this;return r&&r.forEach((function(e){i._localStreams?i._localStreams.includes(e)||i._localStreams.push(e):i._localStreams=[e]})),t.apply(this,arguments)}}"removeStream"in e.RTCPeerConnection.prototype||(e.RTCPeerConnection.prototype.removeStream=function(e){var t=this;this._localStreams||(this._localStreams=[]);var n=this._localStreams.indexOf(e);if(-1!==n){this._localStreams.splice(n,1);var r=e.getTracks();this.getSenders().forEach((function(e){r.includes(e.track)&&t.removeTrack(e)}))}})}}function pe(e){if("object"==typeof e&&e.RTCPeerConnection&&("getRemoteStreams"in e.RTCPeerConnection.prototype||(e.RTCPeerConnection.prototype.getRemoteStreams=function(){return this._remoteStreams?this._remoteStreams:[]}),!("onaddstream"in e.RTCPeerConnection.prototype))){Object.defineProperty(e.RTCPeerConnection.prototype,"onaddstream",{get:function(){return this._onaddstream},set:function(e){var t=this;this._onaddstream&&(this.removeEventListener("addstream",this._onaddstream),this.removeEventListener("track",this._onaddstreampoly)),this.addEventListener("addstream",this._onaddstream=e),this.addEventListener("track",this._onaddstreampoly=function(e){e.streams.forEach((function(e){if(t._remoteStreams||(t._remoteStreams=[]),!t._remoteStreams.includes(e)){t._remoteStreams.push(e);var n=new Event("addstream");n.stream=e,t.dispatchEvent(n)}}))})}});var t=e.RTCPeerConnection.prototype.setRemoteDescription;e.RTCPeerConnection.prototype.setRemoteDescription=function(){var e=this;return this._onaddstreampoly||this.addEventListener("track",this._onaddstreampoly=function(t){t.streams.forEach((function(t){if(e._remoteStreams||(e._remoteStreams=[]),!(e._remoteStreams.indexOf(t)>=0)){e._remoteStreams.push(t);var n=new Event("addstream");n.stream=t,e.dispatchEvent(n)}}))}),t.apply(e,arguments)}}}function de(e){if("object"==typeof e&&e.RTCPeerConnection){var t=e.RTCPeerConnection.prototype,n=t.createOffer,r=t.createAnswer,o=t.setLocalDescription,i=t.setRemoteDescription,a=t.addIceCandidate;t.createOffer=function(e,t){var r=arguments.length>=2?arguments[2]:arguments[0],o=n.apply(this,[r]);return t?(o.then(e,t),Promise.resolve()):o},t.createAnswer=function(e,t){var n=arguments.length>=2?arguments[2]:arguments[0],o=r.apply(this,[n]);return t?(o.then(e,t),Promise.resolve()):o};var s=function(e,t,n){var r=o.apply(this,[e]);return n?(r.then(t,n),Promise.resolve()):r};t.setLocalDescription=s,s=function(e,t,n){var r=i.apply(this,[e]);return n?(r.then(t,n),Promise.resolve()):r},t.setRemoteDescription=s,s=function(e,t,n){var r=a.apply(this,[e]);return n?(r.then(t,n),Promise.resolve()):r},t.addIceCandidate=s}}function le(e){var t=e&&e.navigator;if(t.mediaDevices&&t.mediaDevices.getUserMedia){var n=t.mediaDevices,r=n.getUserMedia.bind(n);t.mediaDevices.getUserMedia=function(e){return r(fe(e))}}!t.getUserMedia&&t.mediaDevices&&t.mediaDevices.getUserMedia&&(t.getUserMedia=function(e,n,r){t.mediaDevices.getUserMedia(e).then(n,r)}.bind(t))}function fe(e){return e&&void 0!==e.video?Object.assign({},e,{video:w(e.video)}):e}function he(e){if(e.RTCPeerConnection){var t=e.RTCPeerConnection;e.RTCPeerConnection=function(e,n){if(e&&e.iceServers){for(var r=[],o=0;o<e.iceServers.length;o++){var i=e.iceServers[o];void 0===i.urls&&i.url?(S("RTCIceServer.url","RTCIceServer.urls"),(i=JSON.parse(JSON.stringify(i))).urls=i.url,delete i.url,r.push(i)):r.push(e.iceServers[o])}e.iceServers=r}return new t(e,n)},e.RTCPeerConnection.prototype=t.prototype,"generateCertificate"in t&&Object.defineProperty(e.RTCPeerConnection,"generateCertificate",{get:function(){return t.generateCertificate}})}}function me(e){"object"==typeof e&&e.RTCTrackEvent&&"receiver"in e.RTCTrackEvent.prototype&&!("transceiver"in e.RTCTrackEvent.prototype)&&Object.defineProperty(e.RTCTrackEvent.prototype,"transceiver",{get:function(){return{receiver:this.receiver}}})}function ye(e){var t=e.RTCPeerConnection.prototype.createOffer;e.RTCPeerConnection.prototype.createOffer=function(e){if(e){void 0!==e.offerToReceiveAudio&&(e.offerToReceiveAudio=!!e.offerToReceiveAudio);var n=this.getTransceivers().find((function(e){return"audio"===e.receiver.track.kind}));!1===e.offerToReceiveAudio&&n?"sendrecv"===n.direction?n.setDirection?n.setDirection("sendonly"):n.direction="sendonly":"recvonly"===n.direction&&(n.setDirection?n.setDirection("inactive"):n.direction="inactive"):!0!==e.offerToReceiveAudio||n||this.addTransceiver("audio",{direction:"recvonly"}),void 0!==e.offerToReceiveVideo&&(e.offerToReceiveVideo=!!e.offerToReceiveVideo);var r=this.getTransceivers().find((function(e){return"video"===e.receiver.track.kind}));!1===e.offerToReceiveVideo&&r?"sendrecv"===r.direction?r.setDirection?r.setDirection("sendonly"):r.direction="sendonly":"recvonly"===r.direction&&(r.setDirection?r.setDirection("inactive"):r.direction="inactive"):!0!==e.offerToReceiveVideo||r||this.addTransceiver("video",{direction:"recvonly"})}return t.apply(this,arguments)}}function ve(e){"object"!=typeof e||e.AudioContext||(e.AudioContext=e.webkitAudioContext)}e(ce,"shimLocalStreamsAPI",(function(){return ue})),e(ce,"shimRemoteStreamsAPI",(function(){return pe})),e(ce,"shimCallbacksAPI",(function(){return de})),e(ce,"shimGetUserMedia",(function(){return le})),e(ce,"shimConstraints",(function(){return fe})),e(ce,"shimRTCIceServerUrls",(function(){return he})),e(ce,"shimTrackEventTransceiver",(function(){return me})),e(ce,"shimCreateOfferLegacy",(function(){return ye})),e(ce,"shimAudioContext",(function(){return ve}));var ge={};e(ge,"shimRTCIceCandidate",(function(){return Ce})),e(ge,"shimRTCIceCandidateRelayProtocol",(function(){return Se})),e(ge,"shimMaxMessageSize",(function(){return ke})),e(ge,"shimSendThrowTypeError",(function(){return we})),e(ge,"shimConnectionState",(function(){return Te})),e(ge,"removeExtmapAllowMixed",(function(){return Pe})),e(ge,"shimAddIceCandidateNullOrEmpty",(function(){return Re})),e(ge,"shimParameterlessSetLocalDescription",(function(){return Ee}));var be={},_e={};function Ce(e){if(!(!e.RTCIceCandidate||e.RTCIceCandidate&&"foundation"in e.RTCIceCandidate.prototype)){var n=e.RTCIceCandidate;e.RTCIceCandidate=function(e){if("object"==typeof e&&e.candidate&&0===e.candidate.indexOf("a=")&&((e=JSON.parse(JSON.stringify(e))).candidate=e.candidate.substring(2)),e.candidate&&e.candidate.length){var r=new n(e),o=t(be).parseCandidate(e.candidate),i=Object.assign(r,o);return i.toJSON=function(){return{candidate:i.candidate,sdpMid:i.sdpMid,sdpMLineIndex:i.sdpMLineIndex,usernameFragment:i.usernameFragment}},i}return new n(e)},e.RTCIceCandidate.prototype=n.prototype,g(e,"icecandidate",(function(t){return t.candidate&&Object.defineProperty(t,"candidate",{value:new e.RTCIceCandidate(t.candidate),writable:"false"}),t}))}}function Se(e){!e.RTCIceCandidate||e.RTCIceCandidate&&"relayProtocol"in e.RTCIceCandidate.prototype||g(e,"icecandidate",(function(e){if(e.candidate){var n=t(be).parseCandidate(e.candidate.candidate);"relay"===n.type&&(e.candidate.relayProtocol={0:"tls",1:"tcp",2:"udp"}[n.priority>>24])}return e}))}function ke(e,n){if(e.RTCPeerConnection){"sctp"in e.RTCPeerConnection.prototype||Object.defineProperty(e.RTCPeerConnection.prototype,"sctp",{get:function(){return void 0===this._sctp?null:this._sctp}});var r=function(e){if(!e||!e.sdp)return!1;var n=t(be).splitSections(e.sdp);return n.shift(),n.some((function(e){var n=t(be).parseMLine(e);return n&&"application"===n.kind&&-1!==n.protocol.indexOf("SCTP")}))},o=function(e){var t=e.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);if(null===t||t.length<2)return-1;var n=parseInt(t[1],10);return n!=n?-1:n},i=function(e){var t=65536;return"firefox"===n.browser&&(t=n.version<57?-1===e?16384:2147483637:n.version<60?57===n.version?65535:65536:2147483637),t},a=function(e,r){var o=65536;"firefox"===n.browser&&57===n.version&&(o=65535);var i=t(be).matchPrefix(e.sdp,"a=max-message-size:");return i.length>0?o=parseInt(i[0].substring(19),10):"firefox"===n.browser&&-1!==r&&(o=2147483637),o},s=e.RTCPeerConnection.prototype.setRemoteDescription;e.RTCPeerConnection.prototype.setRemoteDescription=function(){(this._sctp=null,"chrome"===n.browser&&n.version>=76)&&("plan-b"===this.getConfiguration().sdpSemantics&&Object.defineProperty(this,"sctp",{get:function(){return void 0===this._sctp?null:this._sctp},enumerable:!0,configurable:!0}));if(r(arguments[0])){var e,t=o(arguments[0]),c=i(t),u=a(arguments[0],t);e=0===c&&0===u?Number.POSITIVE_INFINITY:0===c||0===u?Math.max(c,u):Math.min(c,u);var p={};Object.defineProperty(p,"maxMessageSize",{get:function(){return e}}),this._sctp=p}return s.apply(this,arguments)}}}function we(e){var t=function(e,t){var n=e.send;e.send=function(){var r=arguments[0],o=r.length||r.size||r.byteLength;if("open"===e.readyState&&t.sctp&&o>t.sctp.maxMessageSize)throw new TypeError("Message too large (can send a maximum of "+t.sctp.maxMessageSize+" bytes)");return n.apply(e,arguments)}};if(e.RTCPeerConnection&&"createDataChannel"in e.RTCPeerConnection.prototype){var n=e.RTCPeerConnection.prototype.createDataChannel;e.RTCPeerConnection.prototype.createDataChannel=function(){var e=n.apply(this,arguments);return t(e,this),e},g(e,"datachannel",(function(e){return t(e.channel,e.target),e}))}}function Te(e){if(e.RTCPeerConnection&&!("connectionState"in e.RTCPeerConnection.prototype)){var t=e.RTCPeerConnection.prototype;Object.defineProperty(t,"connectionState",{get:function(){return{completed:"connected",checking:"connecting"}[this.iceConnectionState]||this.iceConnectionState},enumerable:!0,configurable:!0}),Object.defineProperty(t,"onconnectionstatechange",{get:function(){return this._onconnectionstatechange||null},set:function(e){this._onconnectionstatechange&&(this.removeEventListener("connectionstatechange",this._onconnectionstatechange),delete this._onconnectionstatechange),e&&this.addEventListener("connectionstatechange",this._onconnectionstatechange=e)},enumerable:!0,configurable:!0}),["setLocalDescription","setRemoteDescription"].forEach((function(e){var n=t[e];t[e]=function(){return this._connectionstatechangepoly||(this._connectionstatechangepoly=function(e){var t=e.target;if(t._lastConnectionState!==t.connectionState){t._lastConnectionState=t.connectionState;var n=new Event("connectionstatechange",e);t.dispatchEvent(n)}return e},this.addEventListener("iceconnectionstatechange",this._connectionstatechangepoly)),n.apply(this,arguments)}}))}}function Pe(e,t){if(e.RTCPeerConnection&&!("chrome"===t.browser&&t.version>=71||"safari"===t.browser&&t.version>=605)){var n=e.RTCPeerConnection.prototype.setRemoteDescription;e.RTCPeerConnection.prototype.setRemoteDescription=function(t){if(t&&t.sdp&&-1!==t.sdp.indexOf("\na=extmap-allow-mixed")){var r=t.sdp.split("\n").filter((function(e){return"a=extmap-allow-mixed"!==e.trim()})).join("\n");e.RTCSessionDescription&&t instanceof e.RTCSessionDescription?arguments[0]=new e.RTCSessionDescription({type:t.type,sdp:r}):t.sdp=r}return n.apply(this,arguments)}}}function Re(e,t){if(e.RTCPeerConnection&&e.RTCPeerConnection.prototype){var n=e.RTCPeerConnection.prototype.addIceCandidate;n&&0!==n.length&&(e.RTCPeerConnection.prototype.addIceCandidate=function(){return arguments[0]?("chrome"===t.browser&&t.version<78||"firefox"===t.browser&&t.version<68||"safari"===t.browser)&&arguments[0]&&""===arguments[0].candidate?Promise.resolve():n.apply(this,arguments):(arguments[1]&&arguments[1].apply(null),Promise.resolve())})}}function Ee(e,t){if(e.RTCPeerConnection&&e.RTCPeerConnection.prototype){var n=e.RTCPeerConnection.prototype.setLocalDescription;n&&0!==n.length&&(e.RTCPeerConnection.prototype.setLocalDescription=function(){var e=this,t=arguments[0]||{};if("object"!=typeof t||t.type&&t.sdp)return n.apply(this,arguments);if(!(t={type:t.type,sdp:t.sdp}).type)switch(this.signalingState){case"stable":case"have-local-offer":case"have-remote-pranswer":t.type="offer";break;default:t.type="answer"}return t.sdp||"offer"!==t.type&&"answer"!==t.type?n.apply(this,[t]):("offer"===t.type?this.createOffer:this.createAnswer).apply(this).then((function(t){return n.apply(e,[t])}))})}}_e.generateIdentifier=function(){return Math.random().toString(36).substring(2,12)},_e.localCName=_e.generateIdentifier(),_e.splitLines=function(e){return e.trim().split("\n").map((function(e){return e.trim()}))},_e.splitSections=function(e){return e.split("\nm=").map((function(e,t){return(t>0?"m="+e:e).trim()+"\r\n"}))},_e.getDescription=function(e){var t=_e.splitSections(e);return t&&t[0]},_e.getMediaSections=function(e){var t=_e.splitSections(e);return t.shift(),t},_e.matchPrefix=function(e,t){return _e.splitLines(e).filter((function(e){return 0===e.indexOf(t)}))},_e.parseCandidate=function(e){for(var t,n={foundation:(t=0===e.indexOf("a=candidate:")?e.substring(12).split(" "):e.substring(10).split(" "))[0],component:{1:"rtp",2:"rtcp"}[t[1]]||t[1],protocol:t[2].toLowerCase(),priority:parseInt(t[3],10),ip:t[4],address:t[4],port:parseInt(t[5],10),type:t[7]},r=8;r<t.length;r+=2)switch(t[r]){case"raddr":n.relatedAddress=t[r+1];break;case"rport":n.relatedPort=parseInt(t[r+1],10);break;case"tcptype":n.tcpType=t[r+1];break;case"ufrag":n.ufrag=t[r+1],n.usernameFragment=t[r+1];break;default:void 0===n[t[r]]&&(n[t[r]]=t[r+1])}return n},_e.writeCandidate=function(e){var t=[];t.push(e.foundation);var n=e.component;"rtp"===n?t.push(1):"rtcp"===n?t.push(2):t.push(n),t.push(e.protocol.toUpperCase()),t.push(e.priority),t.push(e.address||e.ip),t.push(e.port);var r=e.type;return t.push("typ"),t.push(r),"host"!==r&&e.relatedAddress&&e.relatedPort&&(t.push("raddr"),t.push(e.relatedAddress),t.push("rport"),t.push(e.relatedPort)),e.tcpType&&"tcp"===e.protocol.toLowerCase()&&(t.push("tcptype"),t.push(e.tcpType)),(e.usernameFragment||e.ufrag)&&(t.push("ufrag"),t.push(e.usernameFragment||e.ufrag)),"candidate:"+t.join(" ")},_e.parseIceOptions=function(e){return e.substring(14).split(" ")},_e.parseRtpMap=function(e){var t=e.substring(9).split(" "),n={payloadType:parseInt(t.shift(),10)};return t=t[0].split("/"),n.name=t[0],n.clockRate=parseInt(t[1],10),n.channels=3===t.length?parseInt(t[2],10):1,n.numChannels=n.channels,n},_e.writeRtpMap=function(e){var t=e.payloadType;void 0!==e.preferredPayloadType&&(t=e.preferredPayloadType);var n=e.channels||e.numChannels||1;return"a=rtpmap:"+t+" "+e.name+"/"+e.clockRate+(1!==n?"/"+n:"")+"\r\n"},_e.parseExtmap=function(e){var t=e.substring(9).split(" ");return{id:parseInt(t[0],10),direction:t[0].indexOf("/")>0?t[0].split("/")[1]:"sendrecv",uri:t[1],attributes:t.slice(2).join(" ")}},_e.writeExtmap=function(e){return"a=extmap:"+(e.id||e.preferredId)+(e.direction&&"sendrecv"!==e.direction?"/"+e.direction:"")+" "+e.uri+(e.attributes?" "+e.attributes:"")+"\r\n"},_e.parseFmtp=function(e){for(var t,n={},r=e.substring(e.indexOf(" ")+1).split(";"),o=0;o<r.length;o++)n[(t=r[o].trim().split("="))[0].trim()]=t[1];return n},_e.writeFmtp=function(e){var t="",n=e.payloadType;if(void 0!==e.preferredPayloadType&&(n=e.preferredPayloadType),e.parameters&&Object.keys(e.parameters).length){var r=[];Object.keys(e.parameters).forEach((function(t){void 0!==e.parameters[t]?r.push(t+"="+e.parameters[t]):r.push(t)})),t+="a=fmtp:"+n+" "+r.join(";")+"\r\n"}return t},_e.parseRtcpFb=function(e){var t=e.substring(e.indexOf(" ")+1).split(" ");return{type:t.shift(),parameter:t.join(" ")}},_e.writeRtcpFb=function(e){var t="",n=e.payloadType;return void 0!==e.preferredPayloadType&&(n=e.preferredPayloadType),e.rtcpFeedback&&e.rtcpFeedback.length&&e.rtcpFeedback.forEach((function(e){t+="a=rtcp-fb:"+n+" "+e.type+(e.parameter&&e.parameter.length?" "+e.parameter:"")+"\r\n"})),t},_e.parseSsrcMedia=function(e){var t=e.indexOf(" "),n={ssrc:parseInt(e.substring(7,t),10)},r=e.indexOf(":",t);return r>-1?(n.attribute=e.substring(t+1,r),n.value=e.substring(r+1)):n.attribute=e.substring(t+1),n},_e.parseSsrcGroup=function(e){var t=e.substring(13).split(" ");return{semantics:t.shift(),ssrcs:t.map((function(e){return parseInt(e,10)}))}},_e.getMid=function(e){var t=_e.matchPrefix(e,"a=mid:")[0];if(t)return t.substring(6)},_e.parseFingerprint=function(e){var t=e.substring(14).split(" ");return{algorithm:t[0].toLowerCase(),value:t[1].toUpperCase()}},_e.getDtlsParameters=function(e,t){return{role:"auto",fingerprints:_e.matchPrefix(e+t,"a=fingerprint:").map(_e.parseFingerprint)}},_e.writeDtlsParameters=function(e,t){var n="a=setup:"+t+"\r\n";return e.fingerprints.forEach((function(e){n+="a=fingerprint:"+e.algorithm+" "+e.value+"\r\n"})),n},_e.parseCryptoLine=function(e){var t=e.substring(9).split(" ");return{tag:parseInt(t[0],10),cryptoSuite:t[1],keyParams:t[2],sessionParams:t.slice(3)}},_e.writeCryptoLine=function(e){return"a=crypto:"+e.tag+" "+e.cryptoSuite+" "+("object"==typeof e.keyParams?_e.writeCryptoKeyParams(e.keyParams):e.keyParams)+(e.sessionParams?" "+e.sessionParams.join(" "):"")+"\r\n"},_e.parseCryptoKeyParams=function(e){if(0!==e.indexOf("inline:"))return null;var t=e.substring(7).split("|");return{keyMethod:"inline",keySalt:t[0],lifeTime:t[1],mkiValue:t[2]?t[2].split(":")[0]:void 0,mkiLength:t[2]?t[2].split(":")[1]:void 0}},_e.writeCryptoKeyParams=function(e){return e.keyMethod+":"+e.keySalt+(e.lifeTime?"|"+e.lifeTime:"")+(e.mkiValue&&e.mkiLength?"|"+e.mkiValue+":"+e.mkiLength:"")},_e.getCryptoParameters=function(e,t){return _e.matchPrefix(e+t,"a=crypto:").map(_e.parseCryptoLine)},_e.getIceParameters=function(e,t){var n=_e.matchPrefix(e+t,"a=ice-ufrag:")[0],r=_e.matchPrefix(e+t,"a=ice-pwd:")[0];return n&&r?{usernameFragment:n.substring(12),password:r.substring(10)}:null},_e.writeIceParameters=function(e){var t="a=ice-ufrag:"+e.usernameFragment+"\r\na=ice-pwd:"+e.password+"\r\n";return e.iceLite&&(t+="a=ice-lite\r\n"),t},_e.parseRtpParameters=function(e){var t={codecs:[],headerExtensions:[],fecMechanisms:[],rtcp:[]},n=_e.splitLines(e)[0].split(" ");t.profile=n[2];for(var r=3;r<n.length;r++){var o=n[r],i=_e.matchPrefix(e,"a=rtpmap:"+o+" ")[0];if(i){var a=_e.parseRtpMap(i),s=_e.matchPrefix(e,"a=fmtp:"+o+" ");switch(a.parameters=s.length?_e.parseFmtp(s[0]):{},a.rtcpFeedback=_e.matchPrefix(e,"a=rtcp-fb:"+o+" ").map(_e.parseRtcpFb),t.codecs.push(a),a.name.toUpperCase()){case"RED":case"ULPFEC":t.fecMechanisms.push(a.name.toUpperCase())}}}_e.matchPrefix(e,"a=extmap:").forEach((function(e){t.headerExtensions.push(_e.parseExtmap(e))}));var c=_e.matchPrefix(e,"a=rtcp-fb:* ").map(_e.parseRtcpFb);return t.codecs.forEach((function(e){c.forEach((function(t){e.rtcpFeedback.find((function(e){return e.type===t.type&&e.parameter===t.parameter}))||e.rtcpFeedback.push(t)}))})),t},_e.writeRtpDescription=function(e,t){var n="";n+="m="+e+" ",n+=t.codecs.length>0?"9":"0",n+=" "+(t.profile||"UDP/TLS/RTP/SAVPF")+" ",n+=t.codecs.map((function(e){return void 0!==e.preferredPayloadType?e.preferredPayloadType:e.payloadType})).join(" ")+"\r\n",n+="c=IN IP4 0.0.0.0\r\n",n+="a=rtcp:9 IN IP4 0.0.0.0\r\n",t.codecs.forEach((function(e){n+=_e.writeRtpMap(e),n+=_e.writeFmtp(e),n+=_e.writeRtcpFb(e)}));var r=0;return t.codecs.forEach((function(e){e.maxptime>r&&(r=e.maxptime)})),r>0&&(n+="a=maxptime:"+r+"\r\n"),t.headerExtensions&&t.headerExtensions.forEach((function(e){n+=_e.writeExtmap(e)})),n},_e.parseRtpEncodingParameters=function(e){var t,n=[],r=_e.parseRtpParameters(e),o=-1!==r.fecMechanisms.indexOf("RED"),i=-1!==r.fecMechanisms.indexOf("ULPFEC"),a=_e.matchPrefix(e,"a=ssrc:").map((function(e){return _e.parseSsrcMedia(e)})).filter((function(e){return"cname"===e.attribute})),s=a.length>0&&a[0].ssrc,c=_e.matchPrefix(e,"a=ssrc-group:FID").map((function(e){return e.substring(17).split(" ").map((function(e){return parseInt(e,10)}))}));c.length>0&&c[0].length>1&&c[0][0]===s&&(t=c[0][1]),r.codecs.forEach((function(e){if("RTX"===e.name.toUpperCase()&&e.parameters.apt){var r={ssrc:s,codecPayloadType:parseInt(e.parameters.apt,10)};s&&t&&(r.rtx={ssrc:t}),n.push(r),o&&((r=JSON.parse(JSON.stringify(r))).fec={ssrc:s,mechanism:i?"red+ulpfec":"red"},n.push(r))}})),0===n.length&&s&&n.push({ssrc:s});var u=_e.matchPrefix(e,"b=");return u.length&&(u=0===u[0].indexOf("b=TIAS:")?parseInt(u[0].substring(7),10):0===u[0].indexOf("b=AS:")?950*parseInt(u[0].substring(5),10)-16e3:void 0,n.forEach((function(e){e.maxBitrate=u}))),n},_e.parseRtcpParameters=function(e){var t={},n=_e.matchPrefix(e,"a=ssrc:").map((function(e){return _e.parseSsrcMedia(e)})).filter((function(e){return"cname"===e.attribute}))[0];n&&(t.cname=n.value,t.ssrc=n.ssrc);var r=_e.matchPrefix(e,"a=rtcp-rsize");t.reducedSize=r.length>0,t.compound=0===r.length;var o=_e.matchPrefix(e,"a=rtcp-mux");return t.mux=o.length>0,t},_e.writeRtcpParameters=function(e){var t="";return e.reducedSize&&(t+="a=rtcp-rsize\r\n"),e.mux&&(t+="a=rtcp-mux\r\n"),void 0!==e.ssrc&&e.cname&&(t+="a=ssrc:"+e.ssrc+" cname:"+e.cname+"\r\n"),t},_e.parseMsid=function(e){var t,n=_e.matchPrefix(e,"a=msid:");if(1===n.length)return{stream:(t=n[0].substring(7).split(" "))[0],track:t[1]};var r=_e.matchPrefix(e,"a=ssrc:").map((function(e){return _e.parseSsrcMedia(e)})).filter((function(e){return"msid"===e.attribute}));return r.length>0?{stream:(t=r[0].value.split(" "))[0],track:t[1]}:void 0},_e.parseSctpDescription=function(e){var t,n=_e.parseMLine(e),r=_e.matchPrefix(e,"a=max-message-size:");r.length>0&&(t=parseInt(r[0].substring(19),10)),isNaN(t)&&(t=65536);var o=_e.matchPrefix(e,"a=sctp-port:");if(o.length>0)return{port:parseInt(o[0].substring(12),10),protocol:n.fmt,maxMessageSize:t};var i=_e.matchPrefix(e,"a=sctpmap:");if(i.length>0){var a=i[0].substring(10).split(" ");return{port:parseInt(a[0],10),protocol:a[1],maxMessageSize:t}}},_e.writeSctpDescription=function(e,t){var n=[];return n="DTLS/SCTP"!==e.protocol?["m="+e.kind+" 9 "+e.protocol+" "+t.protocol+"\r\n","c=IN IP4 0.0.0.0\r\n","a=sctp-port:"+t.port+"\r\n"]:["m="+e.kind+" 9 "+e.protocol+" "+t.port+"\r\n","c=IN IP4 0.0.0.0\r\n","a=sctpmap:"+t.port+" "+t.protocol+" 65535\r\n"],void 0!==t.maxMessageSize&&n.push("a=max-message-size:"+t.maxMessageSize+"\r\n"),n.join("")},_e.generateSessionId=function(){return Math.random().toString().substr(2,22)},_e.writeSessionBoilerplate=function(e,t,n){var r=void 0!==t?t:2;return"v=0\r\no="+(n||"thisisadapterortc")+" "+(e||_e.generateSessionId())+" "+r+" IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n"},_e.getDirection=function(e,t){for(var n=_e.splitLines(e),r=0;r<n.length;r++)switch(n[r]){case"a=sendrecv":case"a=sendonly":case"a=recvonly":case"a=inactive":return n[r].substring(2)}return t?_e.getDirection(t):"sendrecv"},_e.getKind=function(e){return _e.splitLines(e)[0].split(" ")[0].substring(2)},_e.isRejected=function(e){return"0"===e.split(" ",2)[1]},_e.parseMLine=function(e){var t=_e.splitLines(e)[0].substring(2).split(" ");return{kind:t[0],port:parseInt(t[1],10),protocol:t[2],fmt:t.slice(3).join(" ")}},_e.parseOLine=function(e){var t=_e.matchPrefix(e,"o=")[0].substring(2).split(" ");return{username:t[0],sessionId:t[1],sessionVersion:parseInt(t[2],10),netType:t[3],addressType:t[4],address:t[5]}},_e.isValidSDP=function(e){if("string"!=typeof e||0===e.length)return!1;for(var t=_e.splitLines(e),n=0;n<t.length;n++)if(t[n].length<2||"="!==t[n].charAt(1))return!1;return!0},be=_e;var xe,Oe,De=function(){var e=(arguments.length>0&&void 0!==arguments[0]?arguments[0]:{}).window,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{shimChrome:!0,shimFirefox:!0,shimSafari:!0},n=C,r=function(e){var t={browser:null,version:null};if(void 0===e||!e.navigator)return t.browser="Not a browser.",t;var n=e.navigator;if(n.mozGetUserMedia)t.browser="firefox",t.version=v(n.userAgent,/Firefox\/(\d+)\./,1);else if(n.webkitGetUserMedia||!1===e.isSecureContext&&e.webkitRTCPeerConnection)t.browser="chrome",t.version=v(n.userAgent,/Chrom(e|ium)\/(\d+)\./,2);else{if(!e.RTCPeerConnection||!n.userAgent.match(/AppleWebKit\/(\d+)\./))return t.browser="Not a supported browser.",t;t.browser="safari",t.version=v(n.userAgent,/AppleWebKit\/(\d+)\./,1),t.supportsUnifiedPlan=e.RTCRtpTransceiver&&"currentDirection"in e.RTCRtpTransceiver.prototype}return t}(e),o={browserDetails:r,commonShim:ge,extractVersion:v,disableLog:b,disableWarnings:_,sdp:be};switch(r.browser){case"chrome":if(!R||!R.shimPeerConnection||!t.shimChrome)return n("Chrome shim is not included in this adapter release."),o;if(null===r.version)return n("Chrome shim can not determine version, not shimming."),o;n("adapter.js shimming chrome."),o.browserShim=R,ge.shimAddIceCandidateNullOrEmpty(e,r),ge.shimParameterlessSetLocalDescription(e,r),R.shimGetUserMedia(e,r),R.shimMediaStream(e,r),R.shimPeerConnection(e,r),R.shimOnTrack(e,r),R.shimAddTrackRemoveTrack(e,r),R.shimGetSendersWithDtmf(e,r),R.shimGetStats(e,r),R.shimSenderReceiverGetStats(e,r),R.fixNegotiationNeeded(e,r),ge.shimRTCIceCandidate(e,r),ge.shimRTCIceCandidateRelayProtocol(e,r),ge.shimConnectionState(e,r),ge.shimMaxMessageSize(e,r),ge.shimSendThrowTypeError(e,r),ge.removeExtmapAllowMixed(e,r);break;case"firefox":if(!H||!H.shimPeerConnection||!t.shimFirefox)return n("Firefox shim is not included in this adapter release."),o;n("adapter.js shimming firefox."),o.browserShim=H,ge.shimAddIceCandidateNullOrEmpty(e,r),ge.shimParameterlessSetLocalDescription(e,r),H.shimGetUserMedia(e,r),H.shimPeerConnection(e,r),H.shimOnTrack(e,r),H.shimRemoveStream(e,r),H.shimSenderGetStats(e,r),H.shimReceiverGetStats(e,r),H.shimRTCDataChannel(e,r),H.shimAddTransceiver(e,r),H.shimGetParameters(e,r),H.shimCreateOffer(e,r),H.shimCreateAnswer(e,r),ge.shimRTCIceCandidate(e,r),ge.shimConnectionState(e,r),ge.shimMaxMessageSize(e,r),ge.shimSendThrowTypeError(e,r);break;case"safari":if(!ce||!t.shimSafari)return n("Safari shim is not included in this adapter release."),o;n("adapter.js shimming safari."),o.browserShim=ce,ge.shimAddIceCandidateNullOrEmpty(e,r),ge.shimParameterlessSetLocalDescription(e,r),ce.shimRTCIceServerUrls(e,r),ce.shimCreateOfferLegacy(e,r),ce.shimCallbacksAPI(e,r),ce.shimLocalStreamsAPI(e,r),ce.shimRemoteStreamsAPI(e,r),ce.shimTrackEventTransceiver(e,r),ce.shimGetUserMedia(e,r),ce.shimAudioContext(e,r),ge.shimRTCIceCandidate(e,r),ge.shimRTCIceCandidateRelayProtocol(e,r),ge.shimMaxMessageSize(e,r),ge.shimSendThrowTypeError(e,r),ge.removeExtmapAllowMixed(e,r);break;default:n("Unsupported browser!")}return o}({window:"undefined"==typeof window?void 0:window}),Ie=De,Me=Ie.default||Ie,je=new((xe=function(){this.isIOS=["iPad","iPhone","iPod"].includes(navigator.platform),this.supportedBrowsers=["firefox","chrome","safari"],this.minFirefoxVersion=59,this.minChromeVersion=72,this.minSafariVersion=605}).prototype.isWebRTCSupported=function(){return"undefined"!=typeof RTCPeerConnection},xe.prototype.isBrowserSupported=function(){var e=this.getBrowser(),t=this.getVersion();return!!this.supportedBrowsers.includes(e)&&("chrome"===e?t>=this.minChromeVersion:"firefox"===e?t>=this.minFirefoxVersion:"safari"===e&&!this.isIOS&&t>=this.minSafariVersion)},xe.prototype.getBrowser=function(){return Me.browserDetails.browser},xe.prototype.getVersion=function(){return Me.browserDetails.version||0},xe.prototype.isUnifiedPlanSupported=function(){var e,t=this.getBrowser(),n=Me.browserDetails.version||0;if("chrome"===t&&n<this.minChromeVersion)return!1;if("firefox"===t&&n>=this.minFirefoxVersion)return!0;if(!window.RTCRtpTransceiver||!("currentDirection"in RTCRtpTransceiver.prototype))return!1;var r=!1;try{(e=new RTCPeerConnection).addTransceiver("audio"),r=!0}catch(e){}finally{e&&e.close()}return r},xe.prototype.toString=function(){return"Supports:\n    browser:".concat(this.getBrowser(),"\n    version:").concat(this.getVersion(),"\n    isIOS:").concat(this.isIOS,"\n    isWebRTCSupported:").concat(this.isWebRTCSupported(),"\n    isBrowserSupported:").concat(this.isBrowserSupported(),"\n    isUnifiedPlanSupported:").concat(this.isUnifiedPlanSupported())},xe),Ae={iceServers:[{urls:"stun:stun.l.google.com:19302"},{urls:["turn:eu-0.turn.peerjs.com:3478","turn:us-0.turn.peerjs.com:3478"],username:"peerjs",credential:"peerjsp"}],sdpSemantics:"unified-plan"},Be=new((Oe=function(){this.CLOUD_HOST="0.peerjs.com",this.CLOUD_PORT=443,this.chunkedBrowsers={Chrome:1,chrome:1},this.chunkedMTU=16300,this.defaultConfig=Ae,this.browser=je.getBrowser(),this.browserVersion=je.getVersion(),this.supports=function(){var e,t={browser:je.isBrowserSupported(),webRTC:je.isWebRTCSupported(),audioVideo:!1,data:!1,binaryBlob:!1,reliable:!1};if(!t.webRTC)return t;try{e=new RTCPeerConnection(Ae),t.audioVideo=!0;var n=void 0;try{n=e.createDataChannel("_PEERJSTEST",{ordered:!0}),t.data=!0,t.reliable=!!n.ordered;try{n.binaryType="blob",t.binaryBlob=!je.isIOS}catch(e){}}catch(e){}finally{n&&n.close()}}catch(e){}finally{e&&e.close()}return t}(),this.pack=n.pack,this.unpack=n.unpack,this._dataCount=1}).prototype.noop=function(){},Oe.prototype.validateId=function(e){return!e||/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.test(e)},Oe.prototype.chunk=function(e){for(var t=[],n=e.size,r=Math.ceil(n/Be.chunkedMTU),o=0,i=0;i<n;){var a=Math.min(n,i+Be.chunkedMTU),s=e.slice(i,a),c={__peerData:this._dataCount,n:o,data:s,total:r};t.push(c),i=a,o++}return this._dataCount++,t},Oe.prototype.blobToArrayBuffer=function(e,t){var n=new FileReader;return n.onload=function(e){e.target&&t(e.target.result)},n.readAsArrayBuffer(e),n},Oe.prototype.binaryStringToArrayBuffer=function(e){for(var t=new Uint8Array(e.length),n=0;n<e.length;n++)t[n]=255&e.charCodeAt(n);return t.buffer},Oe.prototype.randomToken=function(){return Math.random().toString(36).slice(2)},Oe.prototype.isSecure=function(){return"https:"===location.protocol},Oe),Le={};e(Le,"Peer",(function(){return Zt}),(function(e){return Zt=e}));var Fe,Ne=Object.prototype.hasOwnProperty,ze="~";function Ue(){}function Ve(e,t,n){this.fn=e,this.context=t,this.once=n||!1}function Je(e,t,n,r,o){if("function"!=typeof n)throw new TypeError("The listener must be a function");var i=new Ve(n,r||e,o),a=ze?ze+t:t;return e._events[a]?e._events[a].fn?e._events[a]=[e._events[a],i]:e._events[a].push(i):(e._events[a]=i,e._eventsCount++),e}function Ge(e,t){0==--e._eventsCount?e._events=new Ue:delete e._events[t]}function We(){this._events=new Ue,this._eventsCount=0}Object.create&&(Ue.prototype=Object.create(null),(new Ue).__proto__||(ze=!1)),We.prototype.eventNames=function(){var e,t,n=[];if(0===this._eventsCount)return n;for(t in e=this._events)Ne.call(e,t)&&n.push(ze?t.slice(1):t);return Object.getOwnPropertySymbols?n.concat(Object.getOwnPropertySymbols(e)):n},We.prototype.listeners=function(e){var t=ze?ze+e:e,n=this._events[t];if(!n)return[];if(n.fn)return[n.fn];for(var r=0,o=n.length,i=new Array(o);r<o;r++)i[r]=n[r].fn;return i},We.prototype.listenerCount=function(e){var t=ze?ze+e:e,n=this._events[t];return n?n.fn?1:n.length:0},We.prototype.emit=function(e,t,n,r,o,i){var a=ze?ze+e:e;if(!this._events[a])return!1;var s,c,u=this._events[a],p=arguments.length;if(u.fn){switch(u.once&&this.removeListener(e,u.fn,void 0,!0),p){case 1:return u.fn.call(u.context),!0;case 2:return u.fn.call(u.context,t),!0;case 3:return u.fn.call(u.context,t,n),!0;case 4:return u.fn.call(u.context,t,n,r),!0;case 5:return u.fn.call(u.context,t,n,r,o),!0;case 6:return u.fn.call(u.context,t,n,r,o,i),!0}for(c=1,s=new Array(p-1);c<p;c++)s[c-1]=arguments[c];u.fn.apply(u.context,s)}else{var d,l=u.length;for(c=0;c<l;c++)switch(u[c].once&&this.removeListener(e,u[c].fn,void 0,!0),p){case 1:u[c].fn.call(u[c].context);break;case 2:u[c].fn.call(u[c].context,t);break;case 3:u[c].fn.call(u[c].context,t,n);break;case 4:u[c].fn.call(u[c].context,t,n,r);break;default:if(!s)for(d=1,s=new Array(p-1);d<p;d++)s[d-1]=arguments[d];u[c].fn.apply(u[c].context,s)}}return!0},We.prototype.on=function(e,t,n){return Je(this,e,t,n,!1)},We.prototype.once=function(e,t,n){return Je(this,e,t,n,!0)},We.prototype.removeListener=function(e,t,n,r){var o=ze?ze+e:e;if(!this._events[o])return this;if(!t)return Ge(this,o),this;var i=this._events[o];if(i.fn)i.fn!==t||r&&!i.once||n&&i.context!==n||Ge(this,o);else{for(var a=0,s=[],c=i.length;a<c;a++)(i[a].fn!==t||r&&!i[a].once||n&&i[a].context!==n)&&s.push(i[a]);s.length?this._events[o]=1===s.length?s[0]:s:Ge(this,o)}return this},We.prototype.removeAllListeners=function(e){var t;return e?(t=ze?ze+e:e,this._events[t]&&Ge(this,t)):(this._events=new Ue,this._eventsCount=0),this},We.prototype.off=We.prototype.removeListener,We.prototype.addListener=We.prototype.on,We.prefixed=ze,We.EventEmitter=We,Fe=We;var He={};e(He,"LogLevel",(function(){return Ke}),(function(e){return Ke=e})),e(He,"default",(function(){return pt}),(function(e){return pt=e}));var Ke,Ye,Qe=function(e,t){var n="function"==typeof Symbol&&e[Symbol.iterator];if(!n)return e;var r,o,i=n.call(e),a=[];try{for(;(void 0===t||t-- >0)&&!(r=i.next()).done;)a.push(r.value)}catch(e){o={error:e}}finally{try{r&&!r.done&&(n=i.return)&&n.call(i)}finally{if(o)throw o.error}}return a},qe=function(e,t,n){if(n||2===arguments.length)for(var r,o=0,i=t.length;o<i;o++)!r&&o in t||(r||(r=Array.prototype.slice.call(t,0,o)),r[o]=t[o]);return e.concat(r||Array.prototype.slice.call(t))},Xe="PeerJS: ";(Ye=Ke||(Ke={}))[Ye.Disabled=0]="Disabled",Ye[Ye.Errors=1]="Errors",Ye[Ye.Warnings=2]="Warnings",Ye[Ye.All=3]="All";var Ze,$e,et,tt,nt,rt,ot,it,at,st,ct,ut=(Ze=function(){this._logLevel=Ke.Disabled},Object.defineProperty(Ze.prototype,"logLevel",{get:function(){return this._logLevel},set:function(e){this._logLevel=e},enumerable:!1,configurable:!0}),Ze.prototype.log=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];this._logLevel>=Ke.All&&this._print.apply(this,qe([Ke.All],Qe(e),!1))},Ze.prototype.warn=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];this._logLevel>=Ke.Warnings&&this._print.apply(this,qe([Ke.Warnings],Qe(e),!1))},Ze.prototype.error=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];this._logLevel>=Ke.Errors&&this._print.apply(this,qe([Ke.Errors],Qe(e),!1))},Ze.prototype.setLogFunction=function(e){this._print=e},Ze.prototype._print=function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];var r=qe([Xe],Qe(t),!1);for(var o in r)r[o]instanceof Error&&(r[o]="("+r[o].name+") "+r[o].message);e>=Ke.All?console.log.apply(console,qe([],Qe(r),!1)):e>=Ke.Warnings?console.warn.apply(console,qe(["WARNING"],Qe(r),!1)):e>=Ke.Errors&&console.error.apply(console,qe(["ERROR"],Qe(r),!1))},Ze),pt=new ut,dt={};e(dt,"Socket",(function(){return _t}),(function(e){return _t=e})),(et=$e||($e={})).Data="data",et.Media="media",(nt=tt||(tt={})).BrowserIncompatible="browser-incompatible",nt.Disconnected="disconnected",nt.InvalidID="invalid-id",nt.InvalidKey="invalid-key",nt.Network="network",nt.PeerUnavailable="peer-unavailable",nt.SslUnavailable="ssl-unavailable",nt.ServerError="server-error",nt.SocketError="socket-error",nt.SocketClosed="socket-closed",nt.UnavailableID="unavailable-id",nt.WebRTC="webrtc",(ot=rt||(rt={})).Binary="binary",ot.BinaryUTF8="binary-utf8",ot.JSON="json",(at=it||(it={})).Message="message",at.Disconnected="disconnected",at.Error="error",at.Close="close",(ct=st||(st={})).Heartbeat="HEARTBEAT",ct.Candidate="CANDIDATE",ct.Offer="OFFER",ct.Answer="ANSWER",ct.Open="OPEN",ct.Error="ERROR",ct.IdTaken="ID-TAKEN",ct.InvalidKey="INVALID-KEY",ct.Leave="LEAVE",ct.Expire="EXPIRE";var lt;lt=JSON.parse('{"name":"peerjs","version":"1.4.7","keywords":["peerjs","webrtc","p2p","rtc"],"description":"PeerJS client","homepage":"https://peerjs.com","bugs":{"url":"https://github.com/peers/peerjs/issues"},"repository":{"type":"git","url":"https://github.com/peers/peerjs"},"license":"MIT","contributors":["Michelle Bu <michelle@michellebu.com>","afrokick <devbyru@gmail.com>","ericz <really.ez@gmail.com>","Jairo <kidandcat@gmail.com>","Jonas Gloning <34194370+jonasgloning@users.noreply.github.com>","Jairo Caro-Accino Viciana <jairo@galax.be>","Carlos Caballero <carlos.caballero.gonzalez@gmail.com>","hc <hheennrryy@gmail.com>","Muhammad Asif <capripio@gmail.com>","PrashoonB <prashoonbhattacharjee@gmail.com>","Harsh Bardhan Mishra <47351025+HarshCasper@users.noreply.github.com>","akotynski <aleksanderkotbury@gmail.com>","lmb <i@lmb.io>","Jairooo <jairocaro@msn.com>","Moritz Stückler <moritz.stueckler@gmail.com>","Simon <crydotsnakegithub@gmail.com>","Denis Lukov <denismassters@gmail.com>","Philipp Hancke <fippo@andyet.net>","Hans Oksendahl <hansoksendahl@gmail.com>","Jess <jessachandler@gmail.com>","khankuan <khankuan@gmail.com>","DUODVK <kurmanov.work@gmail.com>","XiZhao <kwang1imsa@gmail.com>","Matthias Lohr <matthias@lohr.me>","=frank tree <=frnktrb@googlemail.com>","Andre Eckardt <aeckardt@outlook.com>","Chris Cowan <agentme49@gmail.com>","Alex Chuev <alex@chuev.com>","alxnull <alxnull@e.mail.de>","Yemel Jardi <angel.jardi@gmail.com>","Ben Parnell <benjaminparnell.94@gmail.com>","Benny Lichtner <bennlich@gmail.com>","fresheneesz <bitetrudpublic@gmail.com>","bob.barstead@exaptive.com <bob.barstead@exaptive.com>","chandika <chandika@gmail.com>","emersion <contact@emersion.fr>","Christopher Van <cvan@users.noreply.github.com>","eddieherm <edhermoso@gmail.com>","Eduardo Pinho <enet4mikeenet@gmail.com>","Evandro Zanatta <ezanatta@tray.net.br>","Gardner Bickford <gardner@users.noreply.github.com>","Gian Luca <gianluca.cecchi@cynny.com>","PatrickJS <github@gdi2290.com>","jonnyf <github@jonathanfoss.co.uk>","Hizkia Felix <hizkifw@gmail.com>","Hristo Oskov <hristo.oskov@gmail.com>","Isaac Madwed <i.madwed@gmail.com>","Ilya Konanykhin <ilya.konanykhin@gmail.com>","jasonbarry <jasbarry@me.com>","Jonathan Burke <jonathan.burke.1311@googlemail.com>","Josh Hamit <josh.hamit@gmail.com>","Jordan Austin <jrax86@gmail.com>","Joel Wetzell <jwetzell@yahoo.com>","xizhao <kevin.wang@cloudera.com>","Alberto Torres <kungfoobar@gmail.com>","Jonathan Mayol <mayoljonathan@gmail.com>","Jefferson Felix <me@jsfelix.dev>","Rolf Erik Lekang <me@rolflekang.com>","Kevin Mai-Husan Chia <mhchia@users.noreply.github.com>","Pepijn de Vos <pepijndevos@gmail.com>","JooYoung <qkdlql@naver.com>","Tobias Speicher <rootcommander@gmail.com>","Steve Blaurock <sblaurock@gmail.com>","Kyrylo Shegeda <shegeda@ualberta.ca>","Diwank Singh Tomer <singh@diwank.name>","Sören Balko <Soeren.Balko@gmail.com>","Arpit Solanki <solankiarpit1997@gmail.com>","Yuki Ito <yuki@gnnk.net>","Artur Zayats <zag2art@gmail.com>"],"funding":{"type":"opencollective","url":"https://opencollective.com/peer"},"collective":{"type":"opencollective","url":"https://opencollective.com/peer"},"files":["dist/*"],"sideEffects":["lib/global.ts","lib/supports.ts"],"main":"dist/bundler.cjs","module":"dist/bundler.mjs","browser-minified":"dist/peerjs.min.js","browser-unminified":"dist/peerjs.js","types":"dist/types.d.ts","engines":{"node":">= 10"},"targets":{"types":{"source":"lib/exports.ts"},"main":{"source":"lib/exports.ts","sourceMap":{"inlineSources":true}},"module":{"source":"lib/exports.ts","includeNodeModules":["eventemitter3"],"sourceMap":{"inlineSources":true}},"browser-minified":{"context":"browser","outputFormat":"global","optimize":true,"engines":{"browsers":"cover 99%, not dead"},"source":"lib/global.ts"},"browser-unminified":{"context":"browser","outputFormat":"global","optimize":false,"engines":{"browsers":"cover 99%, not dead"},"source":"lib/global.ts"}},"scripts":{"contributors":"git-authors-cli --print=false && prettier --write package.json && git add package.json package-lock.json && git commit -m \\"chore(contributors): update and sort contributors list\\"","check":"tsc --noEmit","watch":"parcel watch","build":"rm -rf dist && parcel build","prepublishOnly":"npm run build","test":"jest","test:watch":"jest --watch","coverage":"jest --coverage --collectCoverageFrom=\\"./lib/**\\"","format":"prettier --write .","semantic-release":"semantic-release"},"devDependencies":{"@parcel/config-default":"^2.8.1","@parcel/packager-ts":"^2.8.1","@parcel/transformer-typescript-tsc":"^2.8.1","@parcel/transformer-typescript-types":"^2.8.1","@semantic-release/changelog":"^6.0.1","@semantic-release/git":"^10.0.1","@swc/core":"^1.3.27","@swc/jest":"^0.2.24","jest":"^29.3.1","jest-environment-jsdom":"^29.3.1","mock-socket":"^9.0.0","parcel":"^2.8.1","parcel-transformer-tsc-sourcemaps":"^1.0.2","prettier":"^2.6.2","semantic-release":"^20.0.0","typescript":"^4.5.5"},"dependencies":{"@swc/helpers":"^0.4.0","eventemitter3":"^4.0.7","peerjs-js-binarypack":"1.0.2","webrtc-adapter":"^8.0.0"}}');var ft,ht,mt,yt=(ft=function(e,t){return ft=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},ft(e,t)},function(e,t){var n=function(){this.constructor=e};if("function"!=typeof t&&null!==t)throw new TypeError("Class extends value "+String(t)+" is not a constructor or null");ft(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}),vt=function(e,t){var n="function"==typeof Symbol&&e[Symbol.iterator];if(!n)return e;var r,o,i=n.call(e),a=[];try{for(;(void 0===t||t-- >0)&&!(r=i.next()).done;)a.push(r.value)}catch(e){o={error:e}}finally{try{r&&!r.done&&(n=i.return)&&n.call(i)}finally{if(o)throw o.error}}return a},gt=function(e,t,n){if(n||2===arguments.length)for(var r,o=0,i=t.length;o<i;o++)!r&&o in t||(r||(r=Array.prototype.slice.call(t,0,o)),r[o]=t[o]);return e.concat(r||Array.prototype.slice.call(t))},bt=function(e){var t="function"==typeof Symbol&&Symbol.iterator,n=t&&e[t],r=0;if(n)return n.call(e);if(e&&"number"==typeof e.length)return{next:function(){return e&&r>=e.length&&(e=void 0),{value:e&&e[r++],done:!e}}};throw new TypeError(t?"Object is not iterable.":"Symbol.iterator is not defined.")},_t=(ht=Fe.EventEmitter,yt(mt=function(e,t,n,r,o,i){void 0===i&&(i=5e3);var a=ht.call(this)||this;a.pingInterval=i,a._disconnected=!0,a._messagesQueue=[];var s=e?"wss://":"ws://";return a._baseUrl=s+t+":"+n+r+"peerjs?key="+o,a},ht),mt.prototype.start=function(e,t){var n=this;this._id=e;var r="".concat(this._baseUrl,"&id=").concat(e,"&token=").concat(t);!this._socket&&this._disconnected&&(this._socket=new WebSocket(r+"&version="+lt.version),this._disconnected=!1,this._socket.onmessage=function(e){var t;try{t=JSON.parse(e.data),He.default.log("Server message received:",t)}catch(t){return void He.default.log("Invalid server message",e.data)}n.emit(it.Message,t)},this._socket.onclose=function(e){n._disconnected||(He.default.log("Socket closed.",e),n._cleanup(),n._disconnected=!0,n.emit(it.Disconnected))},this._socket.onopen=function(){n._disconnected||(n._sendQueuedMessages(),He.default.log("Socket open"),n._scheduleHeartbeat())})},mt.prototype._scheduleHeartbeat=function(){var e=this;this._wsPingTimer=setTimeout((function(){e._sendHeartbeat()}),this.pingInterval)},mt.prototype._sendHeartbeat=function(){if(this._wsOpen()){var e=JSON.stringify({type:st.Heartbeat});this._socket.send(e),this._scheduleHeartbeat()}else He.default.log("Cannot send heartbeat, because socket closed")},mt.prototype._wsOpen=function(){return!!this._socket&&1===this._socket.readyState},mt.prototype._sendQueuedMessages=function(){var e,t,n=gt([],vt(this._messagesQueue),!1);this._messagesQueue=[];try{for(var r=bt(n),o=r.next();!o.done;o=r.next()){var i=o.value;this.send(i)}}catch(t){e={error:t}}finally{try{o&&!o.done&&(t=r.return)&&t.call(r)}finally{if(e)throw e.error}}},mt.prototype.send=function(e){if(!this._disconnected)if(this._id)if(e.type){if(this._wsOpen()){var t=JSON.stringify(e);this._socket.send(t)}}else this.emit(it.Error,"Invalid message");else this._messagesQueue.push(e)},mt.prototype.close=function(){this._disconnected||(this._cleanup(),this._disconnected=!0)},mt.prototype._cleanup=function(){this._socket&&(this._socket.onopen=this._socket.onmessage=this._socket.onclose=null,this._socket.close(),this._socket=void 0),clearTimeout(this._wsPingTimer)},mt),Ct={};e(Ct,"MediaConnection",(function(){return jt}),(function(e){return jt=e}));var St={};e(St,"Negotiator",(function(){return Rt}),(function(e){return Rt=e}));var kt,wt=function(){return wt=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e},wt.apply(this,arguments)},Tt=function(e,t,n,r){return new(n||(n=Promise))((function(o,i){var a=function(e){try{c(r.next(e))}catch(e){i(e)}},s=function(e){try{c(r.throw(e))}catch(e){i(e)}},c=function(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(a,s)};c((r=r.apply(e,t||[])).next())}))},Pt=function(e,t){var n,r,o,i,a=function(e){return function(t){return s([e,t])}},s=function(a){if(n)throw new TypeError("Generator is already executing.");for(;i&&(i=0,a[0]&&(c=0)),c;)try{if(n=1,r&&(o=2&a[0]?r.return:a[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,a[1])).done)return o;switch(r=0,o&&(a=[2&a[0],o.value]),a[0]){case 0:case 1:o=a;break;case 4:return c.label++,{value:a[1],done:!1};case 5:c.label++,r=a[1],a=[0];continue;case 7:a=c.ops.pop(),c.trys.pop();continue;default:if(!(o=c.trys,(o=o.length>0&&o[o.length-1])||6!==a[0]&&2!==a[0])){c=0;continue}if(3===a[0]&&(!o||a[1]>o[0]&&a[1]<o[3])){c.label=a[1];break}if(6===a[0]&&c.label<o[1]){c.label=o[1],o=a;break}if(o&&c.label<o[2]){c.label=o[2],c.ops.push(a);break}o[2]&&c.ops.pop(),c.trys.pop();continue}a=t.call(e,c)}catch(e){a=[6,e],r=0}finally{n=o=0}if(5&a[0])throw a[1];return{value:a[0]?a[1]:void 0,done:!0}},c={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:a(0),throw:a(1),return:a(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i},Rt=((kt=function(e){this.connection=e}).prototype.startConnection=function(e){var t=this._startPeerConnection();if(this.connection.peerConnection=t,this.connection.type===$e.Media&&e._stream&&this._addTracksToConnection(e._stream,t),e.originator){if(this.connection.type===$e.Data){var n=this.connection,r={ordered:!!e.reliable},o=t.createDataChannel(n.label,r);n.initialize(o)}this._makeOffer()}else this.handleSDP("OFFER",e.sdp)},kt.prototype._startPeerConnection=function(){He.default.log("Creating RTCPeerConnection.");var e=new RTCPeerConnection(this.connection.provider.options.config);return this._setupListeners(e),e},kt.prototype._setupListeners=function(e){var t=this,n=this.connection.peer,r=this.connection.connectionId,o=this.connection.type,i=this.connection.provider;He.default.log("Listening for ICE candidates."),e.onicecandidate=function(e){e.candidate&&e.candidate.candidate&&(He.default.log("Received ICE candidates for ".concat(n,":"),e.candidate),i.socket.send({type:st.Candidate,payload:{candidate:e.candidate,type:o,connectionId:r},dst:n}))},e.oniceconnectionstatechange=function(){switch(e.iceConnectionState){case"failed":He.default.log("iceConnectionState is failed, closing connections to "+n),t.connection.emit("error",new Error("Negotiation of connection to "+n+" failed.")),t.connection.close();break;case"closed":He.default.log("iceConnectionState is closed, closing connections to "+n),t.connection.emit("error",new Error("Connection to "+n+" closed.")),t.connection.close();break;case"disconnected":He.default.log("iceConnectionState changed to disconnected on the connection with "+n);break;case"completed":e.onicecandidate=Be.noop}t.connection.emit("iceStateChanged",e.iceConnectionState)},He.default.log("Listening for data channel"),e.ondatachannel=function(e){He.default.log("Received data channel");var t=e.channel;i.getConnection(n,r).initialize(t)},He.default.log("Listening for remote stream"),e.ontrack=function(e){He.default.log("Received remote stream");var o=e.streams[0],a=i.getConnection(n,r);if(a.type===$e.Media){var s=a;t._addStreamToMediaConnection(o,s)}}},kt.prototype.cleanup=function(){He.default.log("Cleaning up PeerConnection to "+this.connection.peer);var e=this.connection.peerConnection;if(e){this.connection.peerConnection=null,e.onicecandidate=e.oniceconnectionstatechange=e.ondatachannel=e.ontrack=function(){};var t="closed"!==e.signalingState,n=!1;if(this.connection.type===$e.Data){var r=this.connection.dataChannel;r&&(n=!!r.readyState&&"closed"!==r.readyState)}(t||n)&&e.close()}},kt.prototype._makeOffer=function(){return Tt(this,void 0,Promise,(function(){var e,t,n,r,o,i,a;return Pt(this,(function(s){switch(s.label){case 0:e=this.connection.peerConnection,t=this.connection.provider,s.label=1;case 1:return s.trys.push([1,7,,8]),[4,e.createOffer(this.connection.options.constraints)];case 2:n=s.sent(),He.default.log("Created offer."),this.connection.options.sdpTransform&&"function"==typeof this.connection.options.sdpTransform&&(n.sdp=this.connection.options.sdpTransform(n.sdp)||n.sdp),s.label=3;case 3:return s.trys.push([3,5,,6]),[4,e.setLocalDescription(n)];case 4:return s.sent(),He.default.log("Set localDescription:",n,"for:".concat(this.connection.peer)),r={sdp:n,type:this.connection.type,connectionId:this.connection.connectionId,metadata:this.connection.metadata,browser:Be.browser},this.connection.type===$e.Data&&(o=this.connection,r=wt(wt({},r),{label:o.label,reliable:o.reliable,serialization:o.serialization})),t.socket.send({type:st.Offer,payload:r,dst:this.connection.peer}),[3,6];case 5:return"OperationError: Failed to set local offer sdp: Called in wrong state: kHaveRemoteOffer"!=(i=s.sent())&&(t.emitError(tt.WebRTC,i),He.default.log("Failed to setLocalDescription, ",i)),[3,6];case 6:return[3,8];case 7:return a=s.sent(),t.emitError(tt.WebRTC,a),He.default.log("Failed to createOffer, ",a),[3,8];case 8:return[2]}}))}))},kt.prototype._makeAnswer=function(){return Tt(this,void 0,Promise,(function(){var e,t,n,r,o;return Pt(this,(function(i){switch(i.label){case 0:e=this.connection.peerConnection,t=this.connection.provider,i.label=1;case 1:return i.trys.push([1,7,,8]),[4,e.createAnswer()];case 2:n=i.sent(),He.default.log("Created answer."),this.connection.options.sdpTransform&&"function"==typeof this.connection.options.sdpTransform&&(n.sdp=this.connection.options.sdpTransform(n.sdp)||n.sdp),i.label=3;case 3:return i.trys.push([3,5,,6]),[4,e.setLocalDescription(n)];case 4:return i.sent(),He.default.log("Set localDescription:",n,"for:".concat(this.connection.peer)),t.socket.send({type:st.Answer,payload:{sdp:n,type:this.connection.type,connectionId:this.connection.connectionId,browser:Be.browser},dst:this.connection.peer}),[3,6];case 5:return r=i.sent(),t.emitError(tt.WebRTC,r),He.default.log("Failed to setLocalDescription, ",r),[3,6];case 6:return[3,8];case 7:return o=i.sent(),t.emitError(tt.WebRTC,o),He.default.log("Failed to create answer, ",o),[3,8];case 8:return[2]}}))}))},kt.prototype.handleSDP=function(e,t){return Tt(this,void 0,Promise,(function(){var n,r,o,i;return Pt(this,(function(a){switch(a.label){case 0:t=new RTCSessionDescription(t),n=this.connection.peerConnection,r=this.connection.provider,He.default.log("Setting remote description",t),o=this,a.label=1;case 1:return a.trys.push([1,5,,6]),[4,n.setRemoteDescription(t)];case 2:return a.sent(),He.default.log("Set remoteDescription:".concat(e," for:").concat(this.connection.peer)),"OFFER"!==e?[3,4]:[4,o._makeAnswer()];case 3:a.sent(),a.label=4;case 4:return[3,6];case 5:return i=a.sent(),r.emitError(tt.WebRTC,i),He.default.log("Failed to setRemoteDescription, ",i),[3,6];case 6:return[2]}}))}))},kt.prototype.handleCandidate=function(e){return Tt(this,void 0,Promise,(function(){var t,n,r,o,i,a;return Pt(this,(function(s){switch(s.label){case 0:He.default.log("handleCandidate:",e),t=e.candidate,n=e.sdpMLineIndex,r=e.sdpMid,o=this.connection.peerConnection,i=this.connection.provider,s.label=1;case 1:return s.trys.push([1,3,,4]),[4,o.addIceCandidate(new RTCIceCandidate({sdpMid:r,sdpMLineIndex:n,candidate:t}))];case 2:return s.sent(),He.default.log("Added ICE candidate for:".concat(this.connection.peer)),[3,4];case 3:return a=s.sent(),i.emitError(tt.WebRTC,a),He.default.log("Failed to handleCandidate, ",a),[3,4];case 4:return[2]}}))}))},kt.prototype._addTracksToConnection=function(e,t){if(He.default.log("add tracks from stream ".concat(e.id," to peer connection")),!t.addTrack)return He.default.error("Your browser does't support RTCPeerConnection#addTrack. Ignored.");e.getTracks().forEach((function(n){t.addTrack(n,e)}))},kt.prototype._addStreamToMediaConnection=function(e,t){He.default.log("add stream ".concat(e.id," to media connection ").concat(t.connectionId)),t.addStream(e)},kt),Et={};e(Et,"BaseConnection",(function(){return Ot}),(function(e){return Ot=e}));var xt=function(){var e=function(t,n){return e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},e(t,n)};return function(t,n){var r=function(){this.constructor=t};if("function"!=typeof n&&null!==n)throw new TypeError("Class extends value "+String(n)+" is not a constructor or null");e(t,n),t.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r)}}(),Ot=function(e){var t=function(t,n,r){var o=e.call(this)||this;return o.peer=t,o.provider=n,o.options=r,o._open=!1,o.metadata=r.metadata,o};return xt(t,e),Object.defineProperty(t.prototype,"open",{get:function(){return this._open},enumerable:!1,configurable:!0}),t}(Fe.EventEmitter),Dt=function(){var e=function(t,n){return e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},e(t,n)};return function(t,n){var r=function(){this.constructor=t};if("function"!=typeof n&&null!==n)throw new TypeError("Class extends value "+String(n)+" is not a constructor or null");e(t,n),t.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r)}}(),It=function(){return It=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e},It.apply(this,arguments)},Mt=function(e){var t="function"==typeof Symbol&&Symbol.iterator,n=t&&e[t],r=0;if(n)return n.call(e);if(e&&"number"==typeof e.length)return{next:function(){return e&&r>=e.length&&(e=void 0),{value:e&&e[r++],done:!e}}};throw new TypeError(t?"Object is not iterable.":"Symbol.iterator is not defined.")},jt=function(e){function t(n,r,o){var i=e.call(this,n,r,o)||this;return i._localStream=i.options._stream,i.connectionId=i.options.connectionId||t.ID_PREFIX+Be.randomToken(),i._negotiator=new(0,St.Negotiator)(i),i._localStream&&i._negotiator.startConnection({_stream:i._localStream,originator:!0}),i}return Dt(t,e),Object.defineProperty(t.prototype,"type",{get:function(){return $e.Media},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"localStream",{get:function(){return this._localStream},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"remoteStream",{get:function(){return this._remoteStream},enumerable:!1,configurable:!0}),t.prototype.addStream=function(t){He.default.log("Receiving stream",t),this._remoteStream=t,e.prototype.emit.call(this,"stream",t)},t.prototype.handleMessage=function(e){var t=e.type,n=e.payload;switch(e.type){case st.Answer:this._negotiator.handleSDP(t,n.sdp),this._open=!0;break;case st.Candidate:this._negotiator.handleCandidate(n.candidate);break;default:He.default.warn("Unrecognized message type:".concat(t," from peer:").concat(this.peer))}},t.prototype.answer=function(e,t){var n,r;if(void 0===t&&(t={}),this._localStream)He.default.warn("Local stream already exists on this MediaConnection. Are you answering a call twice?");else{this._localStream=e,t&&t.sdpTransform&&(this.options.sdpTransform=t.sdpTransform),this._negotiator.startConnection(It(It({},this.options._payload),{_stream:e}));var o=this.provider._getMessages(this.connectionId);try{for(var i=Mt(o),a=i.next();!a.done;a=i.next()){var s=a.value;this.handleMessage(s)}}catch(e){n={error:e}}finally{try{a&&!a.done&&(r=i.return)&&r.call(i)}finally{if(n)throw n.error}}this._open=!0}},t.prototype.close=function(){this._negotiator&&(this._negotiator.cleanup(),this._negotiator=null),this._localStream=null,this._remoteStream=null,this.provider&&(this.provider._removeConnection(this),this.provider=null),this.options&&this.options._stream&&(this.options._stream=null),this.open&&(this._open=!1,e.prototype.emit.call(this,"close"))},t.ID_PREFIX="mc_",t}(Et.BaseConnection),At={};e(At,"DataConnection",(function(){return Ut}),(function(e){return Ut=e}));var Bt={};e(Bt,"EncodingQueue",(function(){return Ft}),(function(e){return Ft=e}));var Lt=function(){var e=function(t,n){return e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},e(t,n)};return function(t,n){var r=function(){this.constructor=t};if("function"!=typeof n&&null!==n)throw new TypeError("Class extends value "+String(n)+" is not a constructor or null");e(t,n),t.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r)}}(),Ft=function(e){var t=function(){var t=e.call(this)||this;return t.fileReader=new FileReader,t._queue=[],t._processing=!1,t.fileReader.onload=function(e){t._processing=!1,e.target&&t.emit("done",e.target.result),t.doNextTask()},t.fileReader.onerror=function(e){He.default.error("EncodingQueue error:",e),t._processing=!1,t.destroy(),t.emit("error",e)},t};return Lt(t,e),Object.defineProperty(t.prototype,"queue",{get:function(){return this._queue},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"size",{get:function(){return this.queue.length},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"processing",{get:function(){return this._processing},enumerable:!1,configurable:!0}),t.prototype.enque=function(e){this.queue.push(e),this.processing||this.doNextTask()},t.prototype.destroy=function(){this.fileReader.abort(),this._queue=[]},t.prototype.doNextTask=function(){0!==this.size&&(this.processing||(this._processing=!0,this.fileReader.readAsArrayBuffer(this.queue.shift())))},t}(Fe.EventEmitter),Nt=function(){var e=function(t,n){return e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},e(t,n)};return function(t,n){var r=function(){this.constructor=t};if("function"!=typeof n&&null!==n)throw new TypeError("Class extends value "+String(n)+" is not a constructor or null");e(t,n),t.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r)}}(),zt=function(e){var t="function"==typeof Symbol&&Symbol.iterator,n=t&&e[t],r=0;if(n)return n.call(e);if(e&&"number"==typeof e.length)return{next:function(){return e&&r>=e.length&&(e=void 0),{value:e&&e[r++],done:!e}}};throw new TypeError(t?"Object is not iterable.":"Symbol.iterator is not defined.")},Ut=function(e){function t(n,r,o){var i=e.call(this,n,r,o)||this;return i.stringify=JSON.stringify,i.parse=JSON.parse,i._buffer=[],i._bufferSize=0,i._buffering=!1,i._chunkedData={},i._encodingQueue=new(0,Bt.EncodingQueue),i.connectionId=i.options.connectionId||t.ID_PREFIX+Be.randomToken(),i.label=i.options.label||i.connectionId,i.serialization=i.options.serialization||rt.Binary,i.reliable=!!i.options.reliable,i._encodingQueue.on("done",(function(e){i._bufferedSend(e)})),i._encodingQueue.on("error",(function(){He.default.error("DC#".concat(i.connectionId,": Error occured in encoding from blob to arraybuffer, close DC")),i.close()})),i._negotiator=new(0,St.Negotiator)(i),i._negotiator.startConnection(i.options._payload||{originator:!0}),i}return Nt(t,e),Object.defineProperty(t.prototype,"type",{get:function(){return $e.Data},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"dataChannel",{get:function(){return this._dc},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"bufferSize",{get:function(){return this._bufferSize},enumerable:!1,configurable:!0}),t.prototype.initialize=function(e){this._dc=e,this._configureDataChannel()},t.prototype._configureDataChannel=function(){var e=this;Be.supports.binaryBlob&&!Be.supports.reliable||(this.dataChannel.binaryType="arraybuffer"),this.dataChannel.onopen=function(){He.default.log("DC#".concat(e.connectionId," dc connection success")),e._open=!0,e.emit("open")},this.dataChannel.onmessage=function(t){He.default.log("DC#".concat(e.connectionId," dc onmessage:"),t.data),e._handleDataMessage(t)},this.dataChannel.onclose=function(){He.default.log("DC#".concat(e.connectionId," dc closed for:"),e.peer),e.close()}},t.prototype._handleDataMessage=function(t){var n=this,r=t.data,o=r.constructor,i=r;if(this.serialization===rt.Binary||this.serialization===rt.BinaryUTF8){if(o===Blob)return void Be.blobToArrayBuffer(r,(function(e){var t=Be.unpack(e);n.emit("data",t)}));if(o===ArrayBuffer)i=Be.unpack(r);else if(o===String){var a=Be.binaryStringToArrayBuffer(r);i=Be.unpack(a)}}else this.serialization===rt.JSON&&(i=this.parse(r));i.__peerData?this._handleChunk(i):e.prototype.emit.call(this,"data",i)},t.prototype._handleChunk=function(e){var t=e.__peerData,n=this._chunkedData[t]||{data:[],count:0,total:e.total};if(n.data[e.n]=e.data,n.count++,this._chunkedData[t]=n,n.total===n.count){delete this._chunkedData[t];var r=new Blob(n.data);this._handleDataMessage({data:r})}},t.prototype.close=function(){this._buffer=[],this._bufferSize=0,this._chunkedData={},this._negotiator&&(this._negotiator.cleanup(),this._negotiator=null),this.provider&&(this.provider._removeConnection(this),this.provider=null),this.dataChannel&&(this.dataChannel.onopen=null,this.dataChannel.onmessage=null,this.dataChannel.onclose=null,this._dc=null),this._encodingQueue&&(this._encodingQueue.destroy(),this._encodingQueue.removeAllListeners(),this._encodingQueue=null),this.open&&(this._open=!1,e.prototype.emit.call(this,"close"))},t.prototype.send=function(t,n){if(this.open)if(this.serialization===rt.JSON)this._bufferedSend(this.stringify(t));else if(this.serialization===rt.Binary||this.serialization===rt.BinaryUTF8){var r=Be.pack(t);if(!n&&r.size>Be.chunkedMTU)return void this._sendChunks(r);Be.supports.binaryBlob?this._bufferedSend(r):this._encodingQueue.enque(r)}else this._bufferedSend(t);else e.prototype.emit.call(this,"error",new Error("Connection is not open. You should listen for the `open` event before sending messages."))},t.prototype._bufferedSend=function(e){!this._buffering&&this._trySend(e)||(this._buffer.push(e),this._bufferSize=this._buffer.length)},t.prototype._trySend=function(e){var n=this;if(!this.open)return!1;if(this.dataChannel.bufferedAmount>t.MAX_BUFFERED_AMOUNT)return this._buffering=!0,setTimeout((function(){n._buffering=!1,n._tryBuffer()}),50),!1;try{this.dataChannel.send(e)}catch(e){return He.default.error("DC#:".concat(this.connectionId," Error when sending:"),e),this._buffering=!0,this.close(),!1}return!0},t.prototype._tryBuffer=function(){if(this.open&&0!==this._buffer.length){var e=this._buffer[0];this._trySend(e)&&(this._buffer.shift(),this._bufferSize=this._buffer.length,this._tryBuffer())}},t.prototype._sendChunks=function(e){var t,n,r=Be.chunk(e);He.default.log("DC#".concat(this.connectionId," Try to send ").concat(r.length," chunks..."));try{for(var o=zt(r),i=o.next();!i.done;i=o.next()){var a=i.value;this.send(a,!0)}}catch(e){t={error:e}}finally{try{i&&!i.done&&(n=o.return)&&n.call(o)}finally{if(t)throw t.error}}},t.prototype.handleMessage=function(e){var t=e.payload;switch(e.type){case st.Answer:this._negotiator.handleSDP(e.type,t.sdp);break;case st.Candidate:this._negotiator.handleCandidate(t.candidate);break;default:He.default.warn("Unrecognized message type:",e.type,"from peer:",this.peer)}},t.ID_PREFIX="dc_",t.MAX_BUFFERED_AMOUNT=8388608,t}(Et.BaseConnection),Vt={};e(Vt,"API",(function(){return Ht}),(function(e){return Ht=e}));var Jt,Gt=function(e,t,n,r){return new(n||(n=Promise))((function(o,i){var a=function(e){try{c(r.next(e))}catch(e){i(e)}},s=function(e){try{c(r.throw(e))}catch(e){i(e)}},c=function(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(a,s)};c((r=r.apply(e,t||[])).next())}))},Wt=function(e,t){var n,r,o,i,a=function(e){return function(t){return s([e,t])}},s=function(a){if(n)throw new TypeError("Generator is already executing.");for(;i&&(i=0,a[0]&&(c=0)),c;)try{if(n=1,r&&(o=2&a[0]?r.return:a[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,a[1])).done)return o;switch(r=0,o&&(a=[2&a[0],o.value]),a[0]){case 0:case 1:o=a;break;case 4:return c.label++,{value:a[1],done:!1};case 5:c.label++,r=a[1],a=[0];continue;case 7:a=c.ops.pop(),c.trys.pop();continue;default:if(!(o=c.trys,(o=o.length>0&&o[o.length-1])||6!==a[0]&&2!==a[0])){c=0;continue}if(3===a[0]&&(!o||a[1]>o[0]&&a[1]<o[3])){c.label=a[1];break}if(6===a[0]&&c.label<o[1]){c.label=o[1],o=a;break}if(o&&c.label<o[2]){c.label=o[2],c.ops.push(a);break}o[2]&&c.ops.pop(),c.trys.pop();continue}a=t.call(e,c)}catch(e){a=[6,e],r=0}finally{n=o=0}if(5&a[0])throw a[1];return{value:a[0]?a[1]:void 0,done:!0}},c={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:a(0),throw:a(1),return:a(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i},Ht=((Jt=function(e){this._options=e}).prototype._buildRequest=function(e){var t=this._options.secure?"https":"http",n=this._options,r=n.host,o=n.port,i=n.path,a=n.key,s=new URL("".concat(t,"://").concat(r,":").concat(o).concat(i).concat(a,"/").concat(e));return s.searchParams.set("ts","".concat(Date.now()).concat(Math.random())),s.searchParams.set("version",lt.version),fetch(s.href,{referrerPolicy:this._options.referrerPolicy})},Jt.prototype.retrieveId=function(){return Gt(this,void 0,Promise,(function(){var e,t,n;return Wt(this,(function(r){switch(r.label){case 0:return r.trys.push([0,2,,3]),[4,this._buildRequest("id")];case 1:if(200!==(e=r.sent()).status)throw new Error("Error. Status:".concat(e.status));return[2,e.text()];case 2:throw t=r.sent(),He.default.error("Error retrieving ID",t),n="","/"===this._options.path&&this._options.host!==Be.CLOUD_HOST&&(n=" If you passed in a `path` to your self-hosted PeerServer, you'll also need to pass in that same path when creating a new Peer."),new Error("Could not get an ID from the server."+n);case 3:return[2]}}))}))},Jt.prototype.listAllPeers=function(){return Gt(this,void 0,Promise,(function(){var e,t,n;return Wt(this,(function(r){switch(r.label){case 0:return r.trys.push([0,2,,3]),[4,this._buildRequest("peers")];case 1:if(200!==(e=r.sent()).status){if(401===e.status)throw t="",t=this._options.host===Be.CLOUD_HOST?"It looks like you're using the cloud server. You can email team@peerjs.com to enable peer listing for your API key.":"You need to enable `allow_discovery` on your self-hosted PeerServer to use this feature.",new Error("It doesn't look like you have permission to list peers IDs. "+t);throw new Error("Error. Status:".concat(e.status))}return[2,e.json()];case 2:throw n=r.sent(),He.default.error("Error retrieving list peers",n),new Error("Could not get list peers from the server."+n);case 3:return[2]}}))}))},Jt),Kt=function(){var e=function(t,n){return e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},e(t,n)};return function(t,n){var r=function(){this.constructor=t};if("function"!=typeof n&&null!==n)throw new TypeError("Class extends value "+String(n)+" is not a constructor or null");e(t,n),t.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r)}}(),Yt=function(){return Yt=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e},Yt.apply(this,arguments)},Qt=function(e){var t="function"==typeof Symbol&&Symbol.iterator,n=t&&e[t],r=0;if(n)return n.call(e);if(e&&"number"==typeof e.length)return{next:function(){return e&&r>=e.length&&(e=void 0),{value:e&&e[r++],done:!e}}};throw new TypeError(t?"Object is not iterable.":"Symbol.iterator is not defined.")},qt=function(e,t){var n="function"==typeof Symbol&&e[Symbol.iterator];if(!n)return e;var r,o,i=n.call(e),a=[];try{for(;(void 0===t||t-- >0)&&!(r=i.next()).done;)a.push(r.value)}catch(e){o={error:e}}finally{try{r&&!r.done&&(n=i.return)&&n.call(i)}finally{if(o)throw o.error}}return a},Xt=function(e){var t=function(t,n){var r=this;return"string"==typeof n?r=e.call(this,n)||this:(r=e.call(this)||this,Object.assign(r,n)),r.type=t,r};return Kt(t,e),t}(Error),Zt=function(e){function t(n,r){var o,i=e.call(this)||this;return i._id=null,i._lastServerId=null,i._destroyed=!1,i._disconnected=!1,i._open=!1,i._connections=new Map,i._lostMessages=new Map,n&&n.constructor==Object?r=n:n&&(o=n.toString()),r=Yt({debug:0,host:Be.CLOUD_HOST,port:Be.CLOUD_PORT,path:"/",key:t.DEFAULT_KEY,token:Be.randomToken(),config:Be.defaultConfig,referrerPolicy:"strict-origin-when-cross-origin"},r),i._options=r,"/"===i._options.host&&(i._options.host=window.location.hostname),i._options.path&&("/"!==i._options.path[0]&&(i._options.path="/"+i._options.path),"/"!==i._options.path[i._options.path.length-1]&&(i._options.path+="/")),void 0===i._options.secure&&i._options.host!==Be.CLOUD_HOST?i._options.secure=Be.isSecure():i._options.host==Be.CLOUD_HOST&&(i._options.secure=!0),i._options.logFunction&&He.default.setLogFunction(i._options.logFunction),He.default.logLevel=i._options.debug||0,i._api=new(0,Vt.API)(r),i._socket=i._createServerConnection(),Be.supports.audioVideo||Be.supports.data?o&&!Be.validateId(o)?(i._delayedAbort(tt.InvalidID,'ID "'.concat(o,'" is invalid')),i):(o?i._initialize(o):i._api.retrieveId().then((function(e){return i._initialize(e)})).catch((function(e){return i._abort(tt.ServerError,e)})),i):(i._delayedAbort(tt.BrowserIncompatible,"The current browser does not support WebRTC"),i)}return Kt(t,e),Object.defineProperty(t.prototype,"id",{get:function(){return this._id},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"options",{get:function(){return this._options},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"open",{get:function(){return this._open},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"socket",{get:function(){return this._socket},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"connections",{get:function(){var e,t,n=Object.create(null);try{for(var r=Qt(this._connections),o=r.next();!o.done;o=r.next()){var i=qt(o.value,2),a=i[0],s=i[1];n[a]=s}}catch(t){e={error:t}}finally{try{o&&!o.done&&(t=r.return)&&t.call(r)}finally{if(e)throw e.error}}return n},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"destroyed",{get:function(){return this._destroyed},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"disconnected",{get:function(){return this._disconnected},enumerable:!1,configurable:!0}),t.prototype._createServerConnection=function(){var e=this,t=new(0,dt.Socket)(this._options.secure,this._options.host,this._options.port,this._options.path,this._options.key,this._options.pingInterval);return t.on(it.Message,(function(t){e._handleMessage(t)})),t.on(it.Error,(function(t){e._abort(tt.SocketError,t)})),t.on(it.Disconnected,(function(){e.disconnected||(e.emitError(tt.Network,"Lost connection to server."),e.disconnect())})),t.on(it.Close,(function(){e.disconnected||e._abort(tt.SocketClosed,"Underlying socket is already closed.")})),t},t.prototype._initialize=function(e){this._id=e,this.socket.start(e,this._options.token)},t.prototype._handleMessage=function(e){var t,n,r=e.type,o=e.payload,i=e.src;switch(r){case st.Open:this._lastServerId=this.id,this._open=!0,this.emit("open",this.id);break;case st.Error:this._abort(tt.ServerError,o.msg);break;case st.IdTaken:this._abort(tt.UnavailableID,'ID "'.concat(this.id,'" is taken'));break;case st.InvalidKey:this._abort(tt.InvalidKey,'API KEY "'.concat(this._options.key,'" is invalid'));break;case st.Leave:He.default.log("Received leave message from ".concat(i)),this._cleanupPeer(i),this._connections.delete(i);break;case st.Expire:this.emitError(tt.PeerUnavailable,"Could not connect to peer ".concat(i));break;case st.Offer:var a=o.connectionId;if((f=this.getConnection(i,a))&&(f.close(),He.default.warn("Offer received for existing Connection ID:".concat(a))),o.type===$e.Media){var s=new(0,Ct.MediaConnection)(i,this,{connectionId:a,_payload:o,metadata:o.metadata});f=s,this._addConnection(i,f),this.emit("call",s)}else{if(o.type!==$e.Data)return void He.default.warn("Received malformed connection type:".concat(o.type));var c=new(0,At.DataConnection)(i,this,{connectionId:a,_payload:o,metadata:o.metadata,label:o.label,serialization:o.serialization,reliable:o.reliable});f=c,this._addConnection(i,f),this.emit("connection",c)}var u=this._getMessages(a);try{for(var p=Qt(u),d=p.next();!d.done;d=p.next()){var l=d.value;f.handleMessage(l)}}catch(e){t={error:e}}finally{try{d&&!d.done&&(n=p.return)&&n.call(p)}finally{if(t)throw t.error}}break;default:if(!o)return void He.default.warn("You received a malformed message from ".concat(i," of type ").concat(r));var f;a=o.connectionId;(f=this.getConnection(i,a))&&f.peerConnection?f.handleMessage(e):a?this._storeMessage(a,e):He.default.warn("You received an unrecognized message:",e)}},t.prototype._storeMessage=function(e,t){this._lostMessages.has(e)||this._lostMessages.set(e,[]),this._lostMessages.get(e).push(t)},t.prototype._getMessages=function(e){var t=this._lostMessages.get(e);return t?(this._lostMessages.delete(e),t):[]},t.prototype.connect=function(e,t){if(void 0===t&&(t={}),this.disconnected)return He.default.warn("You cannot connect to a new Peer because you called .disconnect() on this Peer and ended your connection with the server. You can create a new Peer to reconnect, or call reconnect on this peer if you believe its ID to still be available."),void this.emitError(tt.Disconnected,"Cannot connect to new Peer after disconnecting from server.");var n=new(0,At.DataConnection)(e,this,t);return this._addConnection(e,n),n},t.prototype.call=function(e,t,n){if(void 0===n&&(n={}),this.disconnected)return He.default.warn("You cannot connect to a new Peer because you called .disconnect() on this Peer and ended your connection with the server. You can create a new Peer to reconnect."),void this.emitError(tt.Disconnected,"Cannot connect to new Peer after disconnecting from server.");if(t){var r=new(0,Ct.MediaConnection)(e,this,Yt(Yt({},n),{_stream:t}));return this._addConnection(e,r),r}He.default.error("To call a peer, you must provide a stream from your browser's `getUserMedia`.")},t.prototype._addConnection=function(e,t){He.default.log("add connection ".concat(t.type,":").concat(t.connectionId," to peerId:").concat(e)),this._connections.has(e)||this._connections.set(e,[]),this._connections.get(e).push(t)},t.prototype._removeConnection=function(e){var t=this._connections.get(e.peer);if(t){var n=t.indexOf(e);-1!==n&&t.splice(n,1)}this._lostMessages.delete(e.connectionId)},t.prototype.getConnection=function(e,t){var n,r,o=this._connections.get(e);if(!o)return null;try{for(var i=Qt(o),a=i.next();!a.done;a=i.next()){var s=a.value;if(s.connectionId===t)return s}}catch(e){n={error:e}}finally{try{a&&!a.done&&(r=i.return)&&r.call(i)}finally{if(n)throw n.error}}return null},t.prototype._delayedAbort=function(e,t){var n=this;setTimeout((function(){n._abort(e,t)}),0)},t.prototype._abort=function(e,t){He.default.error("Aborting!"),this.emitError(e,t),this._lastServerId?this.disconnect():this.destroy()},t.prototype.emitError=function(e,t){He.default.error("Error:",t),this.emit("error",new Xt(e,t))},t.prototype.destroy=function(){this.destroyed||(He.default.log("Destroy peer with ID:".concat(this.id)),this.disconnect(),this._cleanup(),this._destroyed=!0,this.emit("close"))},t.prototype._cleanup=function(){var e,t;try{for(var n=Qt(this._connections.keys()),r=n.next();!r.done;r=n.next()){var o=r.value;this._cleanupPeer(o),this._connections.delete(o)}}catch(t){e={error:t}}finally{try{r&&!r.done&&(t=n.return)&&t.call(n)}finally{if(e)throw e.error}}this.socket.removeAllListeners()},t.prototype._cleanupPeer=function(e){var t,n,r=this._connections.get(e);if(r)try{for(var o=Qt(r),i=o.next();!i.done;i=o.next()){i.value.close()}}catch(e){t={error:e}}finally{try{i&&!i.done&&(n=o.return)&&n.call(o)}finally{if(t)throw t.error}}},t.prototype.disconnect=function(){if(!this.disconnected){var e=this.id;He.default.log("Disconnect peer with ID:".concat(e)),this._disconnected=!0,this._open=!1,this.socket.close(),this._lastServerId=e,this._id=null,this.emit("disconnected",e)}},t.prototype.reconnect=function(){if(this.disconnected&&!this.destroyed)He.default.log("Attempting reconnection to server with ID ".concat(this._lastServerId)),this._disconnected=!1,this._initialize(this._lastServerId);else{if(this.destroyed)throw new Error("This peer cannot reconnect to the server. It has already been destroyed.");if(this.disconnected||this.open)throw new Error("Peer ".concat(this.id," cannot reconnect because it is not disconnected from the server!"));He.default.error("In a hurry? We're still trying to make the initial connection!")}},t.prototype.listAllPeers=function(e){var t=this;void 0===e&&(e=function(e){}),this._api.listAllPeers().then((function(t){return e(t)})).catch((function(e){return t._abort(tt.ServerError,e)}))},t.DEFAULT_KEY="peerjs",t}(Fe.EventEmitter);window.peerjs={Peer:Le.Peer,util:Be},window.Peer=Le.Peer}();

/*!
 * VisualEditor DataModel rebase document state class.
 *
 * @copyright See AUTHORS.txt
 */

'use strict';

/**
 * DataModel rebase document state
 *
 * @class
 *
 * @constructor
 */
ve.dm.RebaseDocState = function VeDmRebaseDocState() {
	/**
	 * @property {ve.dm.Change} history History as one big change
	 */
	this.history = new ve.dm.Change();

	/**
	 * @property {Map.<number, Object>} authors Information about each author
	 */
	this.authors = new Map();
};

/* Inheritance */

OO.initClass( ve.dm.RebaseDocState );

/* Static Methods */

/**
 * Get new empty author data object
 *
 * @return {Object} New empty author data object
 * @return {string} return.name
 * @return {string} return.color
 * @return {number} return.rejections Number of unacknowledged rejections
 * @return {ve.dm.Change|null} return.continueBase Continue base
 * @return {string} return.token Secret token for usurping sessions
 * @return {boolean} return.active Whether the author is active
 */
ve.dm.RebaseDocState.static.newAuthorData = function () {
	return {
		name: '',
		color: '',
		rejections: 0,
		continueBase: null,
		// TODO use cryptographic randomness here and convert to hex
		token: Math.random().toString(),
		active: true
	};
};

/* Methods */

ve.dm.RebaseDocState.prototype.getActiveAuthors = function () {
	const result = {};
	this.authors.forEach( function ( authorData, authorId ) {
		if ( authorData.active ) {
			result[ authorId ] = {
				name: authorData.name,
				color: authorData.color
			};
		}
	} );
	return result;
};

ve.dm.RebaseDocState.prototype.clearHistory = function () {
	this.history = new ve.dm.Change();
	this.authors.forEach( function ( authorData ) {
		authorData.continueBase = null;
	} );
};

/*!
 * VisualEditor DataModel rebase server class.
 *
 * @copyright See AUTHORS.txt
 */

'use strict';

/**
 * DataModel rebase server
 *
 * @class
 *
 * @constructor
 * @param {Function} [logCallback]
 */
ve.dm.RebaseServer = function VeDmRebaseServer( logCallback ) {
	this.stateForDoc = new Map();
	this.logEvent = logCallback || function () {};
};

OO.initClass( ve.dm.RebaseServer );

/* Methods */

/**
 * Get the state of a document by name.
 *
 * @param {string} doc Name of a document
 * @return {ve.dm.RebaseDocState} Document state
 */
ve.dm.RebaseServer.prototype.getDocState = function ( doc ) {
	if ( !this.stateForDoc.has( doc ) ) {
		this.stateForDoc.set( doc, new ve.dm.RebaseDocState() );
	}
	return this.stateForDoc.get( doc );
};

/**
 * Update document history
 *
 * @param {string} doc Name of a document
 * @param {number|null} authorId Author ID
 * @param {ve.dm.Change} [newHistory] New history to append
 * @param {Object} [authorDataChanges] New values for author data (modified keys only)
 */
ve.dm.RebaseServer.prototype.updateDocState = function updateDocState( doc, authorId, newHistory, authorDataChanges ) {
	const state = this.getDocState( doc );
	if ( newHistory ) {
		state.history.push( newHistory );
	}
	if ( !authorId ) {
		return;
	}
	let authorData = state.authors.get( authorId );
	if ( !authorData ) {
		authorData = state.constructor.static.newAuthorData();
		state.authors.set( authorId, authorData );
	}
	if ( authorDataChanges ) {
		for ( const key in authorData ) {
			if ( authorDataChanges[ key ] !== undefined ) {
				authorData[ key ] = authorDataChanges[ key ];
			}
		}
	}
};

/**
 * Forget all history for a document
 *
 * @param {string} doc Name of a document
 */
ve.dm.RebaseServer.prototype.clearDocState = function clearDocState( doc ) {
	const state = this.stateForDoc.get( doc );
	if ( !state ) {
		return;
	}
	state.clearHistory();
};

/**
 * Attempt to rebase and apply a change to a document.
 *
 * The change can be a new change, or a continued change. A continuated change means one that
 * follows on immediately from the author's last submitted change, other than possibly being
 * rebased onto some more recent committed history.
 *
 * @param {string} doc Document name
 * @param {number} authorId Author ID
 * @param {number} backtrack How many transactions are backtracked from the previous submission
 * @param {ve.dm.Change} change Change to apply
 * @return {ve.dm.Change} Accepted change (or initial segment thereof), as rebased
 */
ve.dm.RebaseServer.prototype.applyChange = function applyChange( doc, authorId, backtrack, change ) {
	const state = this.getDocState( doc ),
		authorData = state.authors.get( authorId );

	let appliedChange;

	let base = ( authorData && authorData.continueBase ) || change.truncate( 0 );
	let rejections = ( authorData && authorData.rejections ) || 0;
	if ( rejections > backtrack ) {
		// Follow-on does not fully acknowledge outstanding conflicts: reject entirely
		rejections = rejections - backtrack + change.transactions.length;
		this.updateDocState( doc, authorId, null, { rejections: rejections } );
		// FIXME argh this publishes an empty change, which is not what we want
		appliedChange = state.history.truncate( 0 );
	} else if ( rejections < backtrack ) {
		throw new Error( 'Backtrack=' + backtrack + ' > ' + rejections + '=rejections' );
	} else {
		if ( change.start > base.start ) {
			// Remote has rebased some committed changes into its history since base was built.
			// They are guaranteed to be equivalent to the start of base. See mathematical
			// docs for proof (Cuius rei demonstrationem mirabilem sane deteximus hanc marginis
			// exiguitas non caperet).
			base = base.mostRecent( change.start );
		}
		base = base.concat( state.history.mostRecent( base.start + base.getLength() ) );

		const result = ve.dm.Change.static.rebaseUncommittedChange( base, change );
		rejections = result.rejected ? result.rejected.getLength() : 0;
		this.updateDocState( doc, authorId, result.rebased, {
			rejections: rejections,
			continueBase: result.transposedHistory
		} );
		appliedChange = result.rebased;
	}
	this.logEvent( {
		type: 'applyChange',
		doc: doc,
		authorId: authorId,
		incoming: change,
		applied: appliedChange,
		backtrack: backtrack,
		rejections: rejections
	} );
	return appliedChange;
};

/*!
 * VisualEditor document store class.
 *
 * @copyright See AUTHORS.txt
 */

'use strict';

/**
 * @constructor
 * @param {Object} storageClient MongoClient-like object; passed as a parameter for testing purposes
 * @param {string} dbName Database name
 * @param {Object} logger Logger class
 * @param {Function} logger.logServerEvent Stringify object argument to log, adding timestamp and server ID properties
 */
ve.dm.DocumentStore = function VeDmDocumentStore( storageClient, dbName, logger ) {
	this.storageClient = storageClient;
	this.dbName = dbName;
	this.logger = logger;
	this.db = null;
	this.collection = null;
	this.startForDoc = new Map();
	this.serverId = null;
};

/**
 * @return {Promise} Resolves when connected
 */
ve.dm.DocumentStore.prototype.connect = function () {
	const documentStore = this;
	return this.storageClient.connect().then( function ( client ) {
		const db = client.db( documentStore.dbName );
		documentStore.logger.logServerEvent( { type: 'DocumentStore#connected', dbName: documentStore.dbName }, 'info' );
		documentStore.db = db;
		documentStore.collection = db.collection( 'vedocstore' );
		return documentStore.collection.findOneAndUpdate(
			{ config: 'options' },
			{ $setOnInsert: { serverId: Math.random().toString( 36 ).slice( 2 ) } },
			{ upsert: true, returnDocument: 'after' }
		);
	} ).then( function ( result ) {
		documentStore.serverId = result.value.serverId;
	} );
};

/**
 * @return {Promise} Drops the entire database
 */
ve.dm.DocumentStore.prototype.dropDatabase = function () {
	this.logger.logServerEvent( { type: 'DocumentStore#dropDatabase', dbName: this.dbName }, 'info' );
	return this.db.dropDatabase();
};

/**
 * Load a document from storage (creating as empty if absent)
 *
 * @param {string} docName Name of the document
 * @return {Promise} Confirmed document history as a ve.dm.Change
 */
ve.dm.DocumentStore.prototype.load = function ( docName ) {
	const documentStore = this;
	return this.collection.findOneAndUpdate(
		{ docName: docName },
		{ $setOnInsert: { start: 0, transactions: [], stores: [] } },
		{ upsert: true, returnDocument: 'after' }
	).then( function ( result ) {
		const length = result.value.transactions.length || 0;
		documentStore.logger.logServerEvent( { type: 'DocumentStore#loaded', docName: docName, length: length } );
		documentStore.startForDoc.set( docName, result.value.start + length );
		return ve.dm.Change.static.deserialize( {
			start: 0,
			transactions: result.value.transactions,
			stores: result.value.stores,
			selections: {}
		}, true );
	} );
};

/**
 * Save a new change to storage
 *
 * @param {string} docName Name of the document
 * @param {ve.dm.Change} change The new change
 * @return {Promise} Resolves when saved
 */
ve.dm.DocumentStore.prototype.onNewChange = function ( docName, change ) {
	const documentStore = this,
		serializedChange = change.serialize( true ),
		expectedStart = this.startForDoc.get( docName ) || 0;

	if ( expectedStart !== serializedChange.start ) {
		return Promise.reject( 'Unmatched starts:', expectedStart, serializedChange.start );
	}
	this.startForDoc.set( docName, serializedChange.start + serializedChange.transactions.length );
	return this.collection.updateOne(
		{ docName: docName },
		{
			$push: {
				transactions: { $each: serializedChange.transactions },
				stores: { $each: serializedChange.stores || serializedChange.transactions.map( function () {
					return null;
				} ) }
			}
		}
	).then( function () {
		documentStore.logger.logServerEvent( {
			type: 'DocumentStore#onNewChange',
			docName: docName,
			start: serializedChange.start,
			length: serializedChange.transactions.length
		} );
	} );
};

ve.dm.DocumentStore.prototype.onClose = function () {
	this.logger.logServerEvent( { type: 'DocumentStore#onClose' }, 'info' );
	this.storageClient.close();
};

/*!
 * VisualEditor DataModel protocol server class.
 *
 * @copyright See AUTHORS.txt
 */

'use strict';

/**
 * Protocol server
 *
 * Handles the abstract protocol without knowing the specific transport
 *
 * @param {ve.dm.DocumentStore} documentStore The persistent storage
 * @param {Object} logger Logger class
 * @param {Function} logger.getRelativeTimestmap Return the number of ms since the logger started
 * @param {Function} logger.logEvent Stringify object argument to log
 * @param {Function} logger.logServerEvent Stringify object argument to log, adding timestamp and server ID properties
 */
ve.dm.ProtocolServer = function VeDmProtocolServer( documentStore, logger ) {
	this.logger = logger;
	this.rebaseServer = new ve.dm.RebaseServer();
	this.lastAuthorForDoc = new Map();
	this.loadingForDoc = new Map();
	this.documentStore = documentStore;
	this.logger.logServerEvent( { type: 'restart' }, 'info' );
};

OO.initClass( ve.dm.ProtocolServer );

ve.dm.ProtocolServer.static.palette = [
	'1f77b4', 'ff7f0e', '2ca02c', 'd62728', '9467bd',
	'8c564b', 'e377c2', '7f7f7f', 'bcbd22', '17becf',
	'aec7e8', 'ffbb78', '98df8a', 'ff9896', 'c5b0d5',
	'c49c94', 'f7b6d2', 'c7c7c7', 'dbdb8d', '9edae5'
];

/**
 * If the document is not loaded, load from storage (creating as empty if absent)
 *
 * @param {string} docName Name of the document
 * @return {Promise} Resolves when loaded
 */
ve.dm.ProtocolServer.prototype.ensureLoaded = function ( docName ) {
	const documentStore = this,
		rebaseServer = this.rebaseServer;

	let loading = this.loadingForDoc.get( docName );

	if ( loading ) {
		return loading;
	}
	this.logger.logServerEvent( { type: 'ProtocolServer#load', docName: docName } );
	loading = this.documentStore.load( docName ).then( function ( change ) {
		documentStore.logger.logServerEvent( {
			type: 'ProtocolServer#loaded',
			docName: docName,
			length: change.getLength()
		} );
		rebaseServer.updateDocState( docName, null, change );
	} );
	this.loadingForDoc.set( docName, loading );
	return loading;
};

/**
 * Check the client's credentials, and return a connection context object
 *
 * If the client is not recognised and authenticated, a new client ID and token are assigned.
 *
 * @param {string} docName The document name
 * @param {number|null} authorId The author ID, if any
 * @param {number|null} token The secret token, if any
 *
 * @return {Object} The connection context
 */
ve.dm.ProtocolServer.prototype.authenticate = function ( docName, authorId, token ) {
	const state = this.rebaseServer.stateForDoc.get( docName ),
		authorData = state && state.authors.get( authorId );

	if ( !authorData || token !== authorData.token ) {
		authorId = 1 + ( this.lastAuthorForDoc.get( docName ) || 0 );
		this.lastAuthorForDoc.set( docName, authorId );
		token = Math.random().toString( 36 ).slice( 2 );
	}
	const context = {
		serverId: this.documentStore.serverId,
		docName: docName,
		authorId: authorId
	};
	this.logger.logServerEvent( {
		type: 'newClient',
		doc: docName,
		authorId: context.authorId
	} );
	return context;
};

/**
 * Add an event to the log
 *
 * @param {Object} context The connection context
 * @param {Object} event Event data
 */
ve.dm.ProtocolServer.prototype.onLogEvent = function ( context, event ) {
	const ob = {};
	ob.recvTimestamp = this.logger.getRelativeTimestamp();
	ob.clientId = context.authorId;
	ob.doc = context.docName;
	for ( const key in event ) {
		ob[ key ] = event[ key ];
	}
	this.logger.logEvent( ob );
};

/**
 * Setup author on the server and send initialization events
 *
 * @param {Object} context The connection context
 * @param {number} [startLength=0] The length of the common history
 */
ve.dm.ProtocolServer.prototype.welcomeClient = function ( context, startLength ) {
	const docName = context.docName,
		serverId = context.serverId,
		authorId = context.authorId;

	if ( !startLength ) {
		startLength = 0;
	}
	this.rebaseServer.updateDocState( docName, authorId, null, {
		// TODO: i18n
		name: 'User ' + authorId,
		color: this.constructor.static.palette[
			authorId % this.constructor.static.palette.length
		],
		active: true
	} );

	const state = this.rebaseServer.getDocState( docName );
	const authorData = state.authors.get( authorId );

	context.sendAuthor( 'registered', {
		serverId: serverId,
		authorId: authorId,
		token: authorData.token
	} );
	context.broadcast( 'authorChange', {
		authorId: authorId,
		authorData: {
			name: authorData.name,
			color: authorData.color
		}
	} );
	// HACK Catch the client up on the current state by sending it the entire history
	// Ideally we'd be able to initialize the client using HTML, but that's hard, see
	// comments in the /raw handler. Keeping an updated linmod on the server could be
	// feasible if TransactionProcessor was modified to have a "don't sync, just apply"
	// mode and ve.dm.Document was faked with { data: …, metadata: …, store: … }
	context.sendAuthor( 'initDoc', {
		history: state.history.mostRecent( startLength ).serialize( true ),
		authors: state.getActiveAuthors()
	} );
};

/**
 * Try to apply a received change, and broadcast the successful portion as rebased
 *
 * @param {Object} context The connection context
 * @param {Object} data The change data
 */
ve.dm.ProtocolServer.prototype.onSubmitChange = function ( context, data ) {
	const change = ve.dm.Change.static.deserialize( data.change, true );
	const applied = this.rebaseServer.applyChange( context.docName, context.authorId, data.backtrack, change );
	if ( !applied.isEmpty() ) {
		this.documentStore.onNewChange( context.docName, applied );
		context.broadcast( 'newChange', applied.serialize( true ) );
	}
};

/**
 * Apply and broadcast an author change
 *
 * @param {Object} context The connection context
 * @param {string} newData The new author data
 */
ve.dm.ProtocolServer.prototype.onChangeAuthor = function ( context, newData ) {
	this.rebaseServer.updateDocState( context.docName, context.authorId, null, {
		name: newData.name,
		color: newData.color
	} );
	context.broadcast( 'authorChange', {
		authorId: context.authorId,
		authorData: {
			name: newData.name,
			color: newData.color
		}
	} );
	this.logger.logServerEvent( {
		type: 'authorChange',
		doc: context.docName,
		authorId: context.authorId,
		authorData: {
			name: newData.name,
			color: newData.color
		}
	} );
};

/**
 * Apply and broadcast a disconnection (which may be temporary)
 *
 * @param {Object} context The connection context
 */
ve.dm.ProtocolServer.prototype.onDisconnect = function ( context ) {
	this.rebaseServer.updateDocState( context.docName, context.authorId, null, {
		active: false,
		continueBase: null,
		rejections: null
	} );
	context.broadcast( 'authorDisconnect', context.authorId );
	this.logger.logServerEvent( {
		type: 'disconnect',
		doc: context.docName,
		authorId: context.authorId
	} );
};

/*!
 * VisualEditor DataModel rebase client class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * DataModel rebase client
 *
 * @class
 */
ve.dm.RebaseClient = function VeDmRebaseClient() {
	/**
	 * @property {number} authorId Author ID
	 */
	this.authorId = null;

	/**
	 * @property {number} commitLength Offset up to which we know we have no differences with the server
	 */
	this.commitLength = 0;

	/**
	 * @property {number} sentLength Offset up to which we have no unsent changes
	 */
	this.sentLength = 0;

	/**
	 * @property {number} backtrack Number of transactions backtracked (i.e. rejected) since the last send
	 */
	this.backtrack = 0;
};

/* Inheritance */

OO.initClass( ve.dm.RebaseClient );

/* Abstract methods */

/**
 * @abstract
 * @param {number} start Start point for the change
 * @param {boolean} toSubmit If true, mark current selection as sent
 * @return {ve.dm.Change} The change since start in the client's local history
 */
ve.dm.RebaseClient.prototype.getChangeSince = null;

/**
 * @abstract
 * @param {number} backtrack Number of rejected changes backtracked immediately before this change
 * @param {ve.dm.Change} change The change to send
 */
ve.dm.RebaseClient.prototype.sendChange = null;

/**
 * Apply a change to the surface, and add it to the history
 *
 * @abstract
 * @param {ve.dm.Change} change The change to apply
 */
ve.dm.RebaseClient.prototype.applyChange = null;

/**
 * Unapply a change from the surface, and remove it from the history
 *
 * @abstract
 * @param {ve.dm.Change} change The change to unapply
 */
ve.dm.RebaseClient.prototype.unapplyChange = null;

/**
 * Add a change to history, without applying it to the surface
 *
 * @abstract
 * @param {ve.dm.Change} change The change to add
 */
ve.dm.RebaseClient.prototype.addToHistory = null;

/**
 * Remove a change from history, without unapplying it to the surface
 *
 * @abstract
 * @param {ve.dm.Change} change The change to remove
 */
ve.dm.RebaseClient.prototype.removeFromHistory = null;

/**
 * Add an event to the log. Default implementation does nothing; subclasses should override this
 * if they want to collect logs.
 *
 * @param {Object} event Event data
 */
ve.dm.RebaseClient.prototype.logEvent = function () {};

/* Methods */

/**
 * @return {number} Author ID
 */
ve.dm.RebaseClient.prototype.getAuthorId = function () {
	return this.authorId;
};

/**
 * @param {number} authorId Author ID
 */
ve.dm.RebaseClient.prototype.setAuthorId = function ( authorId ) {
	this.authorId = authorId;
};

/**
 * Submit all outstanding changes
 *
 * This will submit all transactions that exist in local history but have not been broadcast
 * by the server.
 */
ve.dm.RebaseClient.prototype.submitChange = function () {
	var change = this.getChangeSince( this.sentLength, true );
	if ( change.isEmpty() ) {
		return;
	}
	// logEvent before sendChange, for the case where the log entry is sent to the server
	// over the same tunnel as the change, so that there's no way the server will log
	// receiving the change before it receives the submitChange message.
	this.logEvent( {
		type: 'submitChange',
		change: change,
		backtrack: this.backtrack
	} );
	this.sendChange( this.backtrack, change );
	this.backtrack = 0;
	this.sentLength += change.getLength();
};

/**
 * Accept a committed change from the server
 *
 * If the committed change is by the local author, then it is already applied to the document
 * and at the correct point in history: just move the commitLength pointer.
 *
 * If the commited change is by a different author, then:
 * - Rebase local uncommitted changes over the committed change
 * - If there is a rejected tail, then apply its inverse to the document
 * - Apply the rebase-transposed committed change to the document
 * - Rewrite history to have the committed change followed by rebased uncommitted changes
 *
 * @param {ve.dm.Change} change The committed change from the server
 */
ve.dm.RebaseClient.prototype.acceptChange = function ( change ) {
	var authorId = change.firstAuthorId(),
		logResult = {};
	if ( !authorId ) {
		return;
	}

	var result;
	var unsent = this.getChangeSince( this.sentLength, false );
	if (
		authorId !== this.getAuthorId() ||
		change.start + change.getLength() > this.sentLength
	) {
		var uncommitted = this.getChangeSince( this.commitLength, false );
		result = ve.dm.Change.static.rebaseUncommittedChange( change, uncommitted );
		if ( result.rejected ) {
			// Undo rejected tail, and mark unsent and backtracked if necessary
			this.unapplyChange( result.rejected );
			uncommitted = uncommitted.truncate( result.rejected.start - uncommitted.start );
			if ( this.sentLength > result.rejected.start ) {
				this.backtrack += this.sentLength - result.rejected.start;
			}
			this.sentLength = result.rejected.start;
		}
		// We are already right by definition about our own selection
		delete result.transposedHistory.selections[ this.getAuthorId() ];
		this.applyChange( result.transposedHistory );
		// Rewrite history
		this.removeFromHistory( result.transposedHistory );
		this.removeFromHistory( uncommitted );
		this.addToHistory( change );
		this.addToHistory( result.rebased );

		this.sentLength += change.getLength();
	}
	this.commitLength += change.getLength();

	// Only log the result if it's "interesting", i.e. we rebased or rejected something of nonzero length
	if ( result ) {
		if ( result.rebased.getLength() > 0 || result.rejected ) {
			logResult.rebased = result.rebased;
			logResult.transposedHistory = result.transposedHistory;
		}
		if ( result.rejected ) {
			logResult.rejected = result.rejected;
		}
	}
	if ( unsent.getLength() > 0 ) {
		logResult.unsent = unsent;
	}
	this.logEvent( ve.extendObject( {
		type: 'acceptChange',
		authorId: authorId,
		change: [ change.start, change.getLength() ]
	}, logResult ) );
};

/*!
 * VisualEditor DataModel SurfaceSynchronizer class.
 *
 * @copyright See AUTHORS.txt
 */

/* global io */

/**
 * DataModel surface synchronizer.
 *
 * @class
 * @mixins OO.EventEmitter
 * @mixins ve.dm.RebaseClient
 *
 * @constructor
 * @param {ve.dm.Surface} surface Surface model to synchronize
 * @param {string} documentId Document ID
 * @param {Object} [config] Configuration options
 * @cfg {string} [server] IO server
 * @cfg {string} [defaultName] Default username
 */
ve.dm.SurfaceSynchronizer = function VeDmSurfaceSynchronizer( surface, documentId, config ) {
	config = config || {};

	// Mixin constructors
	OO.EventEmitter.call( this );
	ve.dm.RebaseClient.call( this );

	// Properties
	this.surface = surface;
	this.doc = surface.documentModel;
	this.store = this.doc.getStore();
	this.authors = {};
	this.authorSelections = {};
	this.documentId = documentId;

	// Whether the document has been initialized
	this.initialized = false;
	// Whether we are currently synchronizing the model
	this.applying = false;
	this.token = null;
	this.serverId = null;
	this.loadSessionKey();
	this.paused = false;

	// SocketIO events
	var conn;
	if ( config.peerConnection ) {
		conn = {
			peerConnection: config.peerConnection,
			handlers: new Map(),
			on: function ( type, handler ) {
				if ( !this.handlers.has( type ) ) {
					this.handlers.set( type, [] );
				}
				this.handlers.get( type ).push( handler );
			},
			send: function ( type, data ) {
				this.peerConnection.send( { type: type, data: ve.collab.serialize( data ) } );
			},
			disconnect: function () {
				this.peerConnection.close();
			}
		};
		conn.peerConnection.on( 'data', function ( data ) {
			var type = data.type;
			if ( typeof type !== 'string' ) {
				throw new Error( 'Expected .type in <' + data + '>' );
			}
			( conn.handlers.get( type ) || [] ).forEach( function ( handler ) {
				handler( data.data );
			} );
		} );
	} else {
		var path = ( config.server || '' );
		var options = {
			query: {
				docName: this.documentId,
				authorId: this.getAuthorId() || '',
				token: this.token || ''
			},
			transports: [ 'websocket' ]
		};
		conn = {
			socket: io( path, options ),
			on: function ( type, handler ) {
				this.socket.on( type, handler );
			},
			send: function ( type, data ) {
				this.socket.emit( type, data );
			},
			disconnect: function () {
				this.socket.disconnect();
			}
		};
	}
	this.conn = conn;
	this.conn.on( 'registered', this.onRegistered.bind( this ) );
	this.conn.on( 'initDoc', this.onInitDoc.bind( this ) );
	this.conn.on( 'newChange', this.onNewChange.bind( this ) );
	this.conn.on( 'authorChange', this.onAuthorChange.bind( this ) );
	this.conn.on( 'authorDisconnect', this.onAuthorDisconnect.bind( this ) );

	var authorData = ve.init.platform.sessionStorage.getObject( 've-collab-author' );
	if ( authorData ) {
		this.changeAuthor( authorData );
	} else if ( config.defaultName ) {
		this.changeAuthor( { name: config.defaultName } );
	}

	// Events
	this.surface.connect( this, {
		history: 'onSurfaceHistory',
		select: 'onSurfaceSelect'
	} );

	this.submitChangeThrottled = ve.debounce( ve.throttle( this.submitChange.bind( this ), 250 ), 0 );
};

/* Inheritance */

OO.mixinClass( ve.dm.SurfaceSynchronizer, OO.EventEmitter );
OO.mixinClass( ve.dm.SurfaceSynchronizer, ve.dm.RebaseClient );

/* Events */

/**
 * @event authorSelect
 * @param {number} authorId The author whose selection has changed
 */

/**
 * @event authorChange
 * @param {number} authorId The author whose data has changed
 */

/**
 * @event wrongDoc
 */

/**
 * @event initDoc
 * @param {Error} error Error, if there was a problem initializing the document
 */

/**
 * @event disconnect
 */

/**
 * @event pause
 * The synchronizer is paused or resumes
 */

/* Methods */

/**
 * Destroy the synchronizer
 */
ve.dm.SurfaceSynchronizer.prototype.destroy = function () {
	this.conn.disconnect();
	this.doc.disconnect( this );
	this.surface.disconnect( this );
	this.initialized = false;
};

/**
 * Pause sending/receiving changes
 */
ve.dm.SurfaceSynchronizer.prototype.pauseChanges = function () {
	if ( this.paused ) {
		return;
	}
	this.paused = true;
	this.queuedChanges = [];
	this.emit( 'pause' );
};

/**
 * Resume sending/receiving changes
 */
ve.dm.SurfaceSynchronizer.prototype.resumeChanges = function () {
	if ( !this.paused ) {
		return;
	}
	this.applying = true;
	try {
		// Don't cache length, as it's not inconceivable acceptChange could
		// cause another change to arrive in some weird setup
		for ( var i = 0; i < this.queuedChanges.length; i++ ) {
			this.acceptChange( this.queuedChanges[ i ] );
		}
	} finally {
		this.applying = false;
	}
	this.paused = false;
	// Schedule submission of unsent local changes, if any
	this.submitChangeThrottled();
	this.emit( 'pause' );
};

/**
 * @inheritdoc
 */
ve.dm.SurfaceSynchronizer.prototype.getChangeSince = function ( start, toSubmit ) {
	var change = this.doc.getChangeSince( start ),
		selection = this.surface.getSelection();
	if ( !selection.equals( this.lastSubmittedSelection ) ) {
		change.selections[ this.getAuthorId() ] = selection;
		if ( toSubmit ) {
			this.lastSubmittedSelection = selection;
		}
	}
	return change;
};

/**
 * @inheritdoc
 */
ve.dm.SurfaceSynchronizer.prototype.submitChange = function () {
	// Prevent submission before initialization is complete
	if ( !this.initialized ) {
		return;
	}
	// Parent method
	ve.dm.RebaseClient.prototype.submitChange.apply( this, arguments );
};

/**
 * @inheritdoc
 */
ve.dm.SurfaceSynchronizer.prototype.sendChange = function ( backtrack, change ) {
	this.conn.send( 'submitChange', {
		backtrack: this.backtrack,
		// Serialize (don't rely on the transport to perform implicit serialization)
		change: change.serialize()
	} );
};

/**
 * @inheritdoc
 */
ve.dm.SurfaceSynchronizer.prototype.applyChange = function ( change ) {
	// Author selections are superseded by change.selections, so no need to translate them
	for ( var authorId in change.selections ) {
		authorId = +authorId;
		delete this.authorSelections[ authorId ];
	}
	change.applyTo( this.surface );
	// HACK: After applyTo(), the selections are wrong and applying them could crash.
	// The only reason this doesn't happen is because everything that tries to do that uses setTimeout().
	// Translate the selections that aren't going to be overwritten by change.selections
	this.applyNewSelections( this.authorSelections, change );
	// Apply the overwrites from change.selections
	this.applyNewSelections( change.selections );
};

/**
 * @inheritdoc
 */
ve.dm.SurfaceSynchronizer.prototype.unapplyChange = function ( change ) {
	change.unapplyTo( this.surface );
	// Translate all selections for what we just unapplied
	// HACK: After unapplyTo(), the selections are wrong and applying them could crash.
	// The only reason this doesn't happen is because everything that tries to do that uses setTimeout().
	this.applyNewSelections( this.authorSelections, change.reversed() );
};

/**
 * @inheritdoc
 */
ve.dm.SurfaceSynchronizer.prototype.addToHistory = function ( change ) {
	change.addToHistory( this.doc );
};

/**
 * @inheritdoc
 */
ve.dm.SurfaceSynchronizer.prototype.removeFromHistory = function ( change ) {
	change.removeFromHistory( this.doc );
};

/**
 * @inheritdoc
 */
ve.dm.SurfaceSynchronizer.prototype.logEvent = function ( event ) {
	if ( !this.initialized ) {
		// Do not log before initialization is complete; this prevents us from logging the entire
		// document history during initialization
		return;
	}
	this.conn.send( 'logEvent', ve.extendObject( { sendTimestamp: Date.now() }, event ) );
};

/**
 * Respond to transactions happening on the document. Ignores transactions applied by
 * SurfaceSynchronizer itself.
 */
ve.dm.SurfaceSynchronizer.prototype.onSurfaceHistory = function () {
	if ( this.applying || !this.initialized || this.paused ) {
		// Ignore our own synchronization or initialization transactions
		return;
	}
	var change = this.getChangeSince( this.sentLength, true );
	var authorId = this.authorId;
	// HACK annotate transactions with authorship information
	// This relies on being able to access the transaction object by reference;
	// we should probably set the author deeper in dm.Surface or dm.Document instead.
	change.transactions.forEach( function ( tx ) {
		tx.authorId = authorId;
	} );
	// TODO deal with staged transactions somehow
	this.applyNewSelections( this.authorSelections, change );
	this.submitChangeThrottled();
};

/**
 * Respond to selection changes.
 */
ve.dm.SurfaceSynchronizer.prototype.onSurfaceSelect = function () {
	if ( this.paused ) {
		return;
	}
	this.submitChangeThrottled();
};

/**
 * Translate incoming selections by change, then apply them and fire authorSelect
 *
 * @param {Object} newSelections Each author (key) maps to a new incoming ve.dm.Selection
 * @param {ve.dm.Change|ve.dm.Transaction} [changeOrTx] Object to translate over, if any
 * @fires authorSelect
 */
ve.dm.SurfaceSynchronizer.prototype.applyNewSelections = function ( newSelections, changeOrTx ) {
	var change = changeOrTx instanceof ve.dm.Change ? changeOrTx : null,
		tx = changeOrTx instanceof ve.dm.Transaction ? changeOrTx : null;
	for ( var authorId in newSelections ) {
		authorId = +authorId;
		if ( authorId === this.authorId ) {
			continue;
		}
		var translatedSelection;
		if ( change ) {
			translatedSelection = newSelections[ authorId ].translateByChange( change, authorId );
		} else if ( tx ) {
			translatedSelection = newSelections[ authorId ].translateByTransactionWithAuthor( tx, authorId );
		} else {
			translatedSelection = newSelections[ authorId ];
		}
		if ( !translatedSelection.equals( this.authorSelections[ authorId ] ) ) {
			// This works correctly even if newSelections === this.authorSelections
			this.authorSelections[ authorId ] = translatedSelection;
			this.emit( 'authorSelect', authorId );
		}
	}
};

/**
 * Get author data object
 *
 * @param {number} [authorId] Author ID, defaults to current author
 * @return {Object} Author object, containing 'name' and 'color'
 */
ve.dm.SurfaceSynchronizer.prototype.getAuthorData = function ( authorId ) {
	if ( authorId === undefined ) {
		authorId = this.getAuthorId();
	}
	return this.authors[ authorId ];
};

ve.dm.SurfaceSynchronizer.prototype.onAuthorChange = function ( data ) {
	this.authors[ data.authorId ] = data.authorData;
	this.emit( 'authorChange', data.authorId );

	if ( data.authorId === this.getAuthorId() ) {
		ve.init.platform.sessionStorage.setObject( 've-collab-author', data.authorData );
	}
};

ve.dm.SurfaceSynchronizer.prototype.changeAuthor = function ( data ) {
	this.conn.send( 'changeAuthor', ve.extendObject( {}, this.getAuthorData( this.getAuthorId() ), data ) );
};

ve.dm.SurfaceSynchronizer.prototype.onAuthorDisconnect = function ( authorId ) {
	delete this.authors[ authorId ];
	delete this.authorSelections[ authorId ];
	this.emit( 'authorDisconnect', authorId );
};

/**
 * Respond to a "registered" event from the server
 *
 * @param {Object} data
 * @param {number} data.authorId The author ID allocated by the server
 * @param {string} data.token
 * @fires wrongDoc
 */
ve.dm.SurfaceSynchronizer.prototype.onRegistered = function ( data ) {
	if ( this.serverId && this.serverId !== data.serverId ) {
		this.conn.disconnect();
		this.emit( 'wrongDoc' );
		return;
	}
	this.serverId = data.serverId;
	this.setAuthorId( data.authorId );
	this.surface.setAuthorId( this.authorId );
	this.token = data.token;
	this.saveSessionKey();
};

ve.dm.SurfaceSynchronizer.prototype.saveSessionKey = function () {
	ve.init.platform.sessionStorage.setObject( 'visualeditor-session-key', {
		serverId: this.serverId,
		docName: this.documentId,
		authorId: this.getAuthorId(),
		token: this.token
	} );
};

ve.dm.SurfaceSynchronizer.prototype.loadSessionKey = function () {
	var data = ve.init.platform.sessionStorage.getObject( 'visualeditor-session-key' );
	if ( data && data.docName === this.documentId ) {
		this.serverId = data.serverId;
		this.setAuthorId( data.authorId );
		this.token = data.token;
	}
};

/**
 * Respond to an initDoc event from the server, catching us up on the prior history of the document.
 *
 * @param {Object} data
 * @param {Object} data.history Serialized change representing the server's history
 * @param {Object} data.authors Object mapping author IDs to author data objects (name/color)
 * @fires initDoc
 */
ve.dm.SurfaceSynchronizer.prototype.onInitDoc = function ( data ) {
	if ( this.initialized ) {
		// Ignore attempt to initialize a second time
		return;
	}
	for ( var authorId in data.authors ) {
		this.onAuthorChange( {
			authorId: +authorId,
			authorData: data.authors[ authorId ]
		} );
	}
	try {
		var history = ve.dm.Change.static.deserialize( data.history );
		this.acceptChange( history );
	} catch ( e ) {
		this.conn.disconnect();
		this.emit( 'initDoc', e );
		return;
	}
	this.emit( 'initDoc' );

	// Mark ourselves as initialized and retry any prevented submissions
	this.initialized = true;
	this.submitChangeThrottled();
};

/**
 * Respond to a newChange event from the server, signalling a newly committed change
 *
 * If the commited change is by another author, then:
 * - Rebase uncommitted changes over the committed change
 * - If there is a rebase rejection, then apply its inverse to the document
 * - Apply the rebase-transposed committed change to the document
 * - Rewrite history to have the committed change followed by rebased uncommitted changes
 *
 * If the committed change is by the local author, then it is already applied to the document
 * and at the correct point in the history: just move the commit pointer.
 *
 * @param {Object} serializedChange Serialized ve.dm.Change that the server has applied
 */
ve.dm.SurfaceSynchronizer.prototype.onNewChange = function ( serializedChange ) {
	var change = ve.dm.Change.static.deserialize( serializedChange );
	if ( this.paused ) {
		this.queuedChanges.push( change );
		return;
	}
	// Make sure we don't attempt to submit any of the transactions we commit while manipulating
	// the state of the document
	this.applying = true;
	try {
		this.acceptChange( change );
	} finally {
		this.applying = false;
	}
	// Schedule submission of unsent local changes, if any
	this.submitChangeThrottled();
};

ve.dm.SurfaceSynchronizer.prototype.onDisconnect = function () {
	this.initialized = false;
	this.emit( 'disconnect' );
};

/*!
 * VisualEditor UserInterface AuthorItemWidget class.
 *
 * @copyright See AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/* global CP */

/**
 * UserInterface AuthorItemWidget
 *
 * @class
 * @extends OO.ui.Widget
 * @mixins OO.ui.mixin.IconElement
 * @mixins OO.ui.mixin.LabelElement
 *
 * @constructor
 * @param {ve.dm.SurfaceSynchronizer} synchronizer Surface synchronizer
 * @param {jQuery} $overlay Overlay in which to attach popups (e.g. color picker)
 * @param {Object} [config] Configuration options
 */
ve.ui.AuthorItemWidget = function VeUiAuthorItemWidget( synchronizer, $overlay, config ) {
	var item = this;

	config = config || {};

	// Parent constructor
	ve.ui.AuthorItemWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.LabelElement.call( this, config );

	this.synchronizer = synchronizer;
	this.editable = !!config.editable;
	this.authorId = config.authorId;
	this.name = null;
	this.color = null;

	this.$color = $( '<div>' ).addClass( 've-ui-authorItemWidget-color' );
	this.$element.append( this.$color );

	if ( this.editable ) {
		this.input = new OO.ui.TextInputWidget( {
			classes: [ 've-ui-authorItemWidget-nameInput' ],
			placeholder: ve.msg( 'visualeditor-rebase-client-author-name' )
		} );
		// Re-emit change events
		this.input.on( 'change', this.emit.bind( this, 'change' ) );

		this.colorPicker = new CP( this.$color[ 0 ] );
		this.colorPicker.on( 'change', function ( color ) {
			item.color = color;
			item.$color.css( 'background-color', '#' + color );
		} );
		this.colorPicker.on( 'exit', function () {
			if ( item.color !== null ) {
				item.emit( 'changeColor', item.color );
			}
		} );

		this.colorPicker.picker.classList.add( 've-ui-authorItemWidget-colorPicker' );
		this.colorPicker.fit = function () {
			this.picker.style.left = item.$element[ 0 ].offsetLeft + 'px';
			this.picker.style.top = item.$element[ 0 ].offsetTop + 'px';
			$overlay[ 0 ].appendChild( this.picker );
		};

		this.$element
			.addClass( 've-ui-authorItemWidget-editable' )
			.append( this.input.$element );
	} else {
		this.$element.append( this.$label );
	}

	this.update();

	this.$element.addClass( 've-ui-authorItemWidget' );
};

/* Inheritance */

OO.inheritClass( ve.ui.AuthorItemWidget, OO.ui.Widget );

OO.mixinClass( ve.ui.AuthorItemWidget, OO.ui.mixin.IconElement );

OO.mixinClass( ve.ui.AuthorItemWidget, OO.ui.mixin.LabelElement );

/* Methods */

/**
 * Focus the widget, if possible
 */
ve.ui.AuthorItemWidget.prototype.focus = function () {
	if ( this.editable ) {
		this.input.focus();
	}
};

/**
 * Get the user's name
 *
 * @return {string} User's name
 */
ve.ui.AuthorItemWidget.prototype.getName = function () {
	if ( this.editable ) {
		return this.input.getValue();
	} else {
		return this.name;
	}
};

/**
 * Set author ID
 *
 * @param {number} authorId Author ID
 */
ve.ui.AuthorItemWidget.prototype.setAuthorId = function ( authorId ) {
	this.authorId = authorId;
};

/**
 * Update name and color from synchronizer
 */
ve.ui.AuthorItemWidget.prototype.update = function () {
	var authorData = this.synchronizer.getAuthorData( this.authorId );
	this.name = authorData.name;
	this.color = authorData.color;
	this.$color.css( 'background-color', '#' + this.color );

	if ( this.editable ) {
		this.input.setValue( this.name );
		this.colorPicker.set( '#' + this.color );
	} else {
		// TODO: Handle empty names with a message
		this.setLabel( this.name || '…' );
	}
};

/*!
 * VisualEditor UserInterface AuthorListPopupTool class.
 *
 * @copyright See AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface AuthorListPopupTool
 *
 * @class
 * @extends OO.ui.PopupTool
 *
 * @constructor
 * @param {OO.ui.ToolGroup} toolGroup
 * @param {Object} [config]
 */
ve.ui.AuthorListPopupTool = function VeUiAuthorListPopupTool( toolGroup, config ) {
	this.$authorList = $( '<div>' );

	// Parent constructor
	ve.ui.AuthorListPopupTool.super.call( this, toolGroup, ve.extendObject( {
		popup: {
			classes: [ 've-ui-authorListWidget-listPopup' ],
			$content: this.$authorList,
			padded: true,
			align: 'backwards'
		}
	}, config ) );

	// Events
	this.toolbar.connect( this, { surfaceChange: 'onSurfaceChange' } );

	this.$element.addClass( 've-ui-authorListPopupTool' );
};

/* Inheritance */

OO.inheritClass( ve.ui.AuthorListPopupTool, OO.ui.PopupTool );

/* Methods */

/**
 * Handle surfaceChange event fromt the toolbar
 *
 * @param {ve.dm.Surface|null} oldSurface Old surface
 * @param {ve.dm.Surface|null} newSurface New surface
 */
ve.ui.AuthorListPopupTool.prototype.onSurfaceChange = function ( oldSurface, newSurface ) {
	// TODO: Disconnect oldSurface. Currently in the CollabTarget life-cycle the surface is never changed.
	this.setup( newSurface );
};

/**
 * @inheritdoc
 */
ve.ui.AuthorListPopupTool.prototype.onPopupToggle = function ( visible ) {
	// Parent method
	ve.ui.AuthorListPopupTool.super.prototype.onPopupToggle.apply( this, arguments );

	if ( visible ) {
		this.selfItem.focus();
	}
};

/**
 * Setup the popup which a specific surface
 *
 * @param {ve.ui.Surface} surface
 */
ve.ui.AuthorListPopupTool.prototype.setup = function ( surface ) {
	this.oldName = '';
	this.updatingName = false;
	this.synchronizer = surface.getModel().synchronizer;
	this.authorItems = {};

	this.surface = surface;

	if ( !this.synchronizer ) {
		this.setDisabled( true );
		return;
	}

	// TODO: Unbind from an existing surface if one is set

	this.changeNameDebounced = ve.debounce( this.changeName.bind( this ), 250 );

	this.selfItem = new ve.ui.AuthorItemWidget(
		this.synchronizer,
		this.popup.$element,
		{ editable: true, authorId: this.synchronizer.getAuthorId() }
	);
	this.$authorList.prepend( this.selfItem.$element );
	this.selfItem.connect( this, {
		change: 'onSelfItemChange',
		changeColor: 'onSelfItemChangeColor'
	} );

	this.synchronizer.connect( this, {
		authorChange: 'onSynchronizerAuthorUpdate',
		authorDisconnect: 'onSynchronizerAuthorDisconnect'
	} );

	for ( var authorId in this.synchronizer.authors ) {
		this.onSynchronizerAuthorUpdate( +authorId );
	}
};

/**
 * Handle change events from the user's authorItem
 *
 * @param {string} value
 */
ve.ui.AuthorListPopupTool.prototype.onSelfItemChange = function () {
	if ( !this.updatingName ) {
		this.changeNameDebounced();
	}
};

/**
 * Handle change color events from the user's authorItem
 *
 * @param {string} color
 */
ve.ui.AuthorListPopupTool.prototype.onSelfItemChangeColor = function ( color ) {
	this.synchronizer.changeAuthor( { color: color } );
};

/**
 * Notify the server of a name change
 */
ve.ui.AuthorListPopupTool.prototype.changeName = function () {
	this.synchronizer.changeAuthor( { name: this.selfItem.getName() } );
};

/**
 * Update the user count
 */
ve.ui.AuthorListPopupTool.prototype.updateAuthorCount = function () {
	this.setTitle( ( Object.keys( this.authorItems ).length + 1 ).toString() );
};

/**
 * Called when the synchronizer receives a remote author selection or name change
 *
 * @param {number} authorId The author ID
 */
ve.ui.AuthorListPopupTool.prototype.onSynchronizerAuthorUpdate = function ( authorId ) {
	var authorItem = this.authorItems[ authorId ];

	if ( authorId !== this.synchronizer.getAuthorId() ) {
		if ( !authorItem ) {
			authorItem = new ve.ui.AuthorItemWidget( this.synchronizer, this.popup.$element, { authorId: authorId } );
			this.authorItems[ authorId ] = authorItem;
			this.updateAuthorCount();
			this.$authorList.append( authorItem.$element );
		} else {
			authorItem.update();
		}
	} else {
		// Don't update nameInput if the author is still changing it
		if ( this.selfItem.getName() === this.oldName ) {
			// Don't send this "new" name back to the server
			this.updatingName = true;
			try {
				this.selfItem.setAuthorId( this.synchronizer.getAuthorId() );
				this.selfItem.update();
			} finally {
				this.updatingName = false;
			}
		}
	}
	this.oldName = this.synchronizer.getAuthorData( authorId ).name;
};

/**
 * Called when the synchronizer receives a remote author disconnect
 *
 * @param {number} authorId The author ID
 */
ve.ui.AuthorListPopupTool.prototype.onSynchronizerAuthorDisconnect = function ( authorId ) {
	var authorItem = this.authorItems[ authorId ];
	if ( authorItem ) {
		authorItem.$element.remove();
		delete this.authorItems[ authorId ];
		this.updateAuthorCount();
	}
};

/* Static Properties */

ve.ui.AuthorListPopupTool.static.name = 'authorList';
ve.ui.AuthorListPopupTool.static.group = 'users';
ve.ui.AuthorListPopupTool.static.icon = 'userAvatar';
ve.ui.AuthorListPopupTool.static.title = '1';
ve.ui.AuthorListPopupTool.static.autoAddToCatchall = false;
ve.ui.AuthorListPopupTool.static.autoAddToGroup = false;
ve.ui.AuthorListPopupTool.static.displayBothIconAndLabel = true;

/* Registration */

ve.ui.toolFactory.register( ve.ui.AuthorListPopupTool );

/*!
 * VisualEditor fake PeerJS class.
 *
 * For convenient debugging. Create two FakePeers in one browser window. Then a single
 * debugger can see all the communication within its call stack.
 *
 * @copyright See AUTHORS.txt
 */

ve.FakePeer = function veFakePeer() {
	this.id = 'p' + this.constructor.static.peers.length;
	this.constructor.static.peers.push( this );
	this.connections = [];
	this.handlers = new Map();
	Promise.resolve( this.id ).then( this.callHandlers.bind( this, 'open' ) );
};

/* Initialization */

OO.initClass( ve.FakePeer );

/* Static properties */

ve.FakePeer.static.peers = [];

/* Methods */

ve.FakePeer.prototype.on = function ( ev, f ) {
	var handlers = this.handlers.get( ev );
	if ( !handlers ) {
		handlers = [];
		this.handlers.set( ev, handlers );
	}
	handlers.push( f );
};

ve.FakePeer.prototype.callHandlers = function ( type ) {
	var args = Array.prototype.slice.call( arguments, 1 );
	( this.handlers.get( type ) || [] ).forEach( function ( handler ) {
		handler.apply( null, args );
	} );
};

ve.FakePeer.prototype.connect = function ( id ) {
	var peer = this.constructor.static.peers.find( function ( peerI ) {
		return peerI.id === id;
	} );
	if ( !peer ) {
		throw new Error( 'Unknown id: ' + id );
	}
	var thisConn = new ve.FakePeerConnection( peer.id + '-' + this.id, peer );
	var peerConn = new ve.FakePeerConnection( this.id + '-' + peer.id, this );
	thisConn.other = peerConn;
	peerConn.other = thisConn;
	this.connections.push( thisConn );
	peer.connections.push( peerConn );
	Promise.resolve( peerConn ).then( peer.callHandlers.bind( peer, 'connection' ) );
	Promise.resolve( thisConn.id ).then( thisConn.callHandlers.bind( thisConn, 'open' ) );
	Promise.resolve( peerConn.id ).then( peerConn.callHandlers.bind( peerConn, 'open' ) );
	return thisConn;
};

ve.FakePeerConnection = function VeFakePeerConnection( id, peer ) {
	this.id = id;
	this.peer = peer;
	this.other = null;
	this.handlers = new Map();
};

OO.initClass( ve.FakePeerConnection );

ve.FakePeerConnection.prototype.on = function ( ev, f ) {
	var handlers = this.handlers.get( ev );
	if ( !handlers ) {
		handlers = [];
		this.handlers.set( ev, handlers );
	}
	handlers.push( f );
};

ve.FakePeerConnection.prototype.callHandlers = function ( type ) {
	var args = Array.prototype.slice.call( arguments, 1 );
	( this.handlers.get( type ) || [] ).forEach( function ( handler ) {
		handler.apply( null, args );
	} );
};

ve.FakePeerConnection.prototype.setOther = function ( other ) {
	this.other = other;
	Promise.resolve( this.id ).then( this.callHandlers.bind( this, 'open' ) );
};

ve.FakePeerConnection.prototype.send = function ( data ) {
	Promise.resolve( data ).then( this.other.callHandlers.bind( this.other, 'data' ) );
};

/*!
 * VisualEditor collab extensions.
 *
 * @copyright See AUTHORS.txt
 */

/* global Peer */

ve.collab = {};

/**
 * Recursively serialize objects into plain data.
 *
 * Non-plain objects must have a .serialize or .toJSON method.
 *
 * @param {Object|Array} value The value to serialize
 * @return {Object|Array} The serialized version
 */
ve.collab.serialize = function ( value ) {
	if ( Array.isArray( value ) ) {
		return value.map( function ( item ) {
			return ve.collab.serialize( item );
		} );
	} else if ( value === null || typeof value !== 'object' ) {
		return value;
	} else if ( value.constructor === Object ) {
		var serialized = {};
		for ( var property in value ) {
			serialized[ property ] = ve.collab.serialize( value[ property ] );
		}
		return serialized;
	} else if ( typeof value.serialize === 'function' ) {
		return ve.collab.serialize( value.serialize() );
	} else if ( typeof value.toJSON === 'function' ) {
		return ve.collab.serialize( value.toJSON() );
	}
	throw new Error( 'Cannot serialize ' + value );
};

ve.collab.newPeer = function () {
	// To use the public PeerJS server:
	return new Peer();
	// To use a local PeerJS server:
	// return new Peer( undefined, { host: 'localhost', port: 9000, path: '/myapp' } );
	// To use a ve.FakePeer (for debugging):
	// return new ve.FakePeer();
};

ve.collab.initPeerServer = function () {
	var surface = ve.init.target.surface,
		completeHistory = surface.model.documentModel.completeHistory;

	ve.collab.peerServer = new ve.dm.CollabTransportServer( completeHistory.getLength() );
	if ( completeHistory.getLength() > 0 ) {
		completeHistory.transactions[ 0 ].authorId = 1;
	}
	ve.collab.peerServer.protocolServer.rebaseServer.updateDocState(
		// The doc name is arbitrary since the in-browser server only serves one doc
		've-collab-doc',
		1,
		ve.dm.Change.static.deserialize( completeHistory.serialize(), true ),
		completeHistory,
		{}
	);
	ve.collab.peerServer.peer = ve.collab.newPeer();
	ve.collab.peerServer.peer.on( 'open', function ( id ) {
		/* eslint-disable-next-line no-console */
		console.log( 'Open. Now in another browser window, do:\nve.collab.initPeerClient( \'' + id + '\' );' );
		ve.collab.initPeerClient( id, true );
	} );
	ve.collab.peerServer.peer.on( 'connection', function ( conn ) {
		ve.collab.peerServer.onConnection( conn );
	} );
};

ve.collab.initPeerClient = function ( serverId, isMain ) {
	var surface = ve.init.target.surface,
		completeHistory = surface.model.documentModel.completeHistory,
		peerClient = ve.collab.newPeer();
	if ( completeHistory.getLength() > 0 ) {
		completeHistory.transactions[ 0 ].authorId = 1;
	}
	// HACK: Disable redo command until supported (T185706)
	ve.ui.commandRegistry.unregister( 'redo' );

	if ( !isMain ) {
		ve.ui.commandRegistry.unregister( 'showSave' );
		// eslint-disable-next-line no-jquery/no-global-selector
		$( '.ve-ui-toolbar-saveButton' ).css( 'text-decoration', 'line-through' );
	}
	ve.init.target.constructor.static.toolbarGroups = ve.copy( ve.init.target.constructor.static.toolbarGroups );
	ve.init.target.constructor.static.toolbarGroups.push( {
		name: 'authorList',
		include: [ 'authorList' ],
		position: 'after'
	} );

	peerClient.on( 'open', function ( /* id */ ) {
		var conn = peerClient.connect( serverId );
		// On old js-BinaryPack (before https://github.com/peers/js-binarypack/pull/10 ),
		// you need JSON serialization, else it crashes on Unicode code points over U+FFFF
		// var conn = peerClient.connect( serverId, { serialization: 'json' } );
		conn.on( 'open', function () {
			surface.model.createSynchronizer( 'foo', { peerConnection: conn } );
			surface.model.synchronizer.commitLength = completeHistory.getLength();
			surface.model.synchronizer.sentLength = completeHistory.getLength();
			surface.model.synchronizer.once( 'initDoc', function ( error ) {
				if ( error ) {
					OO.ui.alert(
						// eslint-disable-next-line no-jquery/no-append-html
						$( '<p>' ).append(
							ve.htmlMsg( 'visualeditor-rebase-corrupted-document-error', $( '<pre>' ).text( error.stack ) )
						),
						{ title: ve.msg( 'visualeditor-rebase-corrupted-document-title' ), size: 'large' }
					);
					return;
				}
				ve.init.target.getToolbar().setup(
					ve.init.target.constructor.static.toolbarGroups,
					ve.init.target.surface
				);
			} );
			ve.collab.connectModelSynchronizer();
		} );
	} );
};

ve.collab.connectModelSynchronizer = function () {
	var ceSurface = ve.init.target.surface.view;
	ceSurface.model.synchronizer.connect( ceSurface, {
		authorSelect: 'onSynchronizerAuthorUpdate',
		authorChange: 'onSynchronizerAuthorUpdate',
		authorDisconnect: 'onSynchronizerAuthorDisconnect',
		wrongDoc: 'onSynchronizerWrongDoc',
		pause: 'onSynchronizerPause'
	} );
};

ve.collab.validateSessionUrl = function ( sessionUrl ) {
	var u = new URL( sessionUrl );
	var m = u.hash.match( /^#collabSession=(.*)/ );
	if ( !m ) {
		return '';
	}
	if (
		u.protocol !== location.protocol ||
		u.host !== location.host ||
		u.pathname !== location.pathname
	) {
		return null;
	}
	return m[ 1 ];
};

ve.collab.setup = function () {
	if ( location.hash.match( /^#collabSession=/ ) ) {
		var serverId = ve.collab.validateSessionUrl( location.toString() );
		if ( serverId ) {
			// Valid session URL
			ve.collab.start( serverId );
			return;
		}
		if ( serverId === null ) {
			// Invalid session URL
			OO.ui.alert( 'Session URL does not match this page' );
		}
	}
	ve.init.target.constructor.static.toolbarGroups = ve.copy(
		ve.init.target.constructor.static.toolbarGroups
	);
	ve.init.target.constructor.static.toolbarGroups.push(
		{ name: 'collab', include: [ 'collab' ] }
	);
	ve.init.target.getToolbar().setup(
		ve.init.target.constructor.static.toolbarGroups,
		ve.init.target.surface
	);
};

/**
 * Top-level function to host or join a collab session
 *
 * @param {string} [serverId] Id of session to join; undefined means host a new session
 */
ve.collab.start = function ( serverId ) {
	if ( serverId ) {
		// Join an existing session
		ve.init.target.surface.dialogs.openWindow( 'joinCollabDialog' ).closing.then( function ( val ) {
			if ( val !== 'accept' ) {
				return;
			}
			ve.collab.initPeerClient( serverId );
		} );
		return;
	}
	// Else host a new session
	ve.init.target.surface.dialogs.openWindow( 'hostCollabDialog' ).closing.then( function ( val ) {
		if ( val !== 'accept' ) {
			return;
		}
		ve.collab.initPeerServer();
		var url = location.protocol + '//' + location.host + location.pathname;
		ve.collab.peerServer.peer.on( 'open', function ( newId ) {
			var copyTextLayout = new OO.ui.CopyTextLayout( {
				copyText: url + '#collabSession=' + newId
			} );
			OO.ui.alert( copyTextLayout.$element, {
				title: OO.ui.msg( 'visualeditor-collab-copy-title' ),
				size: 'medium'
			} );
		} );
	} );
};

/*!
 * VisualEditor collab transport server class.
 *
 * @copyright See AUTHORS.txt
 */

'use strict';

/**
 * Transport server for Socket IO transport
 *
 * @constructor
 * @param {number} startHeight Length of shared completeHistory
 */
ve.dm.CollabTransportServer = function VeDmCollabTransportServer( startHeight ) {
	const startTimestamp = Date.now();
	this.startHeight = startHeight;
	this.protocolServer = new ve.dm.ProtocolServer(
		{
			startHeight: startHeight,
			// The server ID is arbitrary
			serverId: 've-collab-server',
			load: function () {
				return Promise.resolve(
					ve.dm.Change.static.deserialize( { transactions: [] } )
				);
			},
			onNewChange: function () {
				return Promise.resolve();
			}
		},
		{
			/* eslint-disable-next-line no-console */
			logServerEvent: ( x ) => console.log( x ),
			/* eslint-disable-next-line no-console */
			logEvent: ( x ) => console.log( x ),
			getRelativeTimestamp: () => Date.now() - startTimestamp
		}
	);
	this.connections = [];
};

OO.initClass( ve.dm.CollabTransportServer );

/**
 * Generic connection handler
 *
 * @param {Object} conn The connection
 */
ve.dm.CollabTransportServer.prototype.onConnection = function ( conn ) {
	const context = this.protocolServer.authenticate( 've-collab-doc', null, null ),
		connections = this.connections,
		server = this.protocolServer,
		startHeight = this.startHeight;

	connections.push( conn );

	context.broadcast = function ( type, data ) {
		const serialized = ve.collab.serialize( data );
		connections.forEach( function ( connection ) {
			connection.send( { type: type, data: serialized } );
		} );
	};
	context.sendAuthor = function ( type, data ) {
		const serialized = ve.collab.serialize( data );
		conn.send( { type: type, data: serialized } );
	};
	conn.on( 'data', function ( data ) {
		const type = data.type;
		if ( type === 'submitChange' ) {
			server.onSubmitChange( context, data.data );
		} else if ( type === 'changeAuthor' ) {
			server.onChangeAuthor( context, data.data );
		} else if ( type === 'disconnect' ) {
			server.onDisconnect( context, data.data );
		} else if ( type === 'logEvent' ) {
			// do nothing
		} else {
			throw new Error( 'Unknown type "' + type + '"' );
		}
	} );
	conn.on( 'open', function () {
		server.welcomeClient( context, startHeight );
	} );
};

/**
 * CollabProcessDialog - Dialog for hosting or joining a collab session
 *
 * @param {Object} [config] Configuration options
 */
ve.ui.CollabProcessDialog = function VeUiCollabProcessDialog( config ) {
	ve.ui.CollabProcessDialog.super.call( this, config );
};

OO.inheritClass( ve.ui.CollabProcessDialog, OO.ui.ProcessDialog );

ve.ui.CollabProcessDialog.static.name = null;

ve.ui.CollabProcessDialog.static.title = OO.ui.deferMsg( 'visualeditor-collab-dialog-title' );

ve.ui.CollabProcessDialog.static.imageUri = 'data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTAiIGhlaWdodD0iMTUwIiBzdHlsZT0ic3Ryb2tlOiNjY2NjY2M7c3Ryb2tlLXdpZHRoOjY7c3Ryb2tlLWxpbmVjYXA6cm91bmQiPg0KIDxyZWN0IHN0eWxlPSJmaWxsOndoaXRlO3N0cm9rZTp3aGl0ZSIgd2lkdGg9IjI1MCIgaGVpZ2h0PSIxNTAiIC8+DQogPHBhdGggZD0iTSAzMCwzMEggNzciIC8+DQogPHBhdGggZD0iTSA5MCwzMEggMTM0IiAvPg0KIDxwYXRoIGQ9Ik0gMTQ3LDMwSCAyMjAiIC8+DQogPHBhdGggZD0iTSAzMCw1MEggMTY4IiBzdHlsZT0ic3Ryb2tlOiNmZmNiMzMiIC8+DQogPHBhdGggZD0iTSAxODAsNTBIIDIyMCIgLz4NCiA8cGF0aCBkPSJNIDMwLDcwSCAxMTUiIHN0eWxlPSJzdHJva2U6I2U4NTdjOCIgLz4NCiA8cGF0aCBkPSJNIDEyOCw3MEggMjIwIiAvPg0KIDxwYXRoIGQ9Ik0gMzAsOTBIIDQ3IiAvPg0KIDxwYXRoIGQ9Ik0gNjAsOTBIIDEzOCIgLz4NCiA8cGF0aCBkPSJNIDE1MSw5MEggMjIwIiBzdHlsZT0ic3Ryb2tlOiMwMGFmODkiIC8+DQogPHBhdGggZD0iTSAzMCwxMTBIIDIyMCIgLz4NCiA8cGF0aCBkPSJNIDMwLDEzMEggOTgiIC8+DQogPHBhdGggZD0iTSAxMTEsMTMwSCAyMjAiIC8+DQo8L3N2Zz4=';

ve.ui.CollabProcessDialog.prototype.initialize = function () {
	ve.ui.CollabProcessDialog.super.prototype.initialize.apply( this, arguments );

	this.content = new OO.ui.PanelLayout( {
		padded: true,
		expanded: false
	} );
	this.button = new OO.ui.ButtonWidget( {
		label: this.label,
		icon: this.icon,
		title: this.title,
		flags: [ 'primary', 'progressive' ]
	} );
	this.button.$element[ 0 ].style.display = 'block';
	this.button.$element[ 0 ].firstElementChild.style.minWidth = '100%';

	this.content.$element.append(
		$( '<img>' ).prop( 'src', ve.ui.CollabProcessDialog.static.imageUri )
			.css( { display: 'block', margin: '2em auto' } ),
		$( '<p>' ).text( this.summary )
			.css( { 'font-weight': 'bold' } ),
		$( '<p>' ).text( OO.ui.msg( 'visualeditor-collab-dialog-sharing' ) ),
		$( '<p>' ).text( OO.ui.msg( 'visualeditor-collab-dialog-sessionend' ) ),
		$( '<p>' ).text( OO.ui.msg( 'visualeditor-collab-dialog-privacy' ) ),
		$( '<div>' ).append( this.button.$element )
	);
	this.$body.append( this.content.$element );
	this.button.on( 'click', this.close.bind( this, 'accept' ) );
};

ve.ui.CollabProcessDialog.prototype.getBodyHeight = function () {
	return this.content.$element.outerHeight( true );
};

/**
 * HostCollabProcessDialog - Dialog for hosting a new collab session
 *
 * @param {Object} [config] Configuration options
 */
ve.ui.HostCollabProcessDialog = function VeUiHostCollabProcessDialog( config ) {
	ve.ui.HostCollabProcessDialog.super.call( this, config );
	this.label = OO.ui.msg( 'visualeditor-collab-hostbutton-label' );
	this.icon = 'userAdd';
	this.title = 'Host';
	this.summary = OO.ui.msg( 'visualeditor-collab-dialog-summary-host' );
};

OO.inheritClass( ve.ui.HostCollabProcessDialog, ve.ui.CollabProcessDialog );

ve.ui.HostCollabProcessDialog.static.name = 'hostCollabDialog';

ve.ui.windowFactory.register( ve.ui.HostCollabProcessDialog );

/**
 * JoinCollabProcessDialog - Dialog for joining an existing collab session
 *
 * @param {Object} [config] Configuration options
 */
ve.ui.JoinCollabProcessDialog = function VeUiJoinCollabProcessDialog( config ) {
	ve.ui.JoinCollabProcessDialog.super.call( this, config );
	this.label = OO.ui.msg( 'visualeditor-collab-joinbutton-label' );
	this.icon = 'userGroup';
	this.title = 'Join';
	this.summary = OO.ui.msg( 'visualeditor-collab-dialog-summary-join' );
};

OO.inheritClass( ve.ui.JoinCollabProcessDialog, ve.ui.CollabProcessDialog );

ve.ui.JoinCollabProcessDialog.static.name = 'joinCollabDialog';

ve.ui.windowFactory.register( ve.ui.JoinCollabProcessDialog );

/*!
 * VisualEditor collab tool class.
 *
 * @copyright 2011-2023 VisualEditor Team and others; see http://ve.mit-license.org
 */

ve.ui.CollabTool = function VeUiCollabTool() {
	ve.ui.CollabTool.super.apply( this, arguments );
};

OO.inheritClass( ve.ui.CollabTool, OO.ui.Tool );

ve.ui.CollabTool.static.name = 'collab';

ve.ui.CollabTool.static.group = 'collab';

ve.ui.CollabTool.static.icon = 'userGroup';

ve.ui.CollabTool.static.title = 've.collab';

ve.ui.CollabTool.static.autoAddToCatchall = false;

ve.ui.CollabTool.static.displayBothIconAndLabel = true;

ve.ui.CollabTool.prototype.onUpdateState = function () {
};

ve.ui.CollabTool.prototype.onToolbarResize = function () {
};

ve.ui.CollabTool.prototype.onSelect = function () {
	this.setActive( false );
	ve.collab.start();
};

ve.ui.toolFactory.register( ve.ui.CollabTool );

} () );
