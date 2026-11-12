/*
 * Helpers shared by the CV and MOU pages for drawing onto the paper.
 *
 * Everything that comes from a client record or the editor is set with
 * textContent, never innerHTML: these pages print whatever was typed into the
 * register, and a name containing markup must come out as text.
 */

function paperElement(tag, text = "", className = "") {
  const element = document.createElement(tag);

  if (text !== "") {
    element.textContent = text;
  }
  if (className !== "") {
    element.className = className;
  }

  return element;
}

/**
 * The value as text, or a dotted line to be filled in by hand.
 *
 * Leaving a field empty is how a detail the register does not hold, such as a
 * date of birth, gets written on the printed copy instead.
 */
function valueOrBlank(value) {
  const text = typeof value === "string" ? value.trim() : "";

  if (text === "") {
    return paperElement("span", "", "blank");
  }

  return document.createTextNode(text);
}

/** A paragraph built from a mix of strings and nodes. */
function paperParagraph(parts, className = "") {
  const p = paperElement("p", "", className);

  parts.forEach((part) => {
    p.appendChild(typeof part === "string" ? document.createTextNode(part) : part);
  });

  return p;
}

/** "2026-11-12" as "12 November 2026", or "" if there is no date. */
function formatDate(isoDate) {
  if (!isoDate) {
    return "";
  }

  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Today as the value a date input expects. */
function todayForInput() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * A mobile number with the country code in front, as List Clients shows it.
 *
 * Numbers are stored as digits only, and one typed with its "+977" keeps
 * those digits, so the prefix is added only when it is not already there.
 */
function formatMobile(mobileNumber) {
  const digits = mobileNumber.replace(/\D+/g, "");

  if (digits === "") {
    return mobileNumber.trim();
  }
  if (digits.startsWith("977") && digits.length > 10) {
    return `+977 ${digits.slice(3)}`;
  }

  return `+977 ${digits}`;
}

/** ["a", "b", "c"] as "a, b or c". */
function joinWithOr(items) {
  if (items.length <= 1) {
    return items.join("");
  }

  return `${items.slice(0, -1).join(", ")} or ${items[items.length - 1]}`;
}

/** Split a comma-separated field into its non-empty parts. */
function splitList(text) {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "");
}

/**
 * Turn a stored upload path into a URL usable from this page.
 *
 * The same rule as admin/listClients/viewClient.js, which sits at the same
 * depth: only paths recorded relative to the application root are usable, and
 * anything else falls back to the placeholder.
 */
function uploadUrl(storedPath, placeholder) {
  if (typeof storedPath !== "string" || !storedPath.startsWith("uploads/")) {
    return placeholder;
  }

  return `../../${storedPath}`;
}

/** Replace the paper's contents with a single line of explanation. */
function showPaperMessage(message) {
  const paper = document.getElementById("paper");
  paper.replaceChildren(paperElement("p", message, "paper_message"));
  fitPaper();
}

/**
 * Shrink the paper to fit beside the editor.
 *
 * The page is drawn at its real size so the on-screen copy and the printed
 * copy break lines in the same places; on a narrower screen it is scaled down
 * as a whole rather than reflowed. Printing resets the scale in gen.css.
 */
function fitPaper() {
  const preview = document.getElementById("preview");
  const paper = document.getElementById("paper");

  paper.style.zoom = 1;
  const scale = Math.min(1, preview.clientWidth / paper.offsetWidth);
  paper.style.zoom = scale;
}

/** Disable every control in the editor, for when there is no client to edit. */
function disableEditor() {
  document
    .querySelectorAll("#editor input, #editor select, #editor textarea, #editor button")
    .forEach((control) => {
      control.disabled = true;
    });
}
