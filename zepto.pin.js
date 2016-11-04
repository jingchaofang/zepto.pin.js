/**
 * @file 容器钉子：将任意页面元素钉在某个容器顶部，而且在尺寸小的屏幕上能够设置自动禁用这种效果
 * @author jingchaofang <jing@turingca.com>
 */

// zepto data扩展模块
;(function($) {
    var data = {};
    var dataAttr = $.fn.data;
    var camelize = $.camelCase;
    var exp = $.expando = 'Zepto' + (+new Date());
    var emptyArray = [];

    // Get value from node:
    // 1. first try key as given,
    // 2. then try camelized key,
    // 3. fall back to reading "data-*" attribute.
    function getData(node, name) {
        var id = node[exp],
            store = id && data[id]
        if (name === undefined) return store || setData(node)
        else {
            if (store) {
                if (name in store) return store[name]
                var camelName = camelize(name)
                if (camelName in store) return store[camelName]
            }
            return dataAttr.call($(node), name);
        }
    }

    // Store value under camelized key on node
    function setData(node, name, value) {
        var id = node[exp] || (node[exp] = ++$.uuid),
            store = data[id] || (data[id] = attributeData(node))
        if (name !== undefined) store[camelize(name)] = value
        return store;
    }

    // Read all "data-*" attributes from a node
    function attributeData(node) {
        var store = {}
        $.each(node.attributes || emptyArray, function(i, attr) {
            if (attr.name.indexOf('data-') == 0)
                store[camelize(attr.name.replace('data-', ''))] =
                $.zepto.deserializeValue(attr.value)
        })
        return store;
    }

    $.fn.data = function(name, value) {
        return value === undefined ?
            // set multiple values via object
            $.isPlainObject(name) ?
            this.each(function(i, node) {
                $.each(name, function(key, value) { setData(node, key, value) })
            }) :
            // get value from first element
            (0 in this ? getData(this[0], name) : undefined) :
            // set value on all elements
            this.each(function() { setData(this, name, value) })
    }

    $.data = function(elem, name, value) {
        return $(elem).data(name, value)
    }

    $.hasData = function(elem) {
        var id = elem[exp],
            store = id && data[id]
        return store ? !$.isEmptyObject(store) : false
    }

    $.fn.removeData = function(names) {
        if (typeof names == 'string') names = names.split(/\s+/)
        return this.each(function() {
            var id = this[exp],
                store = id && data[id]
            if (store) $.each(names || store, function(key) {
                delete store[names ? camelize(this) : key]
            })
        })
    }

    // Generate extended `remove` and `empty` functions
    ;['remove', 'empty'].forEach(function(methodName) {
        var origFn = $.fn[methodName]
        $.fn[methodName] = function() {
            var elements = this.find('*');
            if (methodName === 'remove') elements = elements.add(this);
            elements.removeData();
            return origFn.call(this);
        }
    })
})(Zepto);

/**
 * zepto outerWidth、outerHeight扩展
 * @param  {Object} $ Zepto对象
 * @return {number}   尺寸数值
 */
(function($){
    "use strict";

    ['width','height'].forEach(function(dimension){
        var Dimension = dimension.replace(/./,function(m){
            return m[0].toUpperCase();
        });

        // outerWidth或者outerHeight
        $.fn['outer' + Dimension] = function(margin) {
            var elem = this;
            if (elem) {
                // elem.width()或者elem.height();
                // zepto的width和height包括padding和border
                var size = elem[dimension]();
                var sides = {
                    'width' : ['left', 'right'],
                    'height' : ['top', 'bottom']
                };

                sides[dimension].forEach(function(side){
                    if(margin) {
                        size += parseInt(elem.css('margin-'+side),10);
                    }
                });

                return size;
            }
            else {
                return null;
            }
        }

    });
})(Zepto);

/**
 * 钉子效果
 * @param  {Object} $ Zepto对象
 * @return {Object}   返回封装后的方法
 */
