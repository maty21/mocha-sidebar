const { window, OverviewRulerLane } = require("vscode");
const path = require("path");
const { HIT_TYPE, HIT_TYPE_BREAKPOINT } = require("./hit-ratio");

const typeToImage = {
  [HIT_TYPE.GREEN]: "green-hit.svg",
  [HIT_TYPE.YELLOW]: "yellow-hit.svg",
  [HIT_TYPE.RED]: "red-hit.svg",
  [HIT_TYPE_BREAKPOINT.GREEN]: "green-hit-breakpoint.svg",
  [HIT_TYPE_BREAKPOINT.YELLOW]: "yellow-hit-breakpoint.svg",
  [HIT_TYPE_BREAKPOINT.RED]: "red-hit-breakpoint.svg"
};

module.exports.getStyle = type => {
  return window.createTextEditorDecorationType({
    isWholeLine: !0,
    gutterIconPath: path.join(__filename, "..", "..", "..", "images", "dark", "coverage", typeToImage[type]),

    // overviewRulerColor: 'yellow',
    // overviewRulerLane: OverviewRulerLane.Left,
    light: {
      after: {
        color: "#fed37f"
      }
    },
    dark: {
      after: {
        color: "#fed37f"
        //  contentText: '○',
      }
    }
  });
};
