/*global QUnit*/

sap.ui.define([
	"listenanzeige/controller/Listenanzeige.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Listenanzeige Controller");

	QUnit.test("I should test the Listenanzeige controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
