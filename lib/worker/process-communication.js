const verbose = require('../provider-extensions/constLog');

const TYPES = 
{
    "result":'result',
    "error":"error",
    "exit":"exit"
} 





const _emit = process=> (type,message,cb = null) =>{
    let msg = {type,message};
    let data = null;
  //  console.log(`${verbose} process-communication ${message}`);
    if(type==TYPES.error){
        data =  JSON.stringify(msg, Object.getOwnPropertyNames(msg));
    }
    else{
        data = JSON.stringify(msg) 
    }
    process.send (data,cb)
} 
const _on = process=> (RequestedType,cb) =>{
   
    if(RequestedType==='exit'){
        process.on('exit',message=>{
           cb( JSON.parse(message))
        })  
    }
//     process.on('message',(msg)=>{
//    //  console.log(msg);
// })
process.on('message',(data)=>{
    console.log(`message received with tests`);
        let msg =JSON.parse(data);
        RequestedType===msg.type&&cb(msg.message)
    })
}

const message = (process)=> ({ 
    emit:_emit(process),
    on:_on(process)
});

module.exports = {
   message,
    TYPES
};