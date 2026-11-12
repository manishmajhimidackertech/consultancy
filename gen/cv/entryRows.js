/*
 * Repeating groups in the CV editor: one row per qualification or job held.
 *
 * Rows are read back by field name, and a row left entirely empty is ignored,
 * so the editor can always offer a blank row without it reaching the paper.
 */

const ENTRY_FIELDS = {
  education: [
    { name: "qualification", label: "Qualification", placeholder: "e.g. +2 in Management" },
    { name: "institution", label: "Institution" },
    { name: "year", label: "Year", placeholder: "Year of completion" },
    { name: "result", label: "Result", placeholder: "Grade or percentage" },
  ],
  experience: [
    { name: "position", label: "Position" },
    { name: "organisation", label: "Organisation" },
    { name: "period", label: "Period", placeholder: "e.g. 2022 – 2024" },
    { name: "location", label: "Location" },
    { name: "duties", label: "Responsibilities", wide: true, multiline: true },
  ],
};

function addEntryRow(kind, focus = false) {
  const container = document.getElementById(kind);

  const row = document.createElement("div");
  row.className = "entry_row";

  ENTRY_FIELDS[kind].forEach((field) => {
    const input = document.createElement(field.multiline ? "textarea" : "input");
    if (!field.multiline) {
      input.type = "text";
    } else {
      input.rows = 2;
    }
    input.name = field.name;
    input.placeholder = field.placeholder || field.label;
    input.setAttribute("aria-label", field.label);
    if (field.wide) {
      input.className = "wide";
    }
    row.appendChild(input);
  });

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.textContent = "Remove";
  removeButton.className = "red_button transparent_button";
  removeButton.onclick = () => {
    row.remove();
    announceEditorChange();
  };
  row.appendChild(removeButton);

  container.appendChild(row);

  if (focus) {
    row.querySelector("input, textarea").focus();
  }
}

/** The filled-in rows of one group, as plain objects. */
function readEntryRows(kind) {
  const rows = document.querySelectorAll(`#${kind} .entry_row`);
  const entries = [];

  rows.forEach((row) => {
    const entry = {};
    let filled = false;

    ENTRY_FIELDS[kind].forEach((field) => {
      const value = row.querySelector(`[name="${field.name}"]`).value.trim();
      entry[field.name] = value;
      filled = filled || value !== "";
    });

    if (filled) {
      entries.push(entry);
    }
  });

  return entries;
}

/** Tell the editor something changed that was not a keystroke in a field. */
function announceEditorChange() {
  document.getElementById("editor").dispatchEvent(new Event("input"));
}
