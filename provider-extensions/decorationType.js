const { window, OverviewRulerLane } = require('vscode');
const path = require('path');



module.exports.fail = () => {
    return window.createTextEditorDecorationType({
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

// module.exports.notRun = () => {
//     return window.createTextEditorDecorationType({
//         isWholeLine: !0,
//         overviewRulerColor: 'yellow',
//         overviewRulerLane: OverviewRulerLane.Left,
//         light: {
//             before: {
//                 color: '#fed37f',
//                 contentText: '○',
//             },
//         },
//         dark: {
//             before: {
//                 color: '#fed37f',
//                 contentText: '○',
//             },
//         },
//     })
// }

module.exports.notRun = () => {

    //let img = vscode.workspace.rootPath +"images" +cover
    return window.createTextEditorDecorationType({
        isWholeLine: !0,
        gutterIconPath:  path.join(__filename, '..','..', 'images', 'dark', 'covered.svg'),
         
        // overviewRulerColor: 'yellow',
        // overviewRulerLane: OverviewRulerLane.Left,
        light: {
            before: {
                color: '#fed37f',
                contentText: '○',
            },
        },
        dark: {
            after : {
                color: '#fed37f',
              //  contentText: '○',
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