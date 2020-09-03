(function () {
    window.packet = {
        request(url, data, parseDataAsJson = false) {
            let net = (data instanceof Element ? Net.net().withElement() : Net.net().withPacket());
            net = parseDataAsJson ? net.asJson() : net;
            return net.post(`${url}`, data);
        },
        requestByOption(option, asJson) {
            let url = option["url"];
            let api = option["api"];
            let filter = option["filter"] || {};
            let data = option["data"] || {};
            url = `${url}?api=${api}`;
            for (let k in filter) {
                url += `&${k}=${filter[k]}`;
            }
            let net = (data instanceof Element ? Net.net().withElement() : Net.net().withPacket());
            net = asJson ? net.asJson() : net;
            return net.post(`${url}`, data);
        },
        debug(data) {
            Net.debug(data);
        },
        dumpPacket(data) {
            Net.dumpPacket(data);
        }
    };
    window.dom = {
        _map: {},
        /**
         * @param {string} selector
         * @returns {Element}
         **/
        query(selector) {
            return document.querySelector(selector);
        },
        /**
         * @param {string} selector
         * @returns {Element[]}
         **/
        queryAll(selector) {
            return Array.from(document.querySelectorAll(selector));
        },
        /** @param {Element} element */
        idMap(element = document.body) {
            for (let child of Array.from(element.children)) {
                if (child.getAttribute("id") !== null) {
                    this._map[child.getAttribute("id")] = child;
                }
                this.idMap(child);
            }
            return this._map;
        },
        /** @param {Element} element */
        lazyIdMap(element = document.body) {
            if (Object.getOwnPropertyNames(window.dom._map).length === 0)
                return this.idMap(element);
            return this._map;
        },
        /** @param {Element} element */
        bindListener(element = document.body, context = window) {
            for (let child of Array.from(element.children)) {
                for (let attr of child.getAttributeNames()) {
                    if (attr.match(/^@\w+$/)) {
                        child.addEventListener(attr.substr(1),
                            new Function(child.getAttribute(attr)).bind(context));
                    }
                }
                this.bindListener(child, context);
            }
        },
        /** @param {Function} main */
        ready(main) {
            let fun = function () {
                main();
                window.removeEventListener("load", fun)
            };
            window.addEventListener("load", fun);
        },
        /**
         * @param {string} name
         * @param {{}} data
         * @returns {DocumentFragment}
         */
        render(name, data) {
            let tmpl = document.createElement("template");
            tmpl.innerHTML = template(name, data);
            return tmpl.content;
        },
        _file: {},
        /**
         * @param {string} url
         * @param {{}} data
         * @param {boolean} noCache
         * @returns {Promise<DocumentFragment>}
         */
        renderFile(url, data, noCache = false) {
            let tmpl = document.createElement("template");
            if (noCache) this._file = {};
            if (this._file[url]) {
                tmpl.innerHTML = template.render(this._file[url], data);
                return new Promise(function (resolve) {
                    resolve(tmpl.content);
                });
            } else {
                let that = this;
                return new Promise(function(resolve) {
                    Net.net().get(url).then(result => {
                        tmpl.innerHTML = template.render(result.data, data);
                        that._file[url] = result.data;
                        resolve(tmpl.content);
                    });
                });
            }
        }
    };
    window.util = {
        CookieUtil: class CookieUtil {
            static getCookie(name) {
                let arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
                if (arr = document.cookie.match(reg)) {
                    return unescape(arr[2]);
                } else {
                    return null;
                }
            }
        
            static delCookie(name, path) {
                path = typeof path == "undefined" ? "/" : path;
                let exp = new Date();
                exp.setTime(exp.getTime() - 1);
                let cval = CookieUtil.getCookie(name);
                if (cval != null)
                    document.cookie = name + "=" + cval + "; expires=" + exp.toUTCString() + "; path=" + path;
            }
        
            static setCookie(name, value, expir, path) {
                let exp = new Date();
                if (typeof expir != "undefined") {
                    exp.setTime(exp.getTime() + expir);
                    document.cookie = name + "=" + escape(value) + "; expires=" + exp.toUTCString() + "; path=" + (typeof path == "undefined" ? "/" : path);
                } else {
                    document.cookie = name + "=" + escape(value) + "; path=" + (typeof path == "undefined" ? "/" : path);
                }
            }
        },
        /**
         *  Base64 encode / decode
         *  http://www.webtoolkit.info
         *  Partly Modified by Yvzzi
         */
        Base64: class Base64 {
            static urlEncode(input) {
                let output = Base64.encode(input);
                output = output.replace(/\//g, "_");
                output = output.replace(/\+/g, "-");
                output = output.replace(/=/g, "");
                return output;
            }
            
            static urlDecode(input) {
                let output = input;
                output = output.replace(/_/g, "/");
                output = output.replace(/-/g, "+");
                let num = output.length % 4;
                if (num == 3) {
                    output += "=";
                } else if (num == 2) {
                    output += "==";
                }
                return Base64.decode(output);
            }
            
            static encode(input) {
                    let output = "";
                    let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                    let i = 0;

                    input = Base64._utf8_encode(input);

                    while (i < input.length) {
                        chr1 = input.charCodeAt(i++);
                        chr2 = input.charCodeAt(i++);
                        chr3 = input.charCodeAt(i++);

                        enc1 = chr1 >> 2;
                        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                        enc4 = chr3 & 63;

                        if (isNaN(chr2)) {
                            enc3 = enc4 = 64;
                        } else if (isNaN(chr3)) {
                            enc4 = 64;
                        }

                        output = output +
                            Base64._keyStr.charAt(enc1) + Base64._keyStr.charAt(enc2) +
                            Base64._keyStr.charAt(enc3) + Base64._keyStr.charAt(enc4);
                    } // Whend 
                    return output;
                } // End Function encode 

            static decode(input) {
                    let output = "";
                    let chr1, chr2, chr3;
                    let enc1, enc2, enc3, enc4;
                    let i = 0;

                    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
                    while (i < input.length) {
                        enc1 = Base64._keyStr.indexOf(input.charAt(i++));
                        enc2 = Base64._keyStr.indexOf(input.charAt(i++));
                        enc3 = Base64._keyStr.indexOf(input.charAt(i++));
                        enc4 = Base64._keyStr.indexOf(input.charAt(i++));

                        chr1 = (enc1 << 2) | (enc2 >> 4);
                        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                        chr3 = ((enc3 & 3) << 6) | enc4;

                        output = output + String.fromCharCode(chr1);

                        if (enc3 != 64) {
                            output = output + String.fromCharCode(chr2);
                        }

                        if (enc4 != 64) {
                            output = output + String.fromCharCode(chr3);
                        }

                    } // Whend 

                    output = Base64._utf8_decode(output);

                    return output;
                } // End Function decode 


            // private method for UTF-8 encoding
            static _utf8_encode(string) {
                    let utftext = "";
                    string = string.replace(/\r\n/g, "\n");

                    for (let n = 0; n < string.length; n++) {
                        let c = string.charCodeAt(n);

                        if (c < 128) {
                            utftext += String.fromCharCode(c);
                        } else if ((c > 127) && (c < 2048)) {
                            utftext += String.fromCharCode((c >> 6) | 192);
                            utftext += String.fromCharCode((c & 63) | 128);
                        } else {
                            utftext += String.fromCharCode((c >> 12) | 224);
                            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                            utftext += String.fromCharCode((c & 63) | 128);
                        }

                    } // Next n 

                    return utftext;
                } // End Function _utf8_encode 

            // private method for UTF-8 decoding
            static _utf8_decode(utftext) {
                let string = "";
                let i = 0;
                let c, c1, c2, c3;
                c = c1 = c2 = 0;

                while (i < utftext.length) {
                    c = utftext.charCodeAt(i);

                    if (c < 128) {
                        string += String.fromCharCode(c);
                        i++;
                    } else if ((c > 191) && (c < 224)) {
                        c2 = utftext.charCodeAt(i + 1);
                        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                        i += 2;
                    } else {
                        c2 = utftext.charCodeAt(i + 1);
                        c3 = utftext.charCodeAt(i + 2);
                        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                        i += 3;
                    }

                } // Whend 
                return string;
            }
        }
    };
    window.util.Base64._keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
})();

class Net {
    static _singleton;
    static _dumpPacket = false;
    _baseUrl;
    _option;
    _requestDataType = "any";
    _responseDataType = "";
    _timeOut = 0;
    _filter = {};
    /**@type {XMLHttpRequest} */
    _xhr;
    _uploadProgressHandler;
    _downloadProgressHandler;
    constructor(baseUrl = ".", option = {}) {
        this._baseUrl = baseUrl.replace(/\/$/, "");
        this._option = Net._deepAssign({
            cached: true,
            auth: null,
            credentials: "include",
            headers: {}
        }, option);
    }

    static net(baseUrl = ".", option = {}) {
        return new Net(baseUrl, option);
    }

    static default(baseUrl = ".", option = {}) {
        return this._singleton ? this._singleton : (this._singleton = new Net(baseUrl, option));
    }

    /**
     *
     * @param {string} method
     * @param {string} url
     * @param {any} data
     */
    send(method, url, data) {
        const xhr = new XMLHttpRequest();
        this._xhr = xhr;
        if (!this._option.cached)
            this._option.headers["cache-control"] = "no-store";
        if (this._option.auth)
            this._option.headers["www-authenticate"] = "Bearer " + this._option.auth;
        if (this._timeOut !== 0)
            xhr.timeout = this._timeOut;
        if (Object.getOwnPropertyNames(this._filter).length !== 0) {
            const query = Net._buildQuery(this._filter);
            url += url.includes("?") ? "&" + query : "?" + query;
        }
        xhr.withCredentials = this._option.credentials === "include";
        xhr.open(method, this._baseUrl + "/" + url);
        if (this._requestDataType === "query") {
            data = Net._buildQuery(data);
            this._option.headers["content-type"] = "application/x-www-form-urlencoded";
        } else if (this._requestDataType === "text") {
            this._option.headers["content-type"] = "text/plain";
        } else if (this._requestDataType === "json") {
            this._option.headers["content-type"] = "application/json";
            data = JSON.stringify(data);
        } else if (this._requestDataType === "element") {
            data = new FormData(form);
        } else if (this._requestDataType === "form") {
            const form = new FormData();
            for (const key in data) {
                form.set(key, data[key]);
            }
            data = form;
        } else if (this._requestDataType === "binary") {
            this._option.headers["content-type"] = "application/octet-stream";
        } else if (this._requestDataType === "packet") {
            data = Net._packetToForm(data);
        } else if (this._requestDataType === "html") {
            this._option.headers["content-type"] = "text/html";
        } else if (this._requestDataType === "xml") {
            this._option.headers["content-type"] = "application/xml";
        }
        xhr.responseType = this._responseDataType;
        for (const key in this._option.headers) {
            xhr.setRequestHeader(key, this._option.headers[key]);
        }
        const that = this;
        return new Promise((resolve, reject) => {
            xhr.addEventListener("abort", () => reject({
                reason: "abort",
                status: 0,
                statusText: null,
                data: null
            }));
            xhr.addEventListener("error", () => reject({
                reason: "error",
                status: 0,
                statusText: null,
                data: null
            }));
            if (that._uploadProgressHandler)
                xhr.upload.addEventListener("progress", e => that._uploadProgressHandler(e));
            if (that._downloadProgressHandler)
                xhr.upload.addEventListener("progress", e => that._downloadProgressHandler(e));
            if (this._timeOut !== 0)
                xhr.addEventListener("timeout", () => reject({
                    reason: "timeout",
                    status: 0,
                    statusText: null,
                    data: null
                }));
            xhr.addEventListener("readystatechange", () => {
                if (xhr.readyState === xhr.DONE) {
                    if (xhr.status === 200) {
                        resolve({
                            status: xhr.status,
                            statusText: xhr.statusText,
                            data: xhr.response
                        });
                    } else {
                        reject({
                            reason: "fail",
                            status: xhr.status,
                            statusText: xhr.statusText,
                            data: xhr.response
                        });
                    }
                }
            });
            xhr.send(data);
        });
    }

    get(url) {
        return this.send("get", url, null);
    }

    post(url, data) {
        return this.send("post", url, data);
    }

    update(url, data) {
        return this.send("update", url, data);
    }

    patch(url, data) {
        return this.send("patch", url, data);
    }

    put(url, data) {
        return this.send("put", url, data);
    }

    delete(url, data = null) {
        return this.send("delete", url, data);
    }
    /** Method to send serveral data Object */
    all(requests) {
        return Promise.all(requests);
    }
    /** Config method */
    withFilter(filter) {
        Object.assign(this._filter, filter);
        return this;
    }

    withHeader(header) {
        Object.assign(this._option.headers, header);
        return this;
    }

    withConfig(option) {
        Net._deepAssign(this._option, option);
        return this;
    }

    withTimeOut(time) {
        this._timeOut = time;
        return this;
    }

    withQuery() {
        this._requestDataType = "query";
        return this;
    }

    withText() {
        this._requestDataType = "text";
        return this;
    }

    withJson() {
        this._requestDataType = "json";
        return this;
    }

    withElement() {
        this._requestDataType = "element";
        return this;
    }

    withForm() {
        this._requestDataType = "form";
        return this;
    }

    withBinary() {
        this._requestDataType = "binary";
        return this;
    }

    withPacket() {
        this._requestDataType = "packet";
        return this;
    }

    withAny() {
        this._requestDataType = "any";
        return this;
    }

    withHtml() {
        this._requestDataType = "html";
        return this;
    }

    withXml() {
        this._requestDataType = "xml";
        return this;
    }

    asText() {
        this._responseDataType = "text";
        return this;
    }

    asJson() {
        this._responseDataType = "json";
        return this;
    }

    asBlob() {
        this._responseDataType = "blob";
        return this;
    }

    asArrayBuffer() {
        this._responseDataType = "arraybuffer";
        return this;
    }

    asPacket() {
        this._responseDataType = "json";
        return this;
    }

    /** Control method */
    abort() {
        this._xhr.abort();
    }

    onUploadProgress(handler) {
        this._uploadProgressHandler = handler;
        return this;
    }

    onDownloadProgress(handler) {
        this._downloadProgressHandler = handler;
        return this;
    }
    /** Utils */
    static _deepAssign(dest, src) {
        for (let key in src) {
            if (dest[key] instanceof Object) {
                this.deepAssign(dest[key], src[key]);
            } else {
                dest[key] = src[key];
            }
        }
        return dest;
    }
    static _buildQuery(obj) {
        let buf = "";
        for (const key in obj) {
            buf += `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}&`;
        }
        return buf.substring(0, buf.length - 1);
    }

    static debug(msg) {
        this.dumpPacketOn();
        /** @type {HTMLElement} */
        const debug = document.querySelector("[data-net=debug]");
        const template = document.createElement("template");
        template.innerHTML = `<div data-net="msg">${msg}</div>`;
        debug.children[1].appendChild(template.content);

        // support for tree map
        const roots = document.querySelectorAll("div[data-net=tree-root]");
        for (let root of roots) {
            let globalDisplay = true;
            const prev = root.previousElementSibling;
            if (!prev.dataset["netDetect"]) {
                prev.addEventListener("click", () => {
                    Array.from(root.children).forEach(e => {
                        if (globalDisplay) {
                            if (e.dataset["net"] === "tree-node")
                                e.style.display = "none";
                            if (e.dataset["net"] === "tree-text" && !e.classList.contains("collapse"))
                                e.classList.add("collapse");
                        } else {
                            if (e.dataset["net"] === "tree-node")
                                e.style.display = "";
                            if (e.dataset["net"] === "tree-text" && e.classList.contains("collapse"))
                                e.classList.remove("collapse");
                        }
                    });
                    globalDisplay = !globalDisplay;
                });
                prev.dataset["netDetect"] = "done";
            }
        }
        // expand <=> collapse and dispaly field when hover
        const nodes = Array.from(document.querySelectorAll("div[data-net=tree-text]"));
        for (const node of nodes) {
            if (node.dataset["netDetect"] === "done")
                continue;
            node.addEventListener("click", () => {
                const nest = node.nextElementSibling;
                if (nest.style.display === "") {
                    nest.style.display = "none";
                    if (!node.classList.contains("collapse"))
                        node.classList.add("collapse");
                } else {
                    nest.style.display = "";
                    if (node.classList.contains("collapse"))
                        node.classList.remove("collapse");
                }
            });
            node.addEventListener("mouseenter", () => {
                /** @type {HTMLElement}*/
                const nest = node.nextElementSibling;
                nest.style.backgroundColor = "#444444";
            });
            node.addEventListener("mouseleave", () => {
                /** @type {HTMLElement}*/
                const nest = node.nextElementSibling;
                nest.style.backgroundColor = "";
            });
            node.dataset["netDetect"] = "done";
        }
    }

    static dumpPacket(obj) {
        this.dumpPacketOn();
        obj["debug"].map(msg => this.debug(msg));
    }
    static dumpPacketOn() {
        if (this._dumpPacket)
            return;
        const html =`
        <style>
            table[data-net=table] { border-spacing: 0; }
            table[data-net=table] tr { transition: all .5s; }
            table[data-net=table] tr:first-child {
                background-color: rgb(216, 216, 216);
                color: rgb(71, 71, 71);
            }
            table[data-net=table] tr:not(:first-child) { color: rgb(216, 216, 216); }
            table[data-net=table] th, table[data-net=table] td {
                line-height: 1.8rem;
                padding: 0 2rem;
            }
            table[data-net=table] th { line-height: 2rem; }
            table[data-net=table] tr:not(:first-child):hover { background-color: rgba(231, 231, 231, 0.137); }
            div[data-net=tree-text]::before { margin-right: .2rem; }
            div[data-net=tree-text].collapse::before {
                content: "";
                display: inline-block;
                border: 5px solid #F44336;
                border-right: 5px solid transparent;
                border-top: 5px solid transparent;
                border-bottom: 5px solid transparent;
            }
            div[data-net=tree-text]::before {
                content: "";
                display: inline-block;
                border: 5px solid #F44336;
                border-right: 5px solid transparent;
                border-left: 5px solid transparent;
                border-bottom: 5px solid transparent;
            }
            div[data-net=tree-node] {
                margin-left: 0.3rem;
                padding-inline-start: 1rem;
                border-left: 1px solid #F44336;
            }
            div[data-net=tree-root] { color: rgb(228, 228, 228); }
            div[data-net=debug] { position: fixed;padding: 1rem 2rem;top: 50vh;left: 50vw;box-sizing: border-box;background: rgba(0, 0, 0, 0.8);overflow-x: hidden;color: white;font-weight: 500;transform: translate(-250%, -50%);box-shadow: rgb(175, 175, 175) 0px 3px 7px;transition: all 1.5s ease 0s; }
            div[data-net=debug]::-webkit-scrollbar { display: none; }
            @media screen and (orientation: portrait) {
                div[data-net=debug] {
                    width: 90vw;height: 80vh;
                }
            }
            @media screen and (orientation: landscape) {
                div[data-net=debug] {
                    width: 80vw;height: 80vh;
                }

            }
            div[data-net=viewport]::-webkit-scrollbar { width: 0; }
            div[data-net=viewport] { overflow: -moz-scrollbars-none; }
            div[data-net=msg] { width: max-content;border-bottom: 1px solid hsla(0, 0%, 30%, 1);transition: background .5s; }
            div[data-net=msg]:hover { background: hsla(0, 0%, 23%, 1); }
            div[data-net=msg] *::selection { background: #6d6d6d; }
            div[data-net*=btn] { position: fixed;left: 0;width: 4rem;height: 2rem;color: azure;text-align: center;line-height: 2rem;font-weight: 100; }
            div[data-net*=btn] { transition: all .5s; }
            div[data-net*=btn]:nth-child(n+1) { background: #607d8b; }
            div[data-net*=btn]:nth-child(n+2) { background: #00bcd4; }
            div[data-net*=btn]:nth-child(n+1):hover { background: #455a64; }
            div[data-net*=btn]:nth-child(n+2):hover { background: #0097a7; }
        </style>
        <div>
            <div data-net="debug-btn" style="top: calc(45%);">Debug</div>
            <div data-net="clear-btn" style="top: calc(45% + 2rem)">Clear</div>
        </div>
        <div data-net="debug">
            <div style="font-size: 1.3rem;padding: 0.2rem 0;">Remote Console ...<span data-net="magic">...</span></div>
            <div data-net="viewport" style="overflow-y: scroll;height: 92.7%;width: 100%;">
            </div>
        </div>
        `.trim();
        const template = document.createElement("template");
        template.innerHTML = html;
        document.body.append(template.content);

        /** @type {HTMLElement} */
        const debug = document.querySelector("[data-net=debug]");
        /** @type {HTMLElement} */
        const debugBtn = document.querySelector("[data-net=debug-btn]");
        /** @type {HTMLElement} */
        const clearBtn = document.querySelector("[data-net=clear-btn]");

        let debugOn = true;
        debug.addEventListener("dblclick", () => {
            debug.style.transform = "translate(-250%, -50%)";
        });
        debugBtn.addEventListener("click", () => {
            if (debugOn) {
                debug.style.transform = "translate(-250%, -50%)";
                debugOn = false;
            } else {
                debug.style.transform = "translate(-50%, -50%)";
                debugOn = true;
            }
        });
        clearBtn.addEventListener("click", () => {
            debug.children[1].innerHTML = "";
        });
        setTimeout(() => debug.style.transform = "translate(-50%, -50%)", 0);
        this._dumpPacket = true;

        const magic = document.querySelector("span[data-net=magic]");
        let start = Date.now();
        let chars = ["/", "-", "\\", "|"]
        let index = 0;
        const animate = () => {
            const current = Date.now();
            if (current - start > 100) {
                start = current;
                magic.textContent = chars[index];
                index = (index + 1) % chars.length;
            }
            requestAnimationFrame(animate);
        };
        animate();
    }

    static _packetToForm(obj) {
        obj = Object.assign({
            code: 0,
            data: {},
            file: {}
        }, obj);
        const form = new FormData();
        for (let k in obj) {
            if (obj[k] instanceof Object) {
                const className = Object.getPrototypeOf(obj[k]).constructor.name;
                if (k === "file") {
                    for (let kk in obj[k]) {
                        form.set(obj[k][kk], obj[k][kk], kk)
                    }
                } else if (className === "Object" || className === "Array") {
                    form.set(k, JSON.stringify(obj[k]))
                } else {
                    throw new Error("Cannot parse the obj");
                }
            } else {
                form.set(k, obj[k]);
            }
        }
        return form;
    }
}

/*! art-template@4.13.2 for browser | https://github.com/aui/art-template */
!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.template=t():e.template=t()}("undefined"!=typeof self?self:this,function(){return function(e){function t(r){if(n[r])return n[r].exports;var i=n[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,t),i.l=!0,i.exports}var n={};return t.m=e,t.c=n,t.d=function(e,n,r){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:r})},t.n=function(e){var n=e&&e.__esModule?function(){return e["default"]}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=4)}([function(e,t,n){"use strict";var r=n(6),i=n(2),o=n(22),s=function(e,t){t.onerror(e,t);var n=function(){return"{Template Error}"};return n.mappings=[],n.sourcesContent=[],n},a=function u(e){var t=arguments.length>1&&arguments[1]!==undefined?arguments[1]:{};"string"!=typeof e?t=e:t.source=e,t=i.$extend(t),e=t.source,!0===t.debug&&(t.cache=!1,t.minimize=!1,t.compileDebug=!0),t.compileDebug&&(t.minimize=!1),t.filename&&(t.filename=t.resolveFilename(t.filename,t));var n=t.filename,a=t.cache,c=t.caches;if(a&&n){var l=c.get(n);if(l)return l}if(!e)try{e=t.loader(n,t),t.source=e}catch(m){var f=new o({name:"CompileError",path:n,message:"template not found: "+m.message,stack:m.stack});if(t.bail)throw f;return s(f,t)}var p=void 0,h=new r(t);try{p=h.build()}catch(f){if(f=new o(f),t.bail)throw f;return s(f,t)}var d=function(e,n){try{return p(e,n)}catch(f){if(!t.compileDebug)return t.cache=!1,t.compileDebug=!0,u(t)(e,n);if(f=new o(f),t.bail)throw f;return s(f,t)()}};return d.mappings=p.mappings,d.sourcesContent=p.sourcesContent,d.toString=function(){return p.toString()},a&&n&&c.set(n,d),d};a.Compiler=r,e.exports=a},function(e,t){Object.defineProperty(t,"__esModule",{value:!0}),t["default"]=/((['"])(?:(?!\2|\\).|\\(?:\r\n|[\s\S]))*(\2)?|`(?:[^`\\$]|\\[\s\S]|\$(?!\{)|\$\{(?:[^{}]|\{[^}]*\}?)*\}?)*(`)?)|(\/\/.*)|(\/\*(?:[^*]|\*(?!\/))*(\*\/)?)|(\/(?!\*)(?:\[(?:(?![\]\\]).|\\.)*\]|(?![\/\]\\]).|\\.)+\/(?:(?!\s*(?:\b|[\u0080-\uFFFF$\\'"~({]|[+\-!](?!=)|\.?\d))|[gmiyu]{1,5}\b(?![\u0080-\uFFFF$\\]|\s*(?:[+\-*%&|^<>!=?({]|\/(?![\/*])))))|(0[xX][\da-fA-F]+|0[oO][0-7]+|0[bB][01]+|(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?)|((?!\d)(?:(?!\s)[$\w\u0080-\uFFFF]|\\u[\da-fA-F]{4}|\\u\{[\da-fA-F]+\})+)|(--|\+\+|&&|\|\||=>|\.{3}|(?:[+\-\/%&|^]|\*{1,2}|<{1,2}|>{1,3}|!=?|={1,2})=?|[?~.,:;[\](){}])|(\s+)|(^$|[\s\S])/g,t.matchToToken=function(e){var t={type:"invalid",value:e[0]};return e[1]?(t.type="string",t.closed=!(!e[3]&&!e[4])):e[5]?t.type="comment":e[6]?(t.type="comment",t.closed=!!e[7]):e[8]?t.type="regex":e[9]?t.type="number":e[10]?t.type="name":e[11]?t.type="punctuator":e[12]&&(t.type="whitespace"),t}},function(e,t,n){"use strict";function r(){this.$extend=function(e){return e=e||{},o(e,e instanceof r?e:this)}}var i=n(10),o=n(12),s=n(13),a=n(14),u=n(15),c=n(16),l=n(17),f=n(18),p=n(19),h=n(21),d="undefined"==typeof window,m={source:null,filename:null,rules:[f,l],escape:!0,debug:!!d&&"production"!==process.env.NODE_ENV,bail:!0,cache:!0,minimize:!0,compileDebug:!1,resolveFilename:h,include:s,htmlMinifier:p,htmlMinifierOptions:{collapseWhitespace:!0,minifyCSS:!0,minifyJS:!0,ignoreCustomFragments:[]},onerror:a,loader:c,caches:u,root:"/",extname:".art",ignore:[],imports:i};r.prototype=m,e.exports=new r},function(e,t){},function(e,t,n){"use strict";var r=n(5),i=n(0),o=n(23),s=function(e,t){return t instanceof Object?r({filename:e},t):i({filename:e,source:t})};s.render=r,s.compile=i,s.defaults=o,e.exports=s},function(e,t,n){"use strict";var r=n(0),i=function(e,t,n){return r(e,n)(t)};e.exports=i},function(e,t,n){"use strict";function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e){if(Array.isArray(e)){for(var t=0,n=Array(e.length);t<e.length;t++)n[t]=e[t];return n}return Array.from(e)}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var s=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),a=n(7),u=n(9),c="$data",l="$imports",f="print",p="include",h="extend",d="block",m="$$out",v="$$line",g="$$blocks",y="$$slice",b="$$from",w="$$options",x=function(e,t){return Object.hasOwnProperty.call(e,t)},k=JSON.stringify,E=function(){function e(t){var n,s,a=this;o(this,e);var x=t.source,k=t.minimize,E=t.htmlMinifier;if(this.options=t,this.stacks=[],this.context=[],this.scripts=[],this.CONTEXT_MAP={},this.ignore=[c,l,w].concat(i(t.ignore)),this.internal=(n={},r(n,m,"''"),r(n,v,"[0,0]"),r(n,g,"arguments[1]||{}"),r(n,b,"null"),r(n,f,"function(){var s=''.concat.apply('',arguments);"+m+"+=s;return s}"),r(n,p,"function(src,data){var s="+w+".include(src,data||"+c+",arguments[2]||"+g+","+w+");"+m+"+=s;return s}"),r(n,h,"function(from){"+b+"=from}"),r(n,y,"function(c,p,s){p="+m+";"+m+"='';c();s="+m+";"+m+"=p+s;return s}"),r(n,d,"function(){var a=arguments,s;if(typeof a[0]==='function'){return "+y+"(a[0])}else if("+b+"){if(!"+g+"[a[0]]){"+g+"[a[0]]="+y+"(a[1])}else{"+m+"+="+g+"[a[0]]}}else{s="+g+"[a[0]];if(typeof s==='string'){"+m+"+=s}else{s="+y+"(a[1])}return s}}"),n),this.dependencies=(s={},r(s,f,[m]),r(s,p,[m,w,c,g]),r(s,h,[b,p]),r(s,d,[y,b,m,g]),s),this.importContext(m),t.compileDebug&&this.importContext(v),k)try{x=E(x,t)}catch(T){}this.source=x,this.getTplTokens(x,t.rules,this).forEach(function(e){e.type===u.TYPE_STRING?a.parseString(e):a.parseExpression(e)})}return s(e,[{key:"getTplTokens",value:function(){return u.apply(undefined,arguments)}},{key:"getEsTokens",value:function(e){return a(e)}},{key:"getVariables",value:function(e){var t=!1;return e.filter(function(e){return"whitespace"!==e.type&&"comment"!==e.type}).filter(function(e){return"name"===e.type&&!t||(t="punctuator"===e.type&&"."===e.value,!1)}).map(function(e){return e.value})}},{key:"importContext",value:function(e){var t=this,n="",r=this.internal,i=this.dependencies,o=this.ignore,s=this.context,a=this.options,u=a.imports,f=this.CONTEXT_MAP;x(f,e)||-1!==o.indexOf(e)||(x(r,e)?(n=r[e],x(i,e)&&i[e].forEach(function(e){return t.importContext(e)})):n="$escape"===e||"$each"===e||x(u,e)?l+"."+e:c+"."+e,f[e]=n,s.push({name:e,value:n}))}},{key:"parseString",value:function(e){var t=e.value;if(t){var n=m+"+="+k(t);this.scripts.push({source:t,tplToken:e,code:n})}}},{key:"parseExpression",value:function(e){var t=this,n=e.value,r=e.script,i=r.output,o=this.options.escape,s=r.code;i&&(s=!1===o||i===u.TYPE_RAW?m+"+="+r.code:m+"+=$escape("+r.code+")");var a=this.getEsTokens(s);this.getVariables(a).forEach(function(e){return t.importContext(e)}),this.scripts.push({source:n,tplToken:e,code:s})}},{key:"checkExpression",value:function(e){for(var t=[[/^\s*}[\w\W]*?{?[\s;]*$/,""],[/(^[\w\W]*?\([\w\W]*?(?:=>|\([\w\W]*?\))\s*{[\s;]*$)/,"$1})"],[/(^[\w\W]*?\([\w\W]*?\)\s*{[\s;]*$)/,"$1}"]],n=0;n<t.length;){if(t[n][0].test(e)){var r;e=(r=e).replace.apply(r,i(t[n]));break}n++}try{return new Function(e),!0}catch(o){return!1}}},{key:"build",value:function(){var e=this.options,t=this.context,n=this.scripts,r=this.stacks,i=this.source,o=e.filename,s=e.imports,a=[],f=x(this.CONTEXT_MAP,h),d=0,y=function(e,t){var n=t.line,i=t.start,o={generated:{line:r.length+d+1,column:1},original:{line:n+1,column:i+1}};return d+=e.split(/\n/).length-1,o},E=function(e){return e.replace(/^[\t ]+|[\t ]$/g,"")};r.push("function("+c+"){"),r.push("'use strict'"),r.push(c+"="+c+"||{}"),r.push("var "+t.map(function(e){return e.name+"="+e.value}).join(",")),e.compileDebug?(r.push("try{"),n.forEach(function(e){e.tplToken.type===u.TYPE_EXPRESSION&&r.push(v+"=["+[e.tplToken.line,e.tplToken.start].join(",")+"]"),a.push(y(e.code,e.tplToken)),r.push(E(e.code))}),r.push("}catch(error){"),r.push("throw {"+["name:'RuntimeError'","path:"+k(o),"message:error.message","line:"+v+"[0]+1","column:"+v+"[1]+1","source:"+k(i),"stack:error.stack"].join(",")+"}"),r.push("}")):n.forEach(function(e){a.push(y(e.code,e.tplToken)),r.push(E(e.code))}),f&&(r.push(m+"=''"),r.push(p+"("+b+","+c+","+g+")")),r.push("return "+m),r.push("}");var T=r.join("\n");try{var O=new Function(l,w,"return "+T)(s,e);return O.mappings=a,O.sourcesContent=[i],O}catch(P){for(var $=0,j=0,_=0,S=void 0;$<n.length;){var C=n[$];if(!this.checkExpression(C.code)){j=C.tplToken.line,_=C.tplToken.start,S=C.code;break}$++}throw{name:"CompileError",path:o,message:P.message,line:j+1,column:_+1,source:i,generated:S,stack:P.stack}}}}]),e}();E.CONSTS={DATA:c,IMPORTS:l,PRINT:f,INCLUDE:p,EXTEND:h,BLOCK:d,OPTIONS:w,OUT:m,LINE:v,BLOCKS:g,SLICE:y,FROM:b,ESCAPE:"$escape",EACH:"$each"},e.exports=E},function(e,t,n){"use strict";var r=n(8),i=n(1)["default"],o=n(1).matchToToken,s=function(e){return e.match(i).map(function(e){return i.lastIndex=0,o(i.exec(e))}).map(function(e){return"name"===e.type&&r(e.value)&&(e.type="keyword"),e})};e.exports=s},function(e,t,n){"use strict";var r={"abstract":!0,await:!0,"boolean":!0,"break":!0,"byte":!0,"case":!0,"catch":!0,"char":!0,"class":!0,"const":!0,"continue":!0,"debugger":!0,"default":!0,"delete":!0,"do":!0,"double":!0,"else":!0,"enum":!0,"export":!0,"extends":!0,"false":!0,"final":!0,"finally":!0,"float":!0,"for":!0,"function":!0,"goto":!0,"if":!0,"implements":!0,"import":!0,"in":!0,"instanceof":!0,"int":!0,"interface":!0,"let":!0,"long":!0,"native":!0,"new":!0,"null":!0,"package":!0,"private":!0,"protected":!0,"public":!0,"return":!0,"short":!0,"static":!0,"super":!0,"switch":!0,"synchronized":!0,"this":!0,"throw":!0,"transient":!0,"true":!0,"try":!0,"typeof":!0,"var":!0,"void":!0,"volatile":!0,"while":!0,"with":!0,"yield":!0};e.exports=function(e){return r.hasOwnProperty(e)}},function(e,t,n){"use strict";function r(e){var t=new String(e.value);return t.line=e.line,t.start=e.start,t.end=e.end,t}function i(e,t,n){this.type=e,this.value=t,this.script=null,n?(this.line=n.line+n.value.split(/\n/).length-1,this.line===n.line?this.start=n.end:this.start=n.value.length-n.value.lastIndexOf("\n")-1):(this.line=0,this.start=0),this.end=this.start+this.value.length}var o=function(e,t){for(var n=arguments.length>2&&arguments[2]!==undefined?arguments[2]:{},o=[new i("string",e)],s=0;s<t.length;s++)for(var a=t[s],u=a.test.ignoreCase?"ig":"g",c=new RegExp(a.test.source,u),l=0;l<o.length;l++){var f=o[l],p=o[l-1];if("string"===f.type){for(var h=void 0,d=0,m=[],v=f.value;null!==(h=c.exec(v));)h.index>d&&(p=new i("string",v.slice(d,h.index),p),m.push(p)),p=new i("expression",h[0],p),h[0]=r(p),p.script=a.use.apply(n,h),m.push(p),d=h.index+h[0].length;d<v.length&&(p=new i("string",v.slice(d),p),m.push(p)),o.splice.apply(o,[l,1].concat(m)),l+=m.length-1}}return o};o.TYPE_STRING="string",o.TYPE_EXPRESSION="expression",o.TYPE_RAW="raw",o.TYPE_ESCAPE="escape",e.exports=o},function(e,t,n){"use strict";(function(t){function n(e){return"string"!=typeof e&&(e=e===undefined||null===e?"":"function"==typeof e?n(e.call(e)):JSON.stringify(e)),e}function r(e){var t=""+e,n=s.exec(t);if(!n)return e;var r="",i=void 0,o=void 0,a=void 0;for(i=n.index,o=0;i<t.length;i++){switch(t.charCodeAt(i)){case 34:a="&#34;";break;case 38:a="&#38;";break;case 39:a="&#39;";break;case 60:a="&#60;";break;case 62:a="&#62;";break;default:continue}o!==i&&(r+=t.substring(o,i)),o=i+1,r+=a}return o!==i?r+t.substring(o,i):r}/*! art-template@runtime | https://github.com/aui/art-template */
var i="undefined"!=typeof self?self:"undefined"!=typeof window?window:void 0!==t?t:{},o=Object.create(i),s=/["&'<>]/;o.$escape=function(e){return r(n(e))},o.$each=function(e,t){if(Array.isArray(e))for(var n=0,r=e.length;n<r;n++)t(e[n],n);else for(var i in e)t(e[i],i)},e.exports=o}).call(t,n(11))},function(e,t){var n;n=function(){return this}();try{n=n||Function("return this")()||(0,eval)("this")}catch(r){"object"==typeof window&&(n=window)}e.exports=n},function(e,t,n){"use strict";var r=Object.prototype.toString,i=function(e){return null===e?"Null":r.call(e).slice(8,-1)},o=function s(e,t){var n=void 0,r=i(e);if("Object"===r?n=Object.create(t||{}):"Array"===r&&(n=[].concat(t||[])),n){for(var o in e)Object.hasOwnProperty.call(e,o)&&(n[o]=s(e[o],n[o]));return n}return e};e.exports=o},function(e,t,n){"use strict";var r=function(e,t,r,i){var o=n(0);return i=i.$extend({filename:i.resolveFilename(e,i),bail:!0,source:null}),o(i)(t,r)};e.exports=r},function(e,t,n){"use strict";var r=function(e){console.error(e.name,e.message)};e.exports=r},function(e,t,n){"use strict";var r={__data:Object.create(null),set:function(e,t){this.__data[e]=t},get:function(e){return this.__data[e]},reset:function(){this.__data={}}};e.exports=r},function(e,t,n){"use strict";var r="undefined"==typeof window,i=function(e){if(r){return n(3).readFileSync(e,"utf8")}var t=document.getElementById(e);return t.value||t.innerHTML};e.exports=i},function(e,t,n){"use strict";var r={test:/{{([@#]?)[ \t]*(\/?)([\w\W]*?)[ \t]*}}/,use:function(e,t,n,i){var o=this,s=o.options,a=o.getEsTokens(i),u=a.map(function(e){return e.value}),c={},l=void 0,f=!!t&&"raw",p=n+u.shift(),h=function(t,n){console.warn((s.filename||"anonymous")+":"+(e.line+1)+":"+(e.start+1)+"\nTemplate upgrade: {{"+t+"}} -> {{"+n+"}}")};switch("#"===t&&h("#value","@value"),p){case"set":i="var "+u.join("").trim();break;case"if":i="if("+u.join("").trim()+"){";break;case"else":var d=u.indexOf("if");~d?(u.splice(0,d+1),i="}else if("+u.join("").trim()+"){"):i="}else{";break;case"/if":i="}";break;case"each":l=r._split(a),l.shift(),"as"===l[1]&&(h("each object as value index","each object value index"),l.splice(1,1));i="$each("+(l[0]||"$data")+",function("+(l[1]||"$value")+","+(l[2]||"$index")+"){";break;case"/each":i="})";break;case"block":l=r._split(a),l.shift(),i="block("+l.join(",").trim()+",function(){";break;case"/block":i="})";break;case"echo":p="print",h("echo value","value");case"print":case"include":case"extend":if(0!==u.join("").trim().indexOf("(")){l=r._split(a),l.shift(),i=p+"("+l.join(",")+")";break}default:if(~u.indexOf("|")){var m=a.reduce(function(e,t){var n=t.value,r=t.type;return"|"===n?e.push([]):"whitespace"!==r&&"comment"!==r&&(e.length||e.push([]),":"===n&&1===e[e.length-1].length?h("value | filter: argv","value | filter argv"):e[e.length-1].push(t)),e},[]).map(function(e){return r._split(e)});i=m.reduce(function(e,t){var n=t.shift();return t.unshift(e),"$imports."+n+"("+t.join(",")+")"},m.shift().join(" ").trim())}f=f||"escape"}return c.code=i,c.output=f,c},_split:function(e){e=e.filter(function(e){var t=e.type;return"whitespace"!==t&&"comment"!==t});for(var t=0,n=e.shift(),r=/\]|\)/,i=[[n]];t<e.length;){var o=e[t];"punctuator"===o.type||"punctuator"===n.type&&!r.test(n.value)?i[i.length-1].push(o):i.push([o]),n=o,t++}return i.map(function(e){return e.map(function(e){return e.value}).join("")})}};e.exports=r},function(e,t,n){"use strict";var r={test:/<%(#?)((?:==|=#|[=-])?)[ \t]*([\w\W]*?)[ \t]*(-?)%>/,use:function(e,t,n,r){return n={"-":"raw","=":"escape","":!1,"==":"raw","=#":"raw"}[n],t&&(r="/*"+r+"*/",n=!1),{code:r,output:n}}};e.exports=r},function(e,t,n){"use strict";function r(e){if(Array.isArray(e)){for(var t=0,n=Array(e.length);t<e.length;t++)n[t]=e[t];return n}return Array.from(e)}var i="undefined"==typeof window,o=function(e,t){if(i){var o,s=n(20).minify,a=t.htmlMinifierOptions,u=t.rules.map(function(e){return e.test});(o=a.ignoreCustomFragments).push.apply(o,r(u)),e=s(e,a)}return e};e.exports=o},function(e,t){!function(e){e.noop=function(){}}("object"==typeof e&&"object"==typeof e.exports?e.exports:window)},function(e,t,n){"use strict";var r="undefined"==typeof window,i=/^\.+\//,o=function(e,t){if(r){var o=n(3),s=t.root,a=t.extname;if(i.test(e)){var u=t.filename,c=!u||e===u,l=c?s:o.dirname(u);e=o.resolve(l,e)}else e=o.resolve(s,e);o.extname(e)||(e+=a)}return e};e.exports=o},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function o(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function s(e){var t=e.name,n=e.source,r=e.path,i=e.line,o=e.column,s=e.generated,a=e.message;if(!n)return a;var u=n.split(/\n/),c=Math.max(i-3,0),l=Math.min(u.length,i+3),f=u.slice(c,l).map(function(e,t){var n=t+c+1;return(n===i?" >> ":"    ")+n+"| "+e}).join("\n");return(r||"anonymous")+":"+i+":"+o+"\n"+f+"\n\n"+t+": "+a+(s?"\n   generated: "+s:"")}var a=function(e){function t(e){r(this,t);var n=i(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e.message));return n.name="TemplateError",n.message=s(e),Error.captureStackTrace&&Error.captureStackTrace(n,n.constructor),n}return o(t,e),t}(Error);e.exports=a},function(e,t,n){"use strict";e.exports=n(2)}])});