/// from: http://www.west-wind.com/Weblog/posts/453942.aspx


(function($){
$.fn.watch = function(prop, func, interval, id) {
    /// <summary>
    /// Allows you to monitor changes in a specific
    /// CSS property of an element by polling the value.
    /// when the value changes a function is called.
    /// The function called is called in the context
    /// of the selected element (ie. this)
    /// </summary>    
    /// <param name="prop" type="String">CSS Property to watch. If not specified (null) code is called on interval</param>    
    /// <param name="func" type="Function">
    /// Function called when the value has changed.
    /// </param>    
    /// <param name="func" type="Function">
    /// optional id that identifies this watch instance. Use if
    /// if you have multiple properties you're watching.
    /// </param>        
    /// <returns type="jQuery" />   
    if (!interval)
        interval = 200;
    if (!id)
        id = "_watcher";

    this.each(function() {
        var _t = this;
        var el = $(this);
        var fnc = function() {__watcher.call(_t, id) };
        var itId = null;

        var z = el.get(0);                        
        if (typeof(z.onpropertychange) == "object")
           el.bind("propertychange", fnc);
        else if ($.browser.mozilla)
            el.bind("DOMAttrModified", fnc);
        else
            itId = setInterval(fnc, interval);

        el.data(id, { id: itId,
            prop: prop,
            func: func,
            val: prop ? el.css(prop) : null
        });
    });
    return this;
}
$.fn.unwatch = function(id) {
    this.each(function() {
        var w = $(this).data(id);
        $(this).removeData();

        if (typeof (z.onpropertychange) == "object")
            el.unbind("propertychange", fnc);
        else if ($.browser.mozilla)
            el.unbind("DOMAttrModified", fnc);
        else
            clearInterval(w.id);
    });
    return this;
}
function __watcher(id) {
    var el = $(this);
    var w = el.data(id);
    
    if (w.prop) {
        var newVal = el.css(w.prop);
        if (w.val != newVal)
            w.val = newVal;
        else
            return;
    }
    if (w.func) {        
        var _t = this;
        w.func.call(_t)
    }
}
})(jQuery);
