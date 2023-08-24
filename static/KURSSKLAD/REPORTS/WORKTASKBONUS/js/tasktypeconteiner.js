/**
 * Created by Shybkoi on 29.05.2017.
 */

function getTaskTypesConteiner() {
    var params = {
      "SELECT":{
        "id" : "2",
        "columns" : {
          "CNTTASK": true,
          "WEIGHT": false,
          "CAPACITY": false,
          "CNTUNITS": true,
          "CNTUNITSW": true,
          "COSTUNITS": true
        }
      },
      "WORKPALLET":{
        "id" : "4",
        "columns" :{
            "CNTTASK" : true,
            "WEIGHT" : false,
            "CAPACITY" : false,
            "CNTUNITS" : false,
            "CNTUNITSW" : false,
            "COSTUNITS" : true
        }
      },
      "PALTOSTORE":{
        "id" : "22",
        "columns" :{
            "CNTTASK" : true,
            "WEIGHT" : false,
            "CAPACITY" : false,
            "CNTUNITS" : false,
            "CNTUNITSW" : false,
            "COSTUNITS" : true
        }
      },
      "REFILLSLOT":{
        "id" : "5",
        "columns" :{
            "CNTTASK" : true,
            "WEIGHT" : false,
            "CAPACITY" : false,
            "CNTUNITS" : true,
            "CNTUNITSW" : true,
            "COSTUNITS" : true
        }
      },
      "LOADPALLET":{
        "id" : "13",
        "columns" :{
            "CNTTASK" : true,
            "WEIGHT" : false,
            "CAPACITY" : false,
            "CNTUNITS" : false,
            "CNTUNITSW" : false,
            "COSTUNITS" : true
        }
      },
      "INCOME":{
        "id" : "1",
        "columns" :{
            "CNTTASK" : true,
            "WEIGHT" : false,
            "CAPACITY" : false,
            "CNTUNITS" : true,
            "CNTUNITSW" : true,
            "COSTUNITS" : true
        }
      },
    };
    return params;
}
