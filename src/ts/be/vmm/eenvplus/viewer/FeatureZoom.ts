///ts:ref=Module
/// <reference path="../Module.ts"/> ///ts:ref:generated

module be.vmm.eenvplus.viewer {
    'use strict';

    export var NAME:string = PREFIX + 'FeatureZoom';

    function configure():ng.IDirective {
        FeatureZoomController.$inject = ['epMap'];

        return {
            restrict: 'A',
            scope: {},
            controllerAs: 'ctrl',
            controller: FeatureZoomController,
            templateUrl: 'ts/be/vmm/eenvplus/viewer/FeatureZoom.html'
        };
    }

    class FeatureZoomController {

        /* ------------------ */
        /* --- properties --- */
        /* ------------------ */

        private map:ol.Map;


        /* -------------------- */
        /* --- construction --- */
        /* -------------------- */

        constructor(map:ol.Map) {
            this.map = map;
        }


        /* ----------------- */
        /* --- behaviour --- */
        /* ----------------- */

        /**
         * Zoom to the level that has most information, i.e. where all layers are visible.
         */
        public zoom() {
            var resolutions = _(this.map.getLayers().getArray())
                .filter('displayInLayerManager')
                .invoke(ol.layer.Base.prototype.get, ol.layer.LayerProperty.MAX_RESOLUTION)
                .value();
            this.map.getView().setResolution(Math.min.apply(null, resolutions) / 2);
        }

    }

    angular
        .module(MODULE)
        .directive(NAME, configure);

}