(function($) {
    "use strict";
    $.fn.pin = function(options) {
        options = options || {};

        var scrollY = 0;
        var elements = [];
        // 禁用状态
        var disabled = false;
        var $window = $(window);
        // 重新计算约束
        var recalculateLimits = function() {
            for (var i = 0, len = elements.length; i < len; i++) {
                var $this = elements[i];
                // 约束页面宽度需求时，不需要可删除，连同disabled变量一起删除
                if (options.minWidth && $window.width() <= options.minWidth) {
                    if ($this.parent().is(".pin-wrapper")) {
                        // 移除集合中每个元素的直接父节点，并把他们的子元素保留在原来的位置
                        // 删除上一个祖先元素，同时保持DOM中的当前元素。
                        $this.unwrap();
                    }
                    $this.css({ width: "", left: "", top: "", position: "" });
                    if (options.activeClass) {
                        $this.removeClass(options.activeClass);
                    }
                    disabled = true;
                    continue;
                } else {
                    disabled = false;
                }
                // 钉子包裹元素
                var $container = options.containerSelector ? $this.closest(options.containerSelector) : $(document.body);
                // Zepto的offset()获得当前元素相对于document的位置。返回一个对象含有top, left, width和height
                // 当给定一个含有left和top属性对象时，使用这些值来对集合中每一个元素进行相对于document的定位。
                // 钉子元素度量
                var offset = $this.offset();
                // 钉子包裹元素度量
                var containerOffset = $container.offset();
                console.log(containerOffset);
                // 找到第一个定位过的祖先元素，意味着它的css中的position属性值为relative、absolute或者fixed
                // 钉子元素的第一个父元素度量
                var parentOffset = $this.offsetParent().offset();
                // 自动包裹pin-wrapper
                if (!$this.parent().is(".pin-wrapper")) {
                    // 在每个匹配的元素外层包上一个html元素
                    $this.wrap("<div class='pin-wrapper'>");
                }
                // extend()通过源对象扩展目标对象的属性，源对象属性将覆盖目标对象属性。
                // 设置钉子元素的相对于钉子包裹元素的定位偏移量top和bottom，默认0
                var pad = $.extend({
                    top: 0,
                    bottom: 0
                }, options.padding || {});

                $this.data("pin", {
                    pad: pad,
                    from: (options.containerSelector ? containerOffset.top : offset.top) - pad.top,
                    to: containerOffset.top + parseInt($container.css('height')) - $this.outerHeight() - pad.bottom,
                    end: containerOffset.top + parseInt($container.css('height')),
                    parentTop: parentOffset.top
                });

                $this.css({ width: $this.outerWidth() });
                $this.parent().css("height", $this.outerHeight());
            }
        };

        var onScroll = function() {
            if (disabled) {
                return;
            }
            // 获取或设置页面上的滚动元素或者整个窗口向下滚动的像素值
            scrollY = $window.scrollTop();

            var elmts = [];
            for (var i = 0, len = elements.length; i < len; i++) {
                var $this = $(elements[i]);
                // 获取钉子元素数据
                var data = $this.data("pin");

                if (!data) {
                    continue;
                }
                // 有数据的钉子元素数组
                elmts.push($this);
                // 钉子元素起始top位置
                var from = data.from - data.pad.bottom;
                // 钉子元素到达top位置
                var to = data.to - data.pad.top;
                // 当大于元素钉子效果结束位置
                if (from + $this.outerHeight() > data.end) {
                    $this.css('position', '');
                    continue;
                }
                // 页面滚动值开始大于钉子元素效果开始top值和页面滚动值小于钉子元素脱离包裹元素的top值
                // 到达效果区时
                if (from < scrollY && to > scrollY) {
                    !($this.css("position") == "fixed") && $this.css({
                        left: $this.offset().left,
                        top: data.pad.top
                    }).css("position", "fixed");
                    // 开始钉子效果时可以添加样式类
                    if (options.activeClass) {
                        $this.addClass(options.activeClass);
                    }
                }
                else if (scrollY >= to) {
                    // 效果结束时，绝对定位到结束的位置
                    $this.css({
                        left: "",
                        top: to - data.parentTop + data.pad.top
                    }).css("position", "absolute");
                    // 结束效果时保持添加样式类
                    if (options.activeClass) {
                        $this.addClass(options.activeClass);
                    }
                }
                else {
                    // 未触发效果时
                    $this.css({
                        position: "",
                        top: "",
                        left: ""
                    });
                    if (options.activeClass) {
                        $this.removeClass(options.activeClass);
                    }
                }
            }
            elements = elmts;
        };

        var update = function() {
            recalculateLimits();
            onScroll();
        };
        // 遍历数组元素或以key-value值对方式遍历对象。回调函数返回false时停止遍历。
        this.each(function() {
            // 获取钉子元素
            var $this = $(this);
            // 获取钉子元素上绑定的钉子数据
            var data = $(this).data('pin') || {};

            if (data && data.update) {
                return;
            }
            // 钉子元素数组
            elements.push($this);
            // 如果钉子元素内有图片，当图片加载完仅执行一次重新计算约束
            $("img", this).one("load", recalculateLimits);
            // 钉子数据对象绑定更新操作属性
            data.update = update;

            // 填充钉子数据
            // 读取或写入dom的data-*属性
            // Zepto基本实现data()只能存储字符串。如果你要存储任意对象，请引入可选的data模块到你构建的Zepto中
            $(this).data('pin', data);
        });

        $window.on('scroll', onScroll);
        $window.on('resize', recalculateLimits);
        // recalculateLimits();
        update();
        $window.on('load', update);
        return this;
    };
})(Zepto);
