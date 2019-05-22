const { window, OverviewRulerLane } = require('vscode');
const path = require('path');



const fail = () => {
    return window.createTextEditorDecorationType({
        isWholeLine: !0,
        gutterIconPath: path.join(__filename, '..', '..', '..', 'images', 'dark', 'document', 'fail.svg'),
        light: {
            after: {
                color: '#fed37f',
            },
        },
        dark: {
            after: {
                color: '#fed37f',
            },
        },
    })
}


const notRun = () => {

    return window.createTextEditorDecorationType({
        isWholeLine: !0,
        gutterIconPath: path.join(__filename, '..', '..', '..', 'images', 'dark', 'document', 'notRun.svg'),
        light: {
            after: {
                color: '#fed37f',
            },
        },
        dark: {
            after: {
                color: '#fed37f',
            },
        },
    })
}


const pass = () => {
    return window.createTextEditorDecorationType({
        isWholeLine: !0,
        gutterIconPath: path.join(__filename, '..', '..', '..', 'images', 'dark', 'document', 'pass.svg'),

        // overviewRulerColor: 'yellow',
        // overviewRulerLane: OverviewRulerLane.Left,
        light: {
            after: {
                color: '#fed37f',
            },
        },
        dark: {
            after: {
                color: '#fed37f',
                //  contentText: '○',
            },
        },
    })
}
const running = () => {
    return window.createTextEditorDecorationType({
        isWholeLine: !0,
        gutterIconPath: path.join(__filename, '..', '..', '..', 'images', 'dark', 'refresh.svg'),
        light: {
            after: {
                color: '#fed37f',
            },
        },
        dark: {
            after: {
                color: '#fed37f',
            },
        },
    })
}
const expectErrorMessage = (text) => window.createTextEditorDecorationType({
    isWholeLine: true,
    overviewRulerColor: 'red',
    overviewRulerLane: OverviewRulerLane.Left,

    light: {
        after: {
            color: '#FF564B',
        },
    },
    dark: {
        after: {
            color: '#FF564B',
        },
    },
    after: {
        contentText: ' // ' + text,
    },

})

module.exports = {pass,fail,notRun,running,expectErrorMessage}