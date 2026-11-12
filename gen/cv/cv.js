let objectiveEdited = false;

document.addEventListener("DOMContentLoaded", async () => {
  const uuid = requestedClientId();

  if (uuid === "") {
    disableEditor();
    showPaperMessage("No client was chosen. Open a client from List Clients and press Generate CV.");
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

  prefillCVForm(client);

  addEntryRow("education");
  addEntryRow("experience");

  const form = document.getElementById("editor");
  form.addEventListener("input", refreshCV);
  form.addEventListener("change", refreshCV);

  form.elements["objective"].addEventListener("input", () => {
    objectiveEdited = true;
  });
  form.elements["positions"].addEventListener("input", () => {
    if (!objectiveEdited) {
      form.elements["objective"].value = suggestedObjective(form.elements["positions"].value);
    }
  });

  refreshCV();
  window.addEventListener("resize", fitPaper);
});

/** Fill the editor from the client's record. */
function prefillCVForm(clientData) {
  const form = document.forms["editor"];

  form.elements["name"].value = clientData.name || "";
  form.elements["address"].value = clientData.address || "";
  form.elements["mobileNumber"].value = clientData.mobileNumber || "";
  form.elements["email"].value = clientData.email || "";
  form.elements["gender"].value = clientData.gender || "Prefer Not Say";
  form.elements["bikeLicense"].value = clientData.bikeLicense === "yes" ? "yes" : "no";
  form.elements["positions"].value = clientData.jobPreferences.join(", ");
  form.elements["objective"].value = suggestedObjective(form.elements["positions"].value);
  form.elements["signedOn"].value = todayForInput();

  // A record without an uploaded photograph has nothing worth printing; the
  // grey silhouette shown elsewhere in the admin area is not for a CV.
  const hasPhoto = uploadUrl(clientData.profilePic, "") !== "";
  form.elements["showPhoto"].checked = hasPhoto;
  form.elements["showPhoto"].disabled = !hasPhoto;
}

/** A one-sentence objective naming the positions sought. */
function suggestedObjective(positionsText) {
  const positions = splitList(positionsText);

  if (positions.length === 0) {
    return "To work in a position where I can apply my skills, keep learning, and contribute to the growth of the organisation.";
  }

  const first = positions[0];
  const article = /^[aeiou]/i.test(first) ? "an" : "a";

  return `To work as ${article} ${joinWithOr(positions)} where I can apply my skills, keep learning, and contribute to the growth of the organisation.`;
}

/** Everything the CV is drawn from, read out of the editor. */
function readCVForm() {
  const form = document.forms["editor"];

  return {
    name: form.elements["name"].value.trim(),
    address: form.elements["address"].value.trim(),
    mobileNumber: form.elements["mobileNumber"].value.trim(),
    email: form.elements["email"].value.trim(),
    gender: form.elements["gender"].value,
    dateOfBirth: form.elements["dateOfBirth"].value,
    nationality: form.elements["nationality"].value.trim(),
    bikeLicense: form.elements["bikeLicense"].value,
    photo: form.elements["showPhoto"].checked
      ? uploadUrl(client.profilePic, "")
      : "",
    positions: splitList(form.elements["positions"].value),
    objective: form.elements["objective"].value.trim(),
    education: readEntryRows("education"),
    experience: readEntryRows("experience"),
    skills: splitList(form.elements["skills"].value),
    languages: splitList(form.elements["languages"].value),
    place: form.elements["place"].value.trim(),
    signedOn: form.elements["signedOn"].value,
    showFooter: form.elements["showFooter"].checked,
  };
}

function refreshCV() {
  renderCV(readCVForm());
  fitPaper();
}

function printCV() {
  if (!client) {
    toastDialog("warning", "There is no CV to print yet.");
    return;
  }

  const name = document.forms["editor"].elements["name"].value.trim() || client.name;
  printDocument(`CV - ${name}`);
}
