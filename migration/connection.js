var mysql = require('mysql'); 

module.exports = {
	getMySQLConnection: function() {
		return mysql.createPool({
			connectionLimit : 10,
			host            : 'localhost',
			user            : 'root',
			password        : '',
			database        : 'house_of_blouse_db'
		});
	}
}