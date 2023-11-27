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
        const strURI = '/sap/opu/odata/XPN/ES_SB_AK';
		const strPath = '/xXPNxES_DD_AK';

        return Controller.extend("listenanzeige.controller.Listenanzeige", {

            onInit: function () {

                // Declare variables                
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
                        oErrorModel.setData( {ErrorMessage : 'reading Data completed.  '  + oData.results.length + ' entries found!'});

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
                let strYear ;

				data.forEach(function (element) {
                    strDate = element.Startdate.toString();//.getDate()
                    strYear = strDate.substr(0, 4);
                    strMonth = strDate.substr(4, 2);
                    strDay = strDate.substr(6,2);
                    strDate = strDay + '.' + strMonth + '.' + strYear;
                   
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
                this.oDialog = sap.ui.xmlfragment("listenanzeige.view.ManipulateoData", this);
            },
           
            onListItemPress(oEvent) {  
                this.setManipulateDataFragment(oEvent);              
				this.oDialog.open();					
            },
            
            setManipulateDataFragment(oEvent){
                let strCustomer = oEvent.oSource.mProperties.number ;
                let strProduct = oEvent.oSource.mAggregations.firstStatus.mProperties.text;
                let strBatchID = oEvent.oSource.mAggregations.attributes[0].mProperties.text;
                let strStartDate = oEvent.oSource.mAggregations.attributes[1].mProperties.text;
                let strPlant = oEvent.oSource.mProperties.title ;                
                let strAmount = oEvent.oSource.mProperties.number ;
                let strUnit = oEvent.oSource.mProperties.numberUnit;
                let intCounter = 0;
                let oModel = this.getView().getModel('ProductCollectionModel').getData();
                let oData;
                let strArrAmount = [];
                let intX = 0;
                let strTempString;
                let boFound = false;

                for (intCounter = 0; intCounter < oModel.ProductCollection.length; intCounter++) {
                    if (oModel.ProductCollection[intCounter].BatchID === strBatchID) {
                        oData = oModel.ProductCollection[intCounter];
                        strCustomer = oData.Customer ;
                        strProduct = oData.Product;                        
                        strStartDate = oData.Startdate;
                        strPlant = oData.Plant ;                
                        strAmount = oData.Amount ;
                        strUnit = oData.Unit;
                        // Delete '0' after '.'
                        if (strAmount.indexOf('.') > 0) {
                            strArrAmount = strAmount.split('.');
                            strTempString = strArrAmount[1];
                            for (intX = strTempString.length - 1; intX > 0; intX--) {                               
                                if (strTempString.substr(intX,1) !== '0') {
                                    strAmount = strArrAmount[0] + '.' + strTempString.slice(0,intX + 1);
                                    intX = 0;
                                    boFound = true;
                                }
                            }
                            if (boFound === false) {
                                strAmount = strArrAmount[0];
                            }  
                        }
                        // Confirm Date
                        strArrAmount = strStartDate.split('.');
                        strStartDate = strArrAmount[2] + '-' + strArrAmount[1] + '-' + strArrAmount[0]
                        intCounter = oModel.ProductCollection.length;
                    }                     
                }
                
                this.oDialog.mAggregations.content[0].mAggregations.items[0].mAggregations.content[0].mProperties.value = strCustomer
                this.oDialog.mAggregations.content[0].mAggregations.items[1].mAggregations.content[0].mProperties.value = strPlant
                this.oDialog.mAggregations.content[0].mAggregations.items[2].mAggregations.content[0].mProperties.value = strProduct
                this.oDialog.mAggregations.content[0].mAggregations.items[3].mAggregations.content[0].mProperties.value = strBatchID
                this.oDialog.mAggregations.content[0].mAggregations.items[4].mAggregations.content[0].mProperties.value = strStartDate
                this.oDialog.mAggregations.content[0].mAggregations.items[5].mAggregations.content[0].mProperties.value = strAmount                
                this.oDialog.mAggregations.content[0].mAggregations.items[7].mAggregations.content[0].mProperties.selectedKey = strUnit; 

                // Handling Slider                
                let intSliderMax = 0;
                let intSliderStep = 1;

                // SliderSteps
                switch(strUnit) {
                    case 'mg':
                        intSliderStep = 0.1;
                        break;
                    case 'ml':
                        intSliderStep = 0.1;
                        break;
                    case 'L':
                        intSliderStep = 10;
                        break;
                    case '%':
                        intSliderStep = 1;
                        break;
                    case 'g':
                        intSliderStep = 1;
                        break;
                    case 'kg':
                        intSliderStep = 10;
                        break;
                    default:
                        intSliderStep = 1;
                    }                
                // Slider Max
                if (parseFloat(strAmount) < 100) {
                    intSliderMax = 250;
                } else if (parseFloat(strAmount) < 1000) {
                    intSliderMax = 2500;
                } else {
                    intSliderMax = 25000;
                }
                this.oDialog.mAggregations.content[0].mAggregations.items[6].mAggregations.content[0].mProperties.step = intSliderStep
                this.oDialog.mAggregations.content[0].mAggregations.items[6].mAggregations.content[0].mProperties.max = intSliderMax
                this.oDialog.mAggregations.content[0].mAggregations.items[6].mAggregations.content[0].mProperties.value =parseFloat(strAmount);      
                     
                //wip
                /*
                oDialogData.push({
                    "BatchID":strBatchID,
                    "Customer": strCustomer,
                    "Plant": strPlant,
                    "Product": strProduct,
                    "Startdate": strStartDate,
                    "Amount": strAmount,
                    "Unit": strUnit
             } )  				
              
                //oResults = ( { 'ProductCollection': oData })           
                let oDialogModel = new JSONModel();  
                oDialogModel.setData({ BatchID:strBatchID});
                
                this.getView().setModel(oDialogModel,'oDialogModel'); 
             */
            },

            getoData() {
                // Read all Values
                let oErrorModel = new JSONModel();
                let strCustomer = this.oDialog.mAggregations.content[0].mAggregations.items[0].mAggregations.content[0].mProperties.value;
                let strPlant = this.oDialog.mAggregations.content[0].mAggregations.items[1].mAggregations.content[0].mProperties.value;
                let strProduct = this.oDialog.mAggregations.content[0].mAggregations.items[2].mAggregations.content[0].mProperties.value;
                let strBatchID = this.oDialog.mAggregations.content[0].mAggregations.items[3].mAggregations.content[0].mProperties.value;
                let strStartDate = this.oDialog.mAggregations.content[0].mAggregations.items[4].mAggregations.content[0].mProperties.value;
                let strAmount = parseFloat(this.oDialog.mAggregations.content[0].mAggregations.items[5].mAggregations.content[0].mProperties.value).toFixed(6);
                let strUnit = this.oDialog.mAggregations.content[0].mAggregations.items[7].mAggregations.content[0].mProperties.selectedKey;
                let boError = false;
                let oData;

                // Check, if all values are set
                if (strBatchID !== undefined & strCustomer !== undefined & strPlant !== undefined & strProduct !== undefined & strStartDate !== undefined & strAmount !== undefined & strUnit !== undefined) {
                    if (strBatchID !== '' & strCustomer !== '' & strPlant !== '' & strProduct !== '' & strStartDate !== '' & strAmount !== '' & strUnit !== '') {
                        let strDate = this.convertToDate(strStartDate);
                        oData = {
                            "Batchid": strBatchID,
                            "Customer": strCustomer,
                            "Plant": strPlant,                            
                            "Startdate": strDate,
                            "Product": strProduct,
                            "Amount": strAmount,
                            "Unit": strUnit
                        }  
                    } else {
                        boError = true;
                        oErrorModel.setData( {ErrorMessage : 'Please fill in all values!' });
                        this.getView().setModel(oErrorModel, 'ErrorModel');
                    }
                } else {
                    boError = true;
                    oErrorModel.setData( {ErrorMessage : 'Please fill in all values!' });
                    this.getView().setModel(oErrorModel, 'ErrorModel');
                }
                return [oData,strBatchID,boError];
                

            },

            onChangeDialog() {
                let results = this.getoData();
                if (results[2] !== true) { 
                    this.updateValues(results[0],results[1]);                 
                }                
                this.oDialog.close();
            },

            convertToDate(strDate) {
                strDate = strDate.replaceAll('-','');
                let strYear = strDate.substr(0, 4);
                let strMonth = strDate.substr(4, 2);
                let strDay = strDate.substr(6,2);
                let dtDate = strYear + strMonth + strDay;

                return dtDate
            },

            updateValues(oData,strBatchID) {

                let oErrorModel = new JSONModel();
                let oModel = new JSONModel();
                let oConnection = new sap.ui.model.odata.ODataModel(strURI, true);
                let oNewModel = new sap.ui.model.odata.ODataModel(strURI, true); 
                let boNewBacthID = true;
                let intCounter = 0;                
                let oDataModel = this.getView().getModel('ProductCollectionModel').getData();
                var entityKey = {
                    Batchid: oData.Batchid.toString()
                };
                var sEntityKey = oNewModel.createKey(strPath, entityKey)

                // Check, if BtachID exist
                for (intCounter = 0; intCounter < oDataModel.ProductCollection.length; intCounter++){
                    if (oDataModel.ProductCollection[intCounter].BatchID === strBatchID) {
                        boNewBacthID = false;
                        intCounter = oDataModel.length;
                    }
                }
                
                if (boNewBacthID === false) {
                    oConnection.update(sEntityKey, oData, {
                        success: function () {
                            
                            oConnection.read(strPath, {
                                success: function (oData) {
                                    oModel.setData(this.extractoData(oData.results));						
                                    this.getView().setModel(oModel,'ProductCollectionModel');
                                    oInitProductCollectionModel = oModel;
                                }.bind(this),                            
                            })
                            oErrorModel.setData( {ErrorMessage : 'Data sendet to Backend!' });
    
                        }.bind(this),
                        error: function () {
                            oErrorModel.setData( {ErrorMessage :"Error in sending back to Backend!"});
                        }
                    });
                    
                } else {
                    oConnection.create(strPath, oData, {
                        success: function () {
                            oConnection.read(strPath, {
                                success: function (oData) {
                                    oModel.setData(this.extractoData(oData.results));						
                                    this.getView().setModel(oModel,'ProductCollectionModel');
                                    oInitProductCollectionModel = oModel;
                                    oErrorModel.setData( {ErrorMessage : 'New Datarow sendet to Backend!' });
                                }.bind(this),
                                error: function () {
                                    oErrorModel.setData( {ErrorMessage :"Error in reading new Datarow to Backend!"});
                                }
                            });
                        }.bind(this),
                        error: function () { 
                            oErrorModel.setData( {ErrorMessage :"Error in sending back new Datarow to Backend!"});
                        }
                    });
                } 
                this.getView().setModel(oErrorModel, 'ErrorModel');
            },

            onDeleteDialog() {
                let results = this.getoData();
                if (results[2] !== true) { 
                    let oErrorModel = new JSONModel();
                    let oModel = new JSONModel();
                    let oConnection = new sap.ui.model.odata.ODataModel(strURI, true);
                    let oNewModel = new sap.ui.model.odata.ODataModel(strURI, true); 
                    let oData = results[0];
                    let strBatchID = results[1];   
                    var entityKey = {
                        Batchid: strBatchID 
                    };
                    var sEntityKey = oNewModel.createKey(strPath, entityKey)

                    oConnection.remove(sEntityKey, {
                        success: function () {                            
                            oConnection.read(strPath, {
                                success: function (oData) {
                                    oModel.setData(this.extractoData(oData.results));						
                                    this.getView().setModel(oModel,'ProductCollectionModel');
                                    oInitProductCollectionModel = oModel;
                                }.bind(this), 
                                error: function () {
                                    oErrorModel.setData( {ErrorMessage :"Error in reading new Datarow to Backend!"});
                                }                           
                            })
                            oErrorModel.setData( {ErrorMessage : 'Data removed from Backend!' });
    
                        }.bind(this),
                        error: function () {
                            oErrorModel.setData( {ErrorMessage :"Error in removing Data in Backend!"});
                        }
                    }); 
                    this.getView().setModel(oErrorModel, 'ErrorModel');                               
                }   
                this.oDialog.close();
            },

            onCancelDialog() {
                this.oDialog.close();
            },

            //wip
            sliderHandleChange(oEvent) {
                let sAmount = oEvent.mParameters.value;
                let oModel = this.getView().getModel()
                this.oDialog.mAggregations.content[0].mAggregations.items[5].mAggregations.content[0].setProperty("/value",sAmount);    //mProperties.value            
            },

            onAnalyticsPressed() {
                var oRouter = this.getOwnerComponent().getRouter();
				oRouter.navTo("Analytics")
            }

        });
    });
