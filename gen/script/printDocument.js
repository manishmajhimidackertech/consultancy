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

function backToClients() {
  window.location.href = window.location.origin + "/admin/listClients/";
}
