/**
 * Print the paper.
 *
 * Browsers name a "Save as PDF" file after the page title, so the title is
 * swapped for the document's own name while the print dialog is open; the
 * saved file is then "CV - Sita Rai.pdf" rather than "Generate CV | ...".
 */
function printDocument(documentName) {
  const pageTitle = document.title;

  window.addEventListener(
    "afterprint",
    () => {
      document.title = pageTitle;
    },
    { once: true }
  );

  document.title = documentName;
  window.print();
}

/**
 * Show the document as it will print, in the admin area's own modal, with
 * Cancel and Print beneath it.
 *
 * The page is a copy of the paper, sized so the whole sheet fits on screen
 * at once; printing still prints the paper itself, from the page behind.
 */
function printPreviewDialog(documentName) {
  const dialog = generateDialogTemplate("Print Preview", "");
  dialog.classList.add("print_preview");

  const page = document.getElementById("paper").cloneNode(true);
  page.removeAttribute("id");
  dialog.querySelector("#message").appendChild(page);

  const actionsSection = document.createElement("section");
  actionsSection.id = "actions";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Cancel";
  cancelButton.classList.add("positive_button");
  cancelButton.classList.add("transparent_button");
  cancelButton.onclick = function () {
    dialog.close();
  };
  actionsSection.appendChild(cancelButton);

  const printButton = document.createElement("button");
  printButton.type = "button";
  printButton.textContent = "Print";
  printButton.classList.add("negative_button");
  printButton.classList.add("confirm_button");
  printButton.onclick = function () {
    dialog.close();
    printDocument(documentName);
  };
  actionsSection.appendChild(printButton);

  dialog.appendChild(actionsSection);

  // Escape closes a dialog without going through Cancel, so the dialog is
  // removed on closing however that happened.
  dialog.addEventListener("close", () => dialog.remove());

  document.body.appendChild(dialog);
  dialog.showModal();

  // Everything in the dialog but the page keeps its size, so the page gets
  // whatever height is left on screen, with a small margin around the dialog.
  const message = dialog.querySelector("#message");
  const pageHeight = page.getBoundingClientRect().height;
  const surrounds =
    dialog.getBoundingClientRect().height - message.clientHeight + 32;
  const roomForPage = window.innerHeight - surrounds - 48;
  page.style.zoom = Math.max(0.4, Math.min(1, roomForPage / pageHeight));
  printButton.focus();
}

function backToClients() {
  window.location.href = window.location.origin + "/admin/listClients/";
}
