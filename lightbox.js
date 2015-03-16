//Function.prototype.bind = function (bind) {
//var self = this;
//return function () {
//var args = Array.prototype.slice.call(arguments);
//return self.apply(bind || null, args);
//};
//};
/*!
 * Original lightbox script was made for ext3 SCHERP Ontwikkeling (scherpontwikkeling.nl) changed it to work on ext4
 */
Ext.ns('Ext.ux');

Ext.ux.Lightbox = (function () {
    var els = {},
        images = [],
        activeImage,
        initialized = false,
        selectors = [];

    return {
        overlayOpacity: 0.85,
        animate: true,
        resizeSpeed: 8,
        borderSize: 10,
        labelImage: "Image",
        labelOf: "of",

        init: function () {
            this.resizeDuration = this.animate ? ((11 - this.resizeSpeed) * 0.15) : 0;
            this.overlayDuration = this.animate ? 0.2 : 0;

            if (!initialized) {
                Ext.apply(this, Ext.util.Observable.prototype);
                Ext.util.Observable.constructor.call(this);
                this.addEvents('open', 'close');
                this.initMarkup();
                this.initEvents();
                initialized = true;
            }
        },

        initMarkup: function () {
            els.shim = Ext.getBody().createChild({
                tag: 'iframe',
                id: 'ux-lightbox-shim'
            }, null, true);
            els.overlay = Ext.getBody().createChild({
                id: 'ux-lightbox-overlay'
            }, null, true);

            els.shim = Ext.get(els.shim);
            els.overlay = Ext.get(els.overlay);

            var lightboxTpl = new Ext.Template(this.getTemplate());
            els.lightbox = lightboxTpl.append(document.body, {}, true);

            var ids =
                ['outerImageContainer', 'imageContainer', 'image', 'hoverNav', 'navPrev', 'navNext', 'loading', 'loadingLink',
                    'outerDataContainer', 'dataContainer', 'data', 'details', 'caption', 'imageNumber', 'bottomNav', 'navClose'];

            Ext.each(ids, function (id) {
                els[id] = Ext.get('ux-lightbox-' + id);
            });

            Ext.each([els.overlay, els.lightbox, els.shim], function (el) {
                Ext.get(el).setStyle('display', 'block');
                //el.setVisibilityMode(Ext.Element.DISPLAY)
                Ext.get(el).hide();
            });

            var size = (this.animate ? 250 : 1) + 'px';
            els.outerImageContainer.setStyle({
                width: size,
                height: size
            });
        },

        getTemplate: function () {
            return [
                '<div id="ux-lightbox">',
                '<div id="ux-lightbox-outerImageContainer">',
                '<div id="ux-lightbox-imageContainer">',
                '<img id="ux-lightbox-image">',
                '<div id="ux-lightbox-hoverNav">',
                '<a href="#" id="ux-lightbox-navPrev"></a>',
                '<a href="#" id="ux-lightbox-navNext"></a>',
                '</div>',
                '<div id="ux-lightbox-loading">',
                '<a id="ux-lightbox-loadingLink"></a>',
                '</div>',
                '</div>',
                '</div>',
                '<div id="ux-lightbox-outerDataContainer">',
                '<div id="ux-lightbox-dataContainer">',
                '<div id="ux-lightbox-data">',
                '<div id="ux-lightbox-details">',
                '<span id="ux-lightbox-caption"></span>',
                '<span id="ux-lightbox-imageNumber"></span>',
                '</div>',
                '<div id="ux-lightbox-bottomNav">',
                '<a href="#" id="ux-lightbox-navClose"></a>',
                '</div>',
                '</div>',
                '</div>',
                '</div>',
                '</div>'
            ];
        },

        initEvents: function () {
            var close = function (ev) {
                ev.preventDefault();
                Ext.get('ux-lightbox').setStyle('zIndex', 0);
                this.close();
            };

            els.overlay.on('click', close, this);
            els.loadingLink.on('click', close, this);
            els.navClose.on('click', close, this);

            els.lightbox.on('click', function (ev) {
                if (ev.getTarget().id == 'ux-lightbox') {
                    this.close();
                }
            }, this);

            els.navPrev.on('click', function (ev) {
                ev.preventDefault();
                this.setImage(activeImage - 1);
            }, this);

            els.navNext.on('click', function (ev) {
                ev.preventDefault();
                this.setImage(activeImage + 1);
            }, this);
        },

        register: function (sel, group) {
            if (selectors.indexOf(sel) === -1) {
                selectors.push(sel);

                Ext.fly(document).on('click', function (ev) {
                    var target = ev.getTarget(sel);

                    if (target) {
                        ev.preventDefault();
                        this.open(target, sel, group);
                    }
                }, this);
            }
        },

        open: function (image, sel, group) {
            group = group || false;
            this.setViewSize();
            Ext.get('ux-lightbox').setStyle('zIndex', 99999);
            els.overlay.fadeIn({
                duration: this.overlayDuration,
                endOpacity: this.overlayOpacity,
                callback: function () {
                    images = [];

                    var index = 0;
                    if (!group) {
                        images.push([image.href, image.title]);
                    }
                    else {
                        var setItems = Ext.query(sel);
                        Ext.each(setItems, function (item) {
                            if (item.href) {
                                images.push([item.href, item.title]);
                            }
                        });

                        while (images[index][0] != image.href) {
                            index++;
                        }
                    }

                    // calculate top and left offset for the lightbox
                    var pageScroll = Ext.fly(document).getScroll();

                    var lightboxTop = pageScroll.top + (Ext.Element.getViewportHeight() / 10);
                    var lightboxLeft = pageScroll.left;
                    els.lightbox.setStyle({
                        top: lightboxTop + 'px',
                        left: lightboxLeft + 'px'
                    }).show();

                    this.setImage(index);

                    this.fireEvent('open', images[index]);

                },
                scope: this
            });
        },

        setViewSize: function () {
            var viewSize = this.getViewSize();
            Ext.get(els.overlay).setStyle({
                width: viewSize[0] + 'px',
                height: viewSize[1] + 'px'
            });
            Ext.get(els.shim).setStyle({
                width: viewSize[0] + 'px',
                height: viewSize[1] + 'px'
            }).show();
        },

        setImage: function (index) {
            activeImage = index;

            this.disableKeyNav();
            if (this.animate) {
                els.loading.show();
            }

            els.image.hide();
            els.hoverNav.hide();
            els.navPrev.hide();
            els.navNext.hide();
            els.dataContainer.setOpacity(0.0001);
            els.imageNumber.hide();

            var preload = new Image();
            preload.onload = Ext.bind(function () {
                els.image.dom.src = images[activeImage][0];
                this.resizeImage(preload.width, preload.height);
                var filename = images[activeImage][1];
                filename = filename.substr(0, filename.length - 10);
            }, this);
            preload.src = images[activeImage][0];
        },

        resizeImage: function (w, h) {
            var wCur = els.outerImageContainer.getWidth();
            var hCur = els.outerImageContainer.getHeight();

            var wNew = (w + this.borderSize * 2);
            var hNew = (h + this.borderSize * 2);

            var wDiff = wCur - wNew;
            var hDiff = hCur - hNew;

            var afterResize = function () {
                els.hoverNav.setWidth(els.imageContainer.getWidth() + 'px');

                els.navPrev.setHeight(h + 'px');
                els.navNext.setHeight(h + 'px');

                els.outerDataContainer.setWidth(wNew + 'px');

                this.showImage();
            };

            if (hDiff != 0 || wDiff != 0) {
                els.outerImageContainer.shift({
                    height: hNew,
                    width: wNew,
                    duration: this.resizeDuration,
                    scope: this,
                    callback: afterResize,
                    delay: 50
                });
            }
            else {
                afterResize.call(this);
            }
        },

        showImage: function () {
            els.loading.hide();

            Ext.get(els.image).setStyle('visibility', 'visible');
            Ext.get(els.image).setStyle('opacity', 0);
            els.image.fadeIn({
                opacity: 1,
                duration: this.resizeDuration,
                scope: this,
                callback: function () {
                    this.updateDetails();
                }
            });
            this.preloadImages();
        },

        updateDetails: function () {
            var detailsWidth = els.data.getWidth(true) - els.navClose.getWidth() - 10;
            els.details.setWidth((detailsWidth > 0 ? detailsWidth : 0) + 'px');


            els.caption.update(' Index:<select name="index" id="index" onChange="RunScript">\
                         <option value="1">for Color Layout (MPEG- 7)</option>\
                        <option value="2">for Scalable Color (MPEG- 7)</option>\
                        <option value="3">for Edge Histogram (MPEG- 7)</option>\
                        <option value="9">for Tamura Texture Features</option>\
                        <option value="5">for Color and Edge Directivity Descriptor</option>\
                        <option value="6">for Fuzzy Color and Texture Histogram</option>\
                        <option value="7">for JCD</option>\
                        <option value="8">for RGB Color Histogram</option>\n\
                        <option value="10">for GaborTexture Features</option>\n\
                        <option value="11">for JPEG Coefficients Histogram</option>\
                        </select>\n\
                       <button id="getservicelink" > Search </button>');
            var t_link = this;
            jQuery("#getservicelink").click(function () {
                t_link.close();
                SOD.tabpanel.setActiveTab(1);
                var indexvalue = jQuery("#index").val();
                var sat = jQuery("#sat").val();
                var yearval = jQuery("#year").val();
                var threshold = jQuery("#threshold").val();
                var img_url = jQuery("#ux-lightbox-image").attr('src');//.replace('lightbox','').replace('thumb_','');
                var productname = SOD.selectedFileInstrument;

                var title = jQuery("#ux-lightbox-image").attr('title');
                var imageurl = "http://innovations.itsc.uah.edu/cbir/retrieve.php?index=" + indexvalue + "&file=" + img_url + "&product=" + productname;
                var name = "";
                if (indexvalue == 1) {
                    name = 'for Color Layout (MPEG- 7)';

                } else if (indexvalue == 7) {

                    name = 'for JCD';
                }
                else if (indexvalue == 2) {

                    name = 'for Scalable Color (MPEG- 7)';
                }
                else if (indexvalue == 3) {

                    name = 'for Edge Histogram (MPEG- 7)';
                } else if (indexvalue == 10) {

                    name = 'for GaborTexture Features';
                }
                else if (indexvalue == 5) {
                    name = 'for Color and Edge Directivity Descriptor';

                }
                else if (indexvalue == 6) {
                    name = 'for Fuzzy Color and Texture Histogram';

                } else if (indexvalue == 8) {
                    name = 'for RGB Color Histogram';

                }
                else {

                    name = 'for JPEG Coefficients Histogram';
                }
                jQuery("#searchedimage").html("<div id='searchedid' style='padding:5px;'><img width='80%' height='80%' src='" + img_url + "' /></div>");
                jQuery("#searchedname").html("<div id='searchednameid' style='font: bold 13px Arial,Helvetica;'>Search Results " + name + "</div>");
                SOD.imageurldefault = encodeURIComponent(imageurl);
                SOD.storeresultImage.proxy.url = Drupal.settings.basePath + 'getservice?file=' + SOD.imageurldefault + "&threshold=0&histo=false";
                SOD.storeresultImage.load();
                SOD.storeHistogram.proxy.url = Drupal.settings.basePath + 'getservice?file=' + SOD.imageurldefault + '&threshold=0&histo=true';
                SOD.storeHistogram.load();
                //  Ext.getCmp('chartCmp').doLayout();
            });
            els.caption.show();
            if (images.length > 1) {
                els.imageNumber.update(this.labelImage + ' ' + (activeImage + 1) + ' ' + this.labelOf + '  ' + images.length);
                els.imageNumber.show();
            }

            els.dataContainer.fadeIn({
                duration: this.resizeDuration / 2,
                scope: this,
                callback: function () {
                    var viewSize = this.getViewSize();
                    els.overlay.setHeight(viewSize[1] + 'px');
                    this.updateNav();
                }
            });
        },

        updateNav: function () {
            this.enableKeyNav();

            els.hoverNav.show();

            // if not first image in set, display prev image button
            if (activeImage > 0)
                els.navPrev.show();

            // if not last image in set, display next image button
            if (activeImage < (images.length - 1))
                els.navNext.show();
        },

        enableKeyNav: function () {
            Ext.fly(document).on('keydown', this.keyNavAction, this);
        },

        disableKeyNav: function () {
            Ext.fly(document).un('keydown', this.keyNavAction, this);
        },

        keyNavAction: function (ev) {
            var keyCode = ev.getKey();

            if (
                keyCode == 88 || // x
                keyCode == 67 || // c
                keyCode == 27
            ) {
                this.close();
            }
            else if (keyCode == 80 || keyCode == 37) { // display previous image
                if (activeImage != 0) {
                    this.setImage(activeImage - 1);
                }
            }
            else if (keyCode == 78 || keyCode == 39) { // display next image
                if (activeImage != (images.length - 1)) {
                    this.setImage(activeImage + 1);
                }
            }
        },

        preloadImages: function () {
            var next, prev;
            if (images.length > activeImage + 1) {
                next = new Image();
                next.src = images[activeImage + 1][0];
            }
            if (activeImage > 0) {
                prev = new Image();
                prev.src = images[activeImage - 1][0];
            }
        },

        close: function () {
            this.disableKeyNav();
            els.lightbox.hide();
            els.overlay.fadeOut({
                duration: this.overlayDuration
            });
            els.image.setStyle('display', 'none');
            els.shim.hide();
            this.fireEvent('close', activeImage);
        },

        getViewSize: function () {
            return [Ext.Element.getViewportWidth(), Ext.Element.getViewportHeight()];
        }
    }
})();

Ext.onReady(Ext.ux.Lightbox.init, Ext.ux.Lightbox);