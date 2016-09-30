/**
 * Very lite jQuery replacement.
 */

$ = function (selector) {
    if (window === this) {
        return new $(selector);
    }

    if (selector.charAt(0) === '#') {
        // strip off.
        this.e = document.getElementById(selector.substr(1));
    } else if (selector.charAt(0) === '<') {
        // create the element
        this.e = document.createElement(selector.substr(1, selector.length - 2))
    } else {
        // tag.
        this.e = document.getElementsByTagName(selector)[0]
    }
    return this;
}

$.ajax = function (params) {
    var http = new XMLHttpRequest(),
        callback;

    http.onreadystatechange = function() {
        if (http.readyState == XMLHttpRequest.DONE) {
            if (http.status == 200) {
                // good to go.
                callback(JSON.parse(http.responseText))
            } else {
                console.error("Problem with request")
                console.error(http)
            }
        }
    };

    http.open("GET", params.url, true);
    http.send();

    return {
        then: function(callbackFn) {
            callback = callbackFn
        }
    };
}

$.prototype = {
    data: function(key, value) {
        if (!value) {
            return this.e.dataset[key]
        }

        this.e.dataset[key] = value
        return this;
    },

    show: function () {
        this.e.style.display = 'inherit';
        return this;
    },

    hide: function () {
        this.e.style.display = 'none';
        return this;
    },

    val: function () {
        return this.e.value
    },

    html: function(element) {
        if (!element) {
            return this.e.innerHTML
        }

        this.empty()

        if (element.e) {
            this.e.appendChild(element.e)
        } else {
            this.e.innerHTML = element
        }
    },

    append: function(element) {
        if (element.e) {
            this.e.appendChild(element.e)
        } else {
            this.e.insertAdjacentHTML('beforeend', element)
        }
    },

    empty: function() {
        while (this.e.firstChild) {
            this.e.removeChild(this.e.firstChild)
        }
    },

    addClass: function(className) {
        this.e.className += ' '+ className
        return this;
    },

    remove: function() {
        this.e.parentElement.removeChild(this.e)
        return this;
    }
}