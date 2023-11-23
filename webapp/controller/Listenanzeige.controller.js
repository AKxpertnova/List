sap.ui.define([
    "sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel) {
        "use strict";

        return Controller.extend("listenanzeige.controller.Listenanzeige", {

            onInit: function () {

                const strURI = '/sap/opu/odata/XPN/ES_SB_AK';
		        const strPath = '/xXPNxES_DD_AK';
		        const oNewModel = new sap.ui.model.odata.ODataModel(strURI, true);

                oNewModel.read(strPath, {
					success: function (oData) {
						console.log("Succesfully read DB");
						this.getView().getModel().setProperty("/odata", oData);
						//this.assignAppointments();
						// Collect all project names in order to use them in export dialog
						var aProjects = this.extractProjects(oData.results);
						this.getView().getModel().setProperty("/Projects", aProjects);

					}.bind(this),
					error: function (oError) {
						console.log("Fehler beim lesen der oData", oError);
					}
				});

                const oModel = new JSONModel(sap.ui.require.toUrl("listenanzeige/mock/products.json"));
			    this.getView().setModel(oModel);

            },

            onAfterRendering() {
               
            }
        });
    });
