const getRatio = (hitNumber)=>{
    if(hitNumber>=RATIO.GREEN) {
        return HIT_TYPE.GREEN 
    }
    else if (hitNumber>=RATIO.YELLOW) {
        return HIT_TYPE.YELLOW
    }
    return HIT_TYPE.RED

}


const RATIO = {
    GREEN:3,
    YELLOW:1,
    RED:0
}

const HIT_TYPE = {
    GREEN:'GREEN',
    YELLOW:'YELLOW',
    RED:'RED'
}


module.exports = {
    getRatio,
    RATIO,
    HIT_TYPE
}