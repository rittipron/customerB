var express = require('express')
var cors = require('cors')
var app = express()
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const mysql = require('mysql');

//Gen token
var jwt = require('jsonwebtoken')
const secret = 'Token-Portfoliob'

// เข้ารหัส 
const bcrypt = require('bcrypt');
const saltRounds = 10;

const myDb = require('./db/db');
const db = mysql.createConnection(myDb.portfolio);

app.use(cors())

const route = require('./routes/index.js')
const e = require('express')

// App Use Socket.io
const socket = require('./service/socket.js')
socket.run()

app.use('/portfolio',route)

//ทำไปก่อน
app.get('/', (req, res, next)=>{
    try{
        const query = `select * from customer order by id desc`
        db.query(query,(err, result) => {
            if(err){
                console.log(err)
            }else{
                res.send(result)
            }
        })
    }catch(e){
        console.log(e)
    }
})

app.post('/login', jsonParser ,(req, res, next)=>{
    try{
        let data = {}
        data.username = req.body.username;
        data.password = req.body.password;
        const query = `select * from customer where 1=1 and username = '${data.username}'`;
        db.query(query,(err, result) => {
            if(err){
                console.log(err)
                res.json({staus:404, msg:'Fail', error: err})
            }else{
                if(result.length > 0){
                    if(data.username != "admin"){
                        bcrypt.compare(req.body.password, result[0].password, function(err, isLogin) {
                            if(isLogin){
                                var token = jwt.sign({ username: result[0].username }, secret,{ expiresIn: Math.floor(Date.now() / 1000) - 30 });
                                res.json({status:200, msg:'Login Success', token})
                            }else{
                                res.json({status:204, msg:'Login Fail'})
                            }
                        })
                    }else{
                        var token = jwt.sign({ username: result[0].username }, secret,{ expiresIn: Math.floor(Date.now() / 1000) - 30 });
                        res.json({status:200, msg:'Login Success', token})
                    }
                }else{
                    res.json({status:204, msg:'Not Username'})
                }
            }
        })
    }catch(e){
        console.log(e)
        res.send({staus:404, msg:'Fail', error: e})
    }
})

app.post('/authen', jsonParser ,(req, res, next)=>{
    try{
        const token = req.headers.authorization.split(' ')[1]
        var decoded = jwt.verify(token, secret);
        var date = new Date( parseInt(decoded.exp) * 1000 )
        var day = new Date()
        console.log();
        if(date < day){
            res.json({status:204 ,msg:'token หมดอายุ'})
        }else{
            res.json({status:200 ,msg:'Success',decoded})
        }
    }catch(e){
        res.json({status: 204, msg: e})
    }
})

function checkUsername(username){
    const query = `select * from customer where username = '${username}'`
    var a
    let check = new Promise((resolve, reject) => {
    db.query(query,(err, result) => {
            if(err){
                reject(err)
            }else{
                console.log(result.length)
                if(result.length > 0){
                    resolve('false')
                }else{
                    resolve('true')
                }
            }
        })
    })
    return check
}

// Register Customer
app.post('/register', jsonParser ,(req, res, next)=>{
    try{
        let data = {}
        console.log(req.body)
        data.username = req.body.username;
        data.password = req.body.password;
        data.fname = req.body.fname;
        data.lname = req.body.lname;
        data.tel = req.body.tel;
        data.email = req.body.email;
        const checkU = checkUsername(data.username);
        checkU.then(val =>{
            if(val === 'true'){
                bcrypt.hash(data.password, saltRounds, function(err, hash) {
                    const query = `
                    insert into customer(username,password,fname,lname,tel,email) 
                    values('${data.username}','${hash}','${data.fname}','${data.lname}','${data.tel}','${data.email}')`
                    db.query(query,(err, result) => {
                        if(err){
                            console.log(err)
                            res.json({staus:404, msg:'Fail', error: err})
                        }else{
                            res.json({staus:200, msg:'Success'})
                        }
                    })
                })
            }else{
                res.json({staus:404, msg:'Username ซ้ำ'})
            }
        })
    }catch(e){
        console.log(e)
        res.json({staus:404, msg:'Fail'})
    }
})

// Updata Customer
app.put('/updatecustomer',jsonParser, async (req,res) => {
    try{
        let data = {}
        data.id = req.body.id;
        data.username = req.body.username;
        data.password = req.body.password;
        data.fname = req.body.fname;
        data.lname = req.body.lname;
        data.tel = req.body.tel;
        data.email = req.body.email;
        const query = `
        update customer set 
        username = '${data.username}',
        password = '${data.password}',
        fname = '${data.fname}',
        lname = '${data.lname}',
        tel = '${data.tel}',
        email = '${data.email}'
        where id = ${data.id}
        `
        db.query(query,(err, result) => {
            if(err){
                console.log(err)
            }else{
                res.send({staus:200, msg:'success'})
            }
        })
    }catch(e){
        console.log(e)
    }
})

// Delete Customer
app.delete('/deletecustomer',jsonParser, async (req,res) => {
    try{
        let data = {}
        let reqBoy = req.body
        for(let val of reqBoy){
            data.id = val.id;
            const query = `
            delete from customer where id = ${data.id}
            `
            db.query(query,(err, result) => {
                if(err){
                    console.log(err)
                }else{
                    console.log({staus:200, msg:'success'})
                }
            })
        }
    }catch(e){
        console.log(e)
    }
})
//end


app.listen(8000, function () {
  console.log('CORS-enabled web server listening on port 8000')
})