sap.ui.define([
    "sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel) {
        "use strict";
        var oInitProductCollectionModel ;

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

                        oModel.setData(this.extractoData(oData.results));						
                        this.getView().setModel(oModel,'ProductCollectionModel');

                        oInitProductCollectionModel = oModel;
                        oErrorModel.setData( {ErrorMessage : 'reading Data completed!' });

					}.bind(this),
					error: function () {
						oErrorModel.setData( {ErrorMessage : 'Error in reading oData!' });
					}
				});
            },

            extractoData: function (data) {
				let oData = [];
                let oResults = new JSONModel();
                let strDay ;
                let strMonth ;
                let strDate ;                

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

            onSearch(oEvent) {
                this.getView().setModel(oInitProductCollectionModel,'ProductCollectionModel');
                let sValue = oEvent.getParameter("query");
                let oErrorModel = new JSONModel();                
                let oModel = new JSONModel();
                let oData = [];
                let intCounter = 0;
                let oResult = new JSONModel();                
                let oProductCollectionModel = this.getView().getModel('ProductCollectionModel').getData();

                if (sValue !== ''){                
                    for (intCounter = 0; intCounter < oProductCollectionModel.ProductCollection.length; intCounter++){                        
                        if (oProductCollectionModel.ProductCollection[intCounter].Amount.indexOf(sValue) > -1 
                        || oProductCollectionModel.ProductCollection[intCounter].BatchID.toLowerCase().indexOf(sValue) > -1
                        || oProductCollectionModel.ProductCollection[intCounter].Customer.toLowerCase().indexOf(sValue) > -1
                        || oProductCollectionModel.ProductCollection[intCounter].Plant.toLowerCase().indexOf(sValue) > -1
                        || oProductCollectionModel.ProductCollection[intCounter].Product.toLowerCase().indexOf(sValue) > -1
                        || oProductCollectionModel.ProductCollection[intCounter].Startdate.indexOf(sValue) > -1
                        || oProductCollectionModel.ProductCollection[intCounter].Unit.toLowerCase().indexOf(sValue) > -1) {
                            oData.push(oProductCollectionModel.ProductCollection[intCounter]);
                        } 
                    }  
                    if (oData.length > 0) {
                        oResult = ( { 'ProductCollection': oData })
                        oModel.setData(oResult);
                        this.getView().setModel(oModel,'ProductCollectionModel');
                    }                    
                    oErrorModel.setData( {ErrorMessage : oData.length + ' Data found!' });
                } else {
                    // insert full Model                   
                    oErrorModel.setData( {ErrorMessage : 'No Data found!' });
                }
                this.getView().setModel(oErrorModel, 'ErrorModel');
            },

            onAfterRendering() {
               
            }
        });
    });
