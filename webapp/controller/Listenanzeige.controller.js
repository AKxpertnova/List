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

                // Declare variables
                const strURI = '/sap/opu/odata/XPN/ES_SB_AK';
		        const strPath = '/xXPNxES_DD_AK';
		        const oDataModel = new sap.ui.model.odata.ODataModel(strURI, true);
                let oErrorModel = new JSONModel();
                let oModel = new JSONModel();
                

                // Init ErrorModel
                oErrorModel.setData( {ErrorMessage : 'reading Data...' });
				this.getView().setModel(oErrorModel, 'ErrorModel');

                // Read oData
                oDataModel.read(strPath, {
					success: function (oData) {		

                        oModel.setData(this.ExtractoData(oData.results));						
                        this.getView().setModel(oModel,'ProductCollectionModel');
                        oErrorModel.setData( {ErrorMessage : 'reading Data completed!' });

					}.bind(this),
					error: function () {
						oErrorModel.setData( {ErrorMessage : 'Error in reading oData!' });
					}
				});
            },

            ExtractoData: function (data) {
				let oData = [];
                let oResults = new JSONModel();
                let strDay ;
                let strMonth ;
                let strDate ;
                let strYear;

				data.forEach(function (element) {
                    strDay = element.Startdate.getDate()
                    if (strDay.length === 1){
                        strDay = '0' + strDay;
                    }
                    strMonth =  (1 + element.Startdate.getMonth()).toString();
                    if (strMonth.length === 1){
                        strMonth = '0' + strMonth;
                    } 
                    strDate = strDay + '.' + strMonth + '.' + element.Startdate.getFullYear();
                    
                    oData.push({
                        "BatchID": element.Batchid,
                        "Customer": element.Customer,
                        "Plant": element.Plant,
                        "Product": element.Product,
                        "Startdate": strDate,
                        "Amount": element.Amount,
                        "Unit": element.Unit
                    })
				});

                oResults = ( { 'ProductCollection': oData })
				return oResults;
			},

            onAfterRendering() {
               
            }
        });
    });
