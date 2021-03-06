///ts:ref=Module
/// <reference path="../Module.ts"/> ///ts:ref:generated
///ts:ref=Action
/// <reference path="./geometry/Action.ts"/> ///ts:ref:generated

module be.vmm.eenvplus.editor {
    'use strict';


    Cursor.$inject = ['epMap', 'epStateStore', 'epAreaStore', 'epGeometryActionStore'];

    var actionCursor = [
        'add',
        'forbidden',
        'move',
        'modify',
        'remove'
    ].map(toCSS);

    function toCSS(name:string):string {
        return 'url("img/cursor/' + name + '.cur"), url("img/cursor/' + name + '.png"), default';
    }

    function Cursor(map:ol.Map,
                    stateStore:state.StateStore,
                    areaStore:area.AreaStore,
                    actionStore:geometry.ActionStore):void {

        /* ------------------ */
        /* --- properties --- */
        /* ------------------ */

        var el = $(map.getViewport()),
            action = geometry.Action.NONE;


        /* -------------------- */
        /* --- construction --- */
        /* -------------------- */

        stateStore.modeChanged.add(<any>invalidateState);
        stateStore.geometryModeChanged.add(<any>invalidateState);
        areaStore.selected.add(handleAreaSelection);
        actionStore.selected.add(setAction);


        /* ---------------------- */
        /* --- event handlers --- */
        /* ---------------------- */

        function handleAreaSelection(extent:ol.Extent):void {
            extent ?
                el.on('mousemove', handleMouseMove) :
                el.off('mousemove', handleMouseMove);
            invalidateState();
        }

        function handleMouseMove(event:any):void {
            invalidateState(map.getEventCoordinate(event));
        }


        /* ----------------- */
        /* --- behaviour --- */
        /* ----------------- */

        function setAction($action:geometry.Action):void {
            action = $action;
            el.css('cursor', actionCursor[action]);
        }

        /**
         * Crosshair is shown:
         * - only in 'edit' mode, never in 'view' mode
         * - when no area has been selected yet
         * - when the user is painting and the mouse is inside the selected area
         *
         * Action cursor is shown (inside the selected area only) when editing geometry.
         *
         * @param mouseCoordinate
         */
        function invalidateState(mouseCoordinate?:ol.Coordinate):void {
            var isDrawing = editing() && (!areaStore.current || painting() && inArea(mouseCoordinate)),
                isModifying = modifying() && inArea(mouseCoordinate),
                cursor = 'default';

            if (isModifying) cursor = actionCursor[action];
            else if (isDrawing) cursor = 'crosshair';

            el.css('cursor', cursor);
        }

        function editing():boolean {
            return stateStore.currentMode === state.State.EDIT;
        }

        function painting():boolean {
            return stateStore.currentGeometryMode === state.State.GEOMETRY_PAINTING;
        }

        function modifying():boolean {
            return stateStore.currentGeometryMode === state.State.GEOMETRY_MODIFYING;
        }

        function inArea(mouseCoordinate:ol.Coordinate):boolean {
            return ol.extent.containsCoordinate(areaStore.current, mouseCoordinate);
        }

    }

    angular
        .module(MODULE)
        .run(Cursor);

}
