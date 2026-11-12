/*
 * Draw the memorandum onto the paper from what readMOUForm() returns.
 *
 * The wording follows the agency's arrangement as the rest of the system
 * records it: the client is registered free, put forward for vacancies, and
 * pays a fee only once an offer arranged by the agency is accepted, which is
 * the moment List Clients and the summary page mark the fee as due.
 */

function renderMOU(mou) {
  const paper = document.getElementById("paper");
  const companyName = paper.dataset.companyName || "";
  paper.replaceChildren();

  paper.appendChild(renderLetterhead(companyName, mou.companyAddress, paper.dataset.companyDomain || ""));

  const references = paperElement("div", "", "mou_references");
  references.appendChild(paperParagraph(["Ref. No.: ", valueOrBlank(mou.reference)]));
  references.appendChild(paperParagraph(["Date: ", valueOrBlank(formatDate(mou.signedOn))]));
  paper.appendChild(references);

  paper.appendChild(paperElement("h1", "Memorandum of Understanding", "mou_title"));

  paper.appendChild(
    paperParagraph([
      "This Memorandum of Understanding is made on ",
      valueOrBlank(formatDate(mou.signedOn)),
      " between ",
      paperElement("strong", companyName),
      ", of ",
      valueOrBlank(mou.companyAddress),
      " (the “Consultancy”), and ",
      strongOrBlank(mou.name),
      ", resident of ",
      valueOrBlank(mou.address),
      ", mobile ",
      valueOrBlank(formatMobile(mou.mobileNumber)),
      ", citizenship no. ",
      valueOrBlank(mou.citizenshipNumber),
      " (the “Candidate”).",
    ])
  );

  paper.appendChild(renderClauses(mou));

  paper.appendChild(
    paperElement(
      "p",
      "Both parties have read and understood this memorandum, and sign it of their own free will."
    )
  );

  paper.appendChild(renderSignatures(mou, companyName));

  if (mou.showWitnesses) {
    paper.appendChild(renderWitnesses());
  }
}

/** Bold text, or a dotted line when there is nothing to embolden. */
function strongOrBlank(value) {
  const strong = paperElement("strong");
  strong.appendChild(valueOrBlank(value));
  return strong;
}

function renderLetterhead(companyName, companyAddress, companyDomain) {
  const letterhead = paperElement("div", "", "mou_letterhead");

  const logo = document.createElement("img");
  logo.src = "../../assets/img/logo.webp";
  logo.alt = "Company Logo";
  letterhead.appendChild(logo);

  const identity = paperElement("div");
  identity.appendChild(paperElement("h2", companyName));

  const details = [companyAddress, companyDomain].filter((detail) => detail !== "");
  if (details.length > 0) {
    identity.appendChild(paperElement("p", details.join(" | ")));
  }
  letterhead.appendChild(identity);

  return letterhead;
}

/** One numbered clause: a bold heading followed by its text. */
function mouClause(title, parts) {
  const item = document.createElement("li");

  if (title !== "") {
    item.appendChild(paperElement("strong", `${title}. `));
  }
  parts.forEach((part) => {
    item.appendChild(typeof part === "string" ? document.createTextNode(part) : part);
  });

  return item;
}

/** A number for the running text, or a short line to write one in. */
function numberOrBlank(number) {
  if (number === null) {
    return paperElement("span", "", "blank short");
  }

  return document.createTextNode(String(number));
}

/** The words of the fee clause that say how much is owed. */
function feeParts(mou) {
  if (mou.feeType === "percent") {
    const parts = [
      "a service fee of ",
      numberOrBlank(mou.feePercent),
      "% of the Candidate’s first month’s salary",
    ];

    if (mou.feePercent !== null && mou.salary !== null && mou.salary > 0) {
      const fee = (mou.salary * mou.feePercent) / 100;
      parts.push(
        `, which on the offered salary of ${formatAmount(mou.salary)} comes to `,
        paperElement("strong", formatAmount(fee)),
        ` (${amountInWords(fee)})`
      );
    }

    return parts;
  }

  if (mou.feeAmount === null) {
    return ["a service fee of NPR ", paperElement("span", "", "blank")];
  }

  return [
    "a service fee of ",
    paperElement("strong", formatAmount(mou.feeAmount)),
    ` (${amountInWords(mou.feeAmount)})`,
  ];
}

