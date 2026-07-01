import { useState } from "react";
import { exportProgress, importProgress } from "../backup.js";

// Shared Settings-tab widget: export/import everything under a tool's
// localStorage prefix as one JSON file. Every trainer gets identical
// buttons + behavior — reload after import so the app re-reads its own
// initial state naturally, with no per-tool wiring needed here.
export function ProgressBackup({ toolKey, prefix }) {
  const [msg, setMsg] = useState("");

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    importProgress(file, { toolKey, prefix })
      .then(() => { setMsg("✓ Imported — reloading…"); setTimeout(() => window.location.reload(), 900); })
      .catch((err) => setMsg("✗ " + err.message));
    e.target.value = "";
  };

  return (
    <div className="fw-backup">
      <button className="fw-btn fw-btn-ghost" onClick={() => exportProgress(toolKey, prefix)}>Export ↓</button>
      <label className="fw-btn fw-btn-ghost fw-backup-file">
        Import ↑
        <input type="file" accept=".json" onChange={handleImport} />
      </label>
      {msg && <span className={"fw-backup-msg" + (msg.startsWith("✓") ? " ok" : " err")}>{msg}</span>}
    </div>
  );
}
