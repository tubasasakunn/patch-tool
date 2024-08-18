(function () {
  const vscode = acquireVsCodeApi();
  const patchInput = document.getElementById("patch-input");
  const applyPatchButton = document.getElementById("apply-patch");

  patchInput.addEventListener("input", () => {
    vscode.postMessage({
      type: "patchContent",
      value: patchInput.value,
    });
  });

  applyPatchButton.addEventListener("click", () => {
    vscode.postMessage({
      type: "applyPatch",
    });
  });
})();
