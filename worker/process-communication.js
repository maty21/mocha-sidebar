const TYPES = 
{
    "result":'result',
    "error":"error",
    "exit":"exit"
} 





const _emit = process=> (type,message,cb = null) =>{

    process.send({type,message},cb)
} 
const _on = process=> (RequestedType,cb) =>{
    if(RequestedType==='exit'){
        process.on('exit',message=>{
           cb(message)
        })  
    }
    process.on('message',({type,message})=>{
        RequestedType===type&&cb(message)
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