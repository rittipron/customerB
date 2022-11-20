const mysql = require('mysql');
const myDb = require('../db/db');
const db = mysql.createConnection(myDb.employeeStstem);

var query = {
    queryList: async (sql) => {
        const query = await db.query(sql, async (err, result) => {
            let res 
            if(err){
                res = err
            }else{
                let data = {}
                data.data = result
                res = await JSON.stringify(data)
            }
            return res.data
        })
        console.log(query)
        return query
    }
}
module.exports = query