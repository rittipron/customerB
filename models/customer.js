var db = require('../db/query');

const customerModel = {
    list: async (req,res) => {
        try{
            const sql = `select * from employee order by id desc`;
            const data = await db.queryList(sql);
            return data
        } catch (e) {
            return e
        }
    }
}

module.exports = customerModel