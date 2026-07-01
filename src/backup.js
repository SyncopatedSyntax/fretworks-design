// Shared progress export/import — one implementation every trainer can use.
// Trainers namespace their localStorage keys with a short prefix (e.g. "tri_",
// "ct_"); these functions work generically off that prefix, so no per-tool
// key lists need to live here. Values are expected to be JSON-stringified in
// localStorage (the convention every trainer's `store.set` already follows).

export function exportProgress(toolKey, prefix) {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(prefix)) continue;
    try { data[key] = JSON.parse(localStorage.getItem(key)); }
    catch { data[key] = localStorage.getItem(key); }
  }
  const payload = { tool: toolKey, prefix, exported: new Date().toISOString(), data };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${toolKey}-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importProgress(file, { toolKey, prefix }) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const payload = JSON.parse(ev.target.result);
        if (!payload || typeof payload.data !== "object") throw new Error("Not a Fretworks backup file");
        if (payload.tool && payload.tool !== toolKey) throw new Error(`This backup is from ${payload.tool}, not ${toolKey}`);
        for (const [key, value] of Object.entries(payload.data)) {
          if (!key.startsWith(prefix)) continue; // never write outside this tool's namespace
          localStorage.setItem(key, JSON.stringify(value));
        }
        resolve(payload);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsText(file);
  });
}
