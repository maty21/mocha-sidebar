const { window, OverviewRulerLane } = require('vscode');
const path = require('path');



// module.exports.fail = () => {
//     return window.createTextEditorDecorationType({
//         overviewRulerColor: 'red',
//         overviewRulerLane: OverviewRulerLane.Left,
//         light: {
//             before: {
//                 color: '#FF564B',
//                 contentText: '●',
//             },
//         },
//         dark: {
//             before: {
//                 color: '#AD322D',
//                 contentText: '●',
//             },
//         },
//     })
// }


module.exports.redHit = () => {
    return window.createTextEditorDecorationType({
       isWholeLine: !0,
        gutterIconPath: path.join(__filename, '..', '..', 'images', 'dark', 'coverage', 'red-hit.svg'),
        letterSpacing:  '100px',
        //verviewRulerLane: OverviewRulerLane.Right,
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

module.exports.yellowHit = () => {

    return window.createTextEditorDecorationType({
        isWholeLine: !0,
        gutterIconPath: path.join(__filename, '..', '..', 'images', 'dark', 'coverage', 'yellow-hit.svg'),
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


// module.exports.pass = () => {
//     return window.createTextEditorDecorationType({
//         overviewRulerColor: 'green',
//         overviewRulerLane: OverviewRulerLane.Left,
//         light: {
//             before: {
//                 color: '#3BB26B',
//                 contentText: '●',
//             },
//         },
//         dark: {
//             before: {
//                 color: '#2F8F51',
//                 contentText: '●',
//             },
//         },
//     })
//}

module.exports.greenHit = () => {
    return window.createTextEditorDecorationType({
        isWholeLine: !0,
        gutterIconPath: path.join(__filename, '..', '..', 'images', 'dark', 'coverage', 'green-hit.svg'),

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


module.exports.expectErrorMessage = (text) => window.createTextEditorDecorationType({
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