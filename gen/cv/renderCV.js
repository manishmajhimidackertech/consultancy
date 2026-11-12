/*
 * Draw the CV onto the paper from what readCVForm() returns.
 *
 * Sections with nothing in them are left out entirely, so a client with no
 * work history gets a shorter CV rather than an empty heading.
 */

function renderCV(cv) {
  const paper = document.getElementById("paper");
  paper.replaceChildren();

  paper.appendChild(renderCVHeading(cv));

  if (cv.objective !== "") {
    paper.appendChild(cvSection("Career Objective", paperElement("p", cv.objective)));
  }

  if (cv.education.length > 0) {
    paper.appendChild(cvSection("Education", renderEducation(cv.education)));
  }

  if (cv.experience.length > 0) {
    paper.appendChild(cvSection("Work Experience", renderExperience(cv.experience)));
  }

  if (cv.skills.length > 0) {
    paper.appendChild(cvSection("Skills", renderTags(cv.skills)));
  }

  if (cv.languages.length > 0) {
    paper.appendChild(cvSection("Languages", paperElement("p", cv.languages.join(", "))));
  }

  const personalDetails = renderPersonalDetails(cv);
  if (personalDetails.childElementCount > 0) {
    paper.appendChild(cvSection("Personal Details", personalDetails));
  }

  paper.appendChild(cvSection("Declaration", renderDeclaration(cv)));

  if (cv.showFooter && paper.dataset.companyName) {
    paper.appendChild(
      paperElement("div", `Prepared by ${paper.dataset.companyName}`, "paper_footer")
    );
  }
}

function cvSection(title, content) {
  const section = paperElement("section", "", "cv_section");
  section.appendChild(paperElement("h2", title));
  section.appendChild(content);
  return section;
}

function renderCVHeading(cv) {
  const header = paperElement("div", "", "cv_heading");

  if (cv.photo !== "") {
    const img = document.createElement("img");
    img.src = cv.photo;
    img.alt = cv.name;
    header.appendChild(img);
  }

  const identity = paperElement("div", "", "cv_identity");

  const h1 = paperElement("h1");
  h1.appendChild(valueOrBlank(cv.name));
  identity.appendChild(h1);

  if (cv.positions.length > 0) {
    identity.appendChild(paperElement("p", cv.positions.join(" · "), "cv_positions"));
  }

  const contact = paperElement("ul", "", "cv_contact");
  [cv.address, formatMobile(cv.mobileNumber), cv.email].forEach((detail) => {
    if (detail !== "") {
      contact.appendChild(paperElement("li", detail));
    }
  });
  identity.appendChild(contact);

  header.appendChild(identity);
  return header;
}

function renderEducation(education) {
  const table = paperElement("table", "", "cv_table");

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  ["Qualification", "Institution", "Year", "Result"].forEach((heading) => {
    headRow.appendChild(paperElement("th", heading));
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  education.forEach((entry) => {
    const row = document.createElement("tr");
    [entry.qualification, entry.institution, entry.year, entry.result].forEach((value) => {
      row.appendChild(paperElement("td", value));
    });
    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  return table;
}

function renderExperience(experience) {
  const list = paperElement("ul", "", "cv_experience");

  experience.forEach((entry) => {
    const item = document.createElement("li");

    const title = paperElement("div", "", "cv_experience_title");
    title.appendChild(
      paperElement("strong", [entry.position, entry.organisation].filter(Boolean).join(", "))
    );
    title.appendChild(
      paperElement("span", [entry.period, entry.location].filter(Boolean).join(" · "))
    );
    item.appendChild(title);

    if (entry.duties !== "") {
      item.appendChild(paperElement("p", entry.duties));
    }

    list.appendChild(item);
  });

  return list;
}

function renderTags(items) {
  const list = paperElement("ul", "", "cv_tags");
  items.forEach((item) => list.appendChild(paperElement("li", item)));
  return list;
}

function renderPersonalDetails(cv) {
  const dl = paperElement("dl", "", "cv_details");

  const details = [
    ["Date of Birth", formatDate(cv.dateOfBirth)],
    ["Gender", cv.gender === "Prefer Not Say" ? "" : cv.gender],
    ["Nationality", cv.nationality],
    ["Driving Licence", cv.bikeLicense === "yes" ? "Two-wheeler" : ""],
  ];

  details.forEach(([term, value]) => {
    if (value !== "") {
      dl.appendChild(paperElement("dt", term));
      dl.appendChild(paperElement("dd", value));
    }
  });

  return dl;
}

function renderDeclaration(cv) {
  const container = paperElement("div", "", "cv_declaration");

  container.appendChild(
    paperElement(
      "p",
      "I hereby declare that the information given above is true and correct to the best of my knowledge and belief."
    )
  );

  const signOff = paperElement("div", "", "cv_sign_off");

  const when = paperElement("div");
  when.appendChild(paperParagraph(["Place: ", valueOrBlank(cv.place)]));
  when.appendChild(paperParagraph(["Date: ", valueOrBlank(formatDate(cv.signedOn))]));
  signOff.appendChild(when);

  const signature = paperElement("div", "", "signature");
  signature.appendChild(paperElement("span", "", "signature_line"));
  signature.appendChild(paperElement("p", cv.name || "Signature"));
  signOff.appendChild(signature);

  container.appendChild(signOff);
  return container;
}
