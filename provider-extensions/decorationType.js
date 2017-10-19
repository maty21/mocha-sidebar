const { window, OverviewRulerLane } = require('vscode');



module.exports.fail = () => {
    window.createTextEditorDecorationType({
        overviewRulerColor: 'red',
        overviewRulerLane: OverviewRulerLane.Left,
        light: {
            before: {
                color: '#FF564B',
                contentText: '●',
            },
        },
        dark: {
            before: {
                color: '#AD322D',
                contentText: '●',
            },
        },
    })
}

module.exports.notRun = () => {
    return window.createTextEditorDecorationType({
        overviewRulerColor: 'yellow',
        overviewRulerLane: OverviewRulerLane.Left,
        light: {
            before: {
                color: '#fed37f',
                contentText: '○',
            },
        },
        dark: {
            before: {
                color: '#fed37f',
                contentText: '○',
            },
        },
    })
}

module.exports.pass = () => {
    return window.createTextEditorDecorationType({
        overviewRulerColor: 'green',
        overviewRulerLane: OverviewRulerLane.Left,
        light: {
            before: {
                color: '#3BB26B',
                contentText: '●',
            },
        },
        dark: {
            before: {
                color: '#2F8F51',
                contentText: '●',
            },
        },
    })
}