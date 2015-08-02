'use strict';

var Masonry = require('masonry-layout');

require('./set-selector.module.js')
    .directive('masonry', masonry);

// @ngInject
function masonry($timeout) {
    var directive = {
        link: masonryLink,
        restrict: 'A',
        scope: true
    };
    return directive;

    function masonryLink(scope, element) {
        var msnry;

        if (scope.$last) {
            initMasonry();
        }

        function initMasonry() {
            $timeout(function () {
                msnry = new Masonry(element.parent()[0], {
                    columnWidth: '.artist',
                    itemSelector: '.artist',
                    isAnimated: false,
                    isResizable: false
                });
            });
        }
    }
}
