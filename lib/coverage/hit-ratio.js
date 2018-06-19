const getRatio = (hitNumber)=>{
    if(hitNumber>=RATIO.GREEN) {
        return HIT_TYPE.GREEN 
    }
    else if (hitNumber>=RATIO.YELLOW) {
        return HIT_TYPE.YELLOW
    }
    return HIT_TYPE.RED

}

const getStatusBarRatioColor = (percent) =>{
    if(percent>=RATIO_PERCENT.HIGH){
        return  COLOR_PERCENT_STATUSBAR.GREEN;
    }
    else if (percent>=RATIO_PERCENT.MEDIUM) {
        return COLOR_PERCENT_STATUSBAR.YELLOW;
    }
    return COLOR_PERCENT_STATUSBAR.RED

}

const COLOR_PERCENT_STATUSBAR = {
    GREEN:'#00FF00',
    YELLOW:'yellow',
    RED:'red'
}

const RATIO = {
    GREEN:3,
    YELLOW:1,
    RED:0
}

const RATIO_PERCENT = {
    HIGH:80,
    MEDIUM:50,
    LOW:0
}
const HIT_TYPE = {
    GREEN:'GREEN',
    YELLOW:'YELLOW',
    RED:'RED'
}
const HIT_TYPE_BREAKPOINT = {
    GREEN:'GREEN_BREAKPOINT',
    YELLOW:'YELLOW_BREAKPOINT',
    RED:'RED_BREAKPOINT'
}

module.exports = {
    getRatio,
    getStatusBarRatioColor,
    RATIO,
    HIT_TYPE,
    HIT_TYPE_BREAKPOINT
}