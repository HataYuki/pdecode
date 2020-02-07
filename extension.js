const vscode = require("vscode");
function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "extension.decoder",
    function() {
      const textEditor = vscode.window.activeTextEditor;
      if (!textEditor) return;

      const doc = textEditor.document;

      const lines = [...Array(doc.lineCount).keys()].map(lineNum => {
        const thisLine = doc.lineAt(lineNum);
        const startPos = new vscode.Position(lineNum, 0);
        const endPos = new vscode.Position(lineNum, thisLine._text.length);
        const lineRange = new vscode.Range(startPos, endPos);
        return {
          range: lineRange,
          text: doc.getText(lineRange)
        };
      });

      const hasTargetUrlLines = lines.filter(line => {
        return /https?:\/\/[\w/:%#\$&\?\(\)~\.=\+\-]+/g.test(line.text);
      });

      // http://scout.dreamhosters.com/tools/ProofPointDecode.html
      const de_hex = hexed => {
        var result = hexed;
        var hex_re = /(.*)(-)([0-9A-F][0-9A-F])(.*)/;
        var hexmatches = hex_re.exec(hexed);
        while (hexmatches && hexmatches.index !== null) {
          var character = String.fromCharCode(parseInt(hexmatches[3], 16));
          result = hexmatches[1] + character + hexmatches[4];
          hexmatches = hex_re.exec(result);
        }
        return result;
      };
      const decode_url = code => {
        var find_re = /.+?u=(.+?)(&.*)?$/;
        var matches = find_re.exec(code);
        if (matches) {
          var defended = matches[1];
          var with_slashes = defended.replace(/_/g, "/");
          var defenseless = de_hex(with_slashes);
          return defenseless;
        } else {
          return co;
        }
      };

      const decoded = hasTargetUrlLines.map(line => {
        const urlCode = line.text.match(
          /https?:\/\/[\w/:%#\$&\?\(\)~\.=\+\-]+/g
        )[0];
        const decoded = decode_url(urlCode);

        return {
          range: line.range,
          text: line.text.replace(urlCode, decoded)
        };
      });

      textEditor.edit(editBuilder => {
        decoded.forEach(line => {
          editBuilder.replace(line.range, line.text);
        });
      });
    }
  );

  context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
