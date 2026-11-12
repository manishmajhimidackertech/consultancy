document.addEventListener("DOMContentLoaded", async () => {
  const uuid = requestedClientId();

  if (uuid === "") {
    disableEditor();
    showPaperMessage("No client was chosen. Open a client from List Clients and press Create MOU.");
    return;
  }

  try {
    await fetchClient(uuid);
  } catch (error) {
    disableEditor();
    toastDialog("error", error.message);
    showPaperMessage(error.message);
    return;
  }

  prefillMOUForm(client, applications);

  const form = document.getElementById("editor");
  form.addEventListener("input", refreshMOU);
  form.addEventListener("change", refreshMOU);
  form.elements["application"].addEventListener("change", fillFromApplication);
  form.elements["feeType"].addEventListener("change", showFeeField);

  refreshMOU();
  window.addEventListener("resize", fitPaper);
});

/** Fill the editor from the client's record. */
function prefillMOUForm(clientData, clientApplications) {
  const form = document.forms["editor"];

  form.elements["reference"].value = `MOU/${clientData.id}`;
  form.elements["signedOn"].value = todayForInput();
  form.elements["name"].value = clientData.name || "";
  form.elements["address"].value = clientData.address || "";
  form.elements["mobileNumber"].value = clientData.mobileNumber || "";

  const select = form.elements["application"];
  clientApplications.forEach((application, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${application.position} at ${application.companyName} (${application.applicationState})`;
    select.appendChild(option);
  });

  // An accepted offer is what the fee is charged on, so start from it.
  const accepted = clientApplications.findIndex(
    (application) => application.applicationState === "Accepted"
  );
  select.value = accepted === -1 ? "" : String(accepted);

  fillFromApplication();
  showFeeField();
}

/** Copy the chosen vacancy into the placement fields. */
function fillFromApplication() {
  const form = document.forms["editor"];
  const index = form.elements["application"].value;

  if (index === "") {
    form.elements["position"].value = client.jobPreferences.join(", ");
    form.elements["employer"].value = "";
    form.elements["salary"].value = "";
    return;
  }

  const application = applications[Number(index)];
  form.elements["position"].value = application.position;
  form.elements["employer"].value = application.companyName;
  form.elements["salary"].value = application.minimumSalary;
}

/** Show the amount or the percentage, whichever the fee is charged as. */
function showFeeField() {
  const form = document.forms["editor"];
  const percent = form.elements["feeType"].value === "percent";

  document.getElementById("fee_amount").hidden = percent;
  document.getElementById("fee_percent").hidden = !percent;
}

/** A number input's value, or null when it is empty or not a number. */
function numberOrNull(input) {
  if (input.value.trim() === "") {
    return null;
  }

  const number = Number(input.value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

/** Everything the MOU is drawn from, read out of the editor. */
function readMOUForm() {
  const form = document.forms["editor"];

  return {
    reference: form.elements["reference"].value.trim(),
    signedOn: form.elements["signedOn"].value,
    validityMonths: numberOrNull(form.elements["validityMonths"]),
    companyAddress: form.elements["companyAddress"].value.trim(),
    representative: form.elements["representative"].value.trim(),
    designation: form.elements["designation"].value.trim(),
    name: form.elements["name"].value.trim(),
    address: form.elements["address"].value.trim(),
    mobileNumber: form.elements["mobileNumber"].value.trim(),
    citizenshipNumber: form.elements["citizenshipNumber"].value.trim(),
    position: form.elements["position"].value.trim(),
    employer: form.elements["employer"].value.trim(),
    salary: numberOrNull(form.elements["salary"]),
    feeType: form.elements["feeType"].value,
    feeAmount: numberOrNull(form.elements["feeAmount"]),
    feePercent: numberOrNull(form.elements["feePercent"]),
    paymentDays: numberOrNull(form.elements["paymentDays"]),
    additionalTerms: form.elements["additionalTerms"].value
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== ""),
    showWitnesses: form.elements["showWitnesses"].checked,
  };
}

function refreshMOU() {
  renderMOU(readMOUForm());
  fitPaper();
}

function printMOU() {
  if (!client) {
    toastDialog("warning", "There is no MOU to print yet.");
    return;
  }

  const name = document.forms["editor"].elements["name"].value.trim() || client.name;
  printDocument(`MOU - ${name}`);
}
