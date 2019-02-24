var async = require('async');
var Excel = require('exceljs');
var mySql = require('../migration/connection');
var CommonUtils = require('../migration/common-utils');

var poolConnection = mySql.getMySQLConnection();

module.exports = function(router) {

	router.get('/', function(req, res, next) {
		var tableName = 'product_category_test';
		var sheetName = 'rts_categories';
		async.waterfall([
		    function(callback) {
		    	var describeQuery = 'DESCRIBE ' + tableName;
		        poolConnection.query(describeQuery, function (error, results, fields) {
				  	if (error) {
				  		return error;
				  	} 
				  	else {
				  		var columnNames = [], fieldNames = [];
					  	for (var i = 0; i < results.length; i++) {
					  		columnNames.push(results[i]);
					  		fieldNames.push(results[i]['Field']);
					  	}
					  	callback(null, columnNames, fieldNames);
				  	}
				});
		    },
		    function(columnInfo, fieldNames, callback) {
		    	var workbook = new Excel.Workbook(); 
		    	var filename = './xlsFiles/hob-rts.xlsx';
		    	var xlsFields;
				workbook.xlsx.readFile(filename)
				    .then(function(sheetInfo) {
				        var worksheet = workbook.getWorksheet(sheetName);
				        var xlsObj = {}, xlsData = [];
				        worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
				        	if(rowNumber == 1) {
				        		xlsFields = row.values;
				        	}
				        	else {
				        		for (var i = 0; i < row.values.length; i++) {
				        			xlsObj[xlsFields[i]] = row.values[i];
				        		}
				        		xlsData.push(xlsObj);
				        		xlsObj = {};
				        	}
				        });
				    	callback(null, xlsData, columnInfo, fieldNames);
				    });
		    },
		    function(xlsData, columnInfo, fieldNames, callback) {
		    	var tempObj = {}, insertData = [], availableCol = [];
		    	for (var j = 0; j < xlsData.length; j++) {
		    		for (var i = 0; i < columnInfo.length; i++) {
		    			for (v in xlsData[j]) {
		    				if(v == columnInfo[i]['Field']) {
		    					tempObj[v] = xlsData[j][v];
		    				}
		    			}
		    			if(!tempObj.hasOwnProperty(columnInfo[i]['Field'])) {
		    				tempObj[columnInfo[i]['Field']] = getValueBasedOnColumn(columnInfo[i]['Type']);
		    			}
		    		}
		    		insertData.push(tempObj);
		    		tempObj = {};
		    	}
		    	callback(null, insertData, fieldNames);
		    }, 
		    function(insertData, fieldNames, callback) {
		    	var dataValues = [];
		    	for (var i = 0; i < insertData.length; i++) {
		    		var arr = [];
		    		for (p in insertData[i]) {
		    			arr.push(insertData[i][p]);
		    		}
		    		dataValues.push(arr);
		    		arr = [];
		    	}
		    	var fields = "(" + fieldNames.toString() + ")";
		    	var truncateQuery = 'TRUNCATE TABLE ' + tableName;
		    	poolConnection.query(truncateQuery, function (error, results) {
				  	if (error) {
				  		return error;
				  	} 
				  	else {
				  		var query = "INSERT INTO " + tableName + " " + fields + " VALUES ?";
				  		poolConnection.query(query, [dataValues], function(err, result) {
  							if(err) {
     							callback(err);
  							}
 							else {
     							callback(null, result);
  							}
						});
				  	}
				});
		    }
		], function (err, result) {
		    if(err) {
		    	res.json({success: false, error: err});
		    }
		    else {
		    	res.json({success: true, result: result});
		    }
		});
	  	
	});

};

function getValueBasedOnColumn(type) {
	if(type.includes('int')) {
		return CommonUtils.getInt();
	}
	else if(type.includes('varchar')) {
		return CommonUtils.getString();		
	}
	else if(type.includes('text')) {
		return CommonUtils.getDescription();
	}
	else if(type.includes('date')) {
		return CommonUtils.getDate();
	}
}

