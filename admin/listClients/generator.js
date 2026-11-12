function generateMOU(uuid) {
  const params = new URLSearchParams({ uuid });
  window.open(`${window.location.origin}/gen/mou/?${params.toString()}`, '_blank');
}

function generateCV(uuid) {
  const params = new URLSearchParams({ uuid });
  window.open(`${window.location.origin}/gen/cv/?${params.toString()}`, '_blank');
}
