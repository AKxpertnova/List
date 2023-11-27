sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/core/routing/History',
    'sap/suite/ui/microchart/InteractiveDonutChart',
    'sap/suite/ui/microchart/InteractiveDonutChartSegment',
    'sap/suite/ui/microchart/ColumnMicroChartData',
    'sap/ui/model/json/JSONModel',
  ], function (Controller, History, InteractiveDonutChart, InteractiveDonutChartSegment, ColumnMicroChartData, JSONModel) {
    "use strict";
  
    // Toggle Buttons used for switching between two different chart types
    var toggleBtn1;
    var toggleBtn2;
  
    return Controller.extend("listenanzeige.controller.Analytics", {
  
      onInit: function () {
        
        const strURI = '/sap/opu/odata/XPN/ES_SB_AK';
		const strPath = '/xXPNxES_DD_AK';
        let oNewModel = new sap.ui.model.odata.ODataModel(strURI, true);
  
        oNewModel.read(strPath, {
          success: function (oData) {  
            var oGroupedData = {};
  
            // Iterate over all entries.             
            // Check if project already exists, 
            // if so add nHours to the project otherwise initialize it with zero
            oData.results.forEach(function (oEntry) {
            
              var sProject = oEntry.Project;
              var startTime = splitTimebyColon(oEntry.Starttime);
              var endTime = splitTimebyColon(oEntry.Endtime);
              var nHours = ((endTime.hours * 60 + endTime.minutes) - (startTime.hours * 60 + startTime.minutes)) / 60;
              
              if (!oGroupedData[sProject]) {
                oGroupedData[sProject] = 0;
              }
  
              oGroupedData[sProject] += nHours;
            });
  
            var aChartData = [];
            for (var sProject in oGroupedData) {
              aChartData.push({
                Category: sProject,
                Value: oGroupedData[sProject]
              });
            }
  
            var donutChartData = {"DonutChartData": aChartData };
            this.getView().setModel(new JSONModel(donutChartData));
  
          }.bind(this),
  
          error: function (oError) {
            console.log("Fehler beim lesen der oData", oError);
          }
        });
  
      // Splits a time string in two parts: hours and minutes
      // e.g. input: "08:30" results in: {hours: 8, minutes: 30}
      function splitTimebyColon(inputString) {
        const parts = inputString.split(":");
        if (parts.length === 2) {
          const hours = parseInt(parts[0]);
          const minutes = parseInt(parts[1]);
          return { hours, minutes };
        } else {
          return { hours: 0, minutes: 0 };
        }
      }
      },
  
  
  
      handleToggleBtnClicked: function () {
        toggleBtn1.setPressed(!toggleBtn1.getPressed());
        toggleBtn2.setPressed(!toggleBtn2.getPressed());
      },
  
      onNavBack: function () {
        var oHistory = History.getInstance();
        var sPreviousHash = oHistory.getPreviousHash();
  
        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          var oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("Listenanzeige", {}, true);
        }
      },
  
      // Generates dummy values in a given range (default range is 0 to 1)
      generateDummyValues: function ({ min = 0, max = 1 }) {
        if (min > max) {
          throw new Error("min must not be greater than max");
        }
  
        return Math.round(Math.random() * (max - min) + min);
      },
    });
  });