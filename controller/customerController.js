var customerModel = require('../models/customer');

exports.list = async (req, res)=>{
    try{
        var data = {}
        var result = await customerModel.list(data)
        res.send({
            status: 200,
            message: 'Success'
        });
    }catch(e){
        console.log(e)
        res.send({
            status: 404,
            message: e
        });
    }
};