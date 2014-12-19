///ts:ref=FeatureService
/// <reference path="./FeatureService.ts"/> ///ts:ref:generated
///ts:ref=SRSNameService
/// <reference path="../config/SRSNameService.ts"/> ///ts:ref:generated

module be.vmm.eenvplus.feature {
    'use strict';

    export module FeatureLayerFactory {
        export var NAME:string = PREFIX + 'FeatureLayerFactory';
    }

    export interface FeatureLayerFactory {
        createSource(type:FeatureType):ol.source.ServerVector;
        createLayer(type:FeatureType):ol.layer.Vector;
    }

    factory.$inject = ['gaFeatureManager', 'epSRSName'];

    function factory(service:FeatureService, srsName:config.SRSNameService):FeatureLayerFactory {
        return {
            createSource: createSource,
            createLayer: createLayer
        };

        function createSource(type:FeatureType):ol.source.ServerVector {
            var source = new ol.source.ServerVector({
                format: new ol.format.GeoJSON({
                    defaultDataProjection: srsName.default.code
                }),
                loader: load,
                strategy: ol.loadingstrategy.createTile(new ol.tilegrid.XYZ({
                    maxZoom: 19
                })),
                projection: srsName.default.code
            });

            return source;

            function load(extent:ol.Extent):void {
                service
                    .query(feature.toLayerBodId(type), extent)
                    .then(addFeatures);
            }

            function addFeatures(results:ol.format.GeoJSONFeature[]):void {
                source.addFeatures(source.readFeatures({
                    type: 'FeatureCollection',
                    features: results
                }));
            }
        }

        function createLayer(type:FeatureType):ol.layer.Vector {
        	var defaultStyle = createStyle(type, "default");
        	var modifiedStyle = createStyle(type, "modified");
            var layer = new ol.layer.Vector({
                source: createSource(type),
                style: function(feature, resolution) {
                	if(feature.getProperties().action) {
                		return modifiedStyle(feature, resolution);
                	} else {
                		return defaultStyle(feature, resolution);
                	}
                }
            });
            layer.set(model.LayerProperty.TYPE_ID, feature.toLayerBodId(type));
            layer.set(model.LayerProperty.FEATURE_TYPE, type);
            return layer;
        }
    }

    ol.format.GeoJSON.prototype.readFeatureFromObject =
        _.wrap(ol.format.GeoJSON.prototype.readFeatureFromObject, addKey);

    function addKey(fn:Function, json:feature.model.FeatureJSON, options?:any):feature.LocalFeature {
        var olFeature = fn(json, options);
        if (json.key) olFeature.key = json.key;
        olFeature.type = feature.toType(json.layerBodId);
        return olFeature;
    }

    angular
        .module(MODULE)
        .factory(FeatureLayerFactory.NAME, factory);

}