function renderClauses(mou) {
  const list = paperElement("ol", "", "mou_clauses");

  const employment = ["The Consultancy agrees to help the Candidate find employment as ", valueOrBlank(mou.position)];
  if (mou.employer !== "") {
    employment.push(" with ", mou.employer);
  }
  employment.push(".");
  list.appendChild(mouClause("Purpose", employment));

  list.appendChild(
    mouClause("Services", [
      "The Consultancy will keep the Candidate’s details on its register, put the Candidate forward for suitable vacancies, arrange interviews with employers, and advise the Candidate through the application process.",
    ])
  );

  list.appendChild(
    mouClause("No guarantee of employment", [
      "The Consultancy does not guarantee employment. The decision to hire, and the terms of employment, rest with the employer alone.",
    ])
  );

  list.appendChild(
    mouClause("Service fee", [
      "The Candidate will pay the Consultancy ",
      ...feeParts(mou),
      ". No fee is payable unless the Candidate accepts an offer of employment arranged by the Consultancy. The fee is due within ",
      numberOrBlank(mou.paymentDays),
      " days of accepting the offer, and the Consultancy will issue a receipt for every payment.",
    ])
  );

  list.appendChild(
    mouClause("The Candidate’s undertakings", [
      "The Candidate confirms that the information and documents given to the Consultancy are true and genuine; will attend the interviews that are arranged, or give notice in good time of being unable to; and will inform the Consultancy promptly of any offer received from an employer the Consultancy introduced.",
    ])
  );

  list.appendChild(
    mouClause("Confidentiality", [
      "The Consultancy will share the Candidate’s personal details and documents only with prospective employers, and only for the purpose of this memorandum.",
    ])
  );

  list.appendChild(
    mouClause("Duration", [
      "This memorandum takes effect on the date it is signed and remains in force for ",
      numberOrBlank(mou.validityMonths),
      mou.validityMonths === 1 ? " month" : " months",
      ", unless either party ends it earlier by written notice. A fee already earned under clause 4 remains payable.",
    ])
  );

  mou.additionalTerms.forEach((term) => {
    list.appendChild(mouClause("", [term]));
  });

  return list;
}

/** A signature line with the signer's details written beneath it. */
function signatureBlock(heading, details) {
  const block = paperElement("div", "", "mou_party");
  block.appendChild(paperElement("h3", heading));

  const signature = paperElement("div", "", "signature");
  signature.appendChild(paperElement("span", "", "signature_line"));
  signature.appendChild(paperElement("p", "Signature"));
  block.appendChild(signature);

  details.forEach(([label, value]) => {
    block.appendChild(paperParagraph([`${label}: `, valueOrBlank(value)]));
  });

  return block;
}

/** An empty box to stamp or press a thumb into, captioned beneath. */
function stampBox(caption) {
  const figure = paperElement("figure", "", "mou_stamp");
  figure.appendChild(paperElement("div"));
  figure.appendChild(paperElement("figcaption", caption));
  return figure;
}

function renderSignatures(mou, companyName) {
  const signatures = paperElement("div", "", "mou_signatures");

  const consultancy = signatureBlock(`For ${companyName || "the Consultancy"}`, [
    ["Name", mou.representative],
    ["Designation", mou.designation],
  ]);
  const seal = paperElement("div", "", "mou_stamps");
  seal.appendChild(stampBox("Office Seal"));
  consultancy.appendChild(seal);
  signatures.appendChild(consultancy);

  const candidate = signatureBlock("The Candidate", [
    ["Name", mou.name],
    ["Citizenship No.", mou.citizenshipNumber],
  ]);
  const thumbs = paperElement("div", "", "mou_stamps");
  thumbs.appendChild(stampBox("Right Thumb"));
  thumbs.appendChild(stampBox("Left Thumb"));
  candidate.appendChild(thumbs);
  signatures.appendChild(candidate);

  return signatures;
}

function renderWitnesses() {
  const witnesses = paperElement("div", "", "mou_witnesses");

  ["First Witness", "Second Witness"].forEach((heading) => {
    const witness = paperElement("div");
    witness.appendChild(paperElement("h3", heading));

    const line = paperElement("div");
    line.appendChild(paperParagraph(["Name: ", valueOrBlank("")]));
    line.appendChild(paperParagraph(["Signature: ", valueOrBlank("")]));
    witness.appendChild(line);

    witnesses.appendChild(witness);
  });

  return witnesses;
}
