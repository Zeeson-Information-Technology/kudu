"use client";

import { useState } from "react";

type PrintCopyActionsProps = {
  value: string;
};

export default function PrintCopyActions({ value }: PrintCopyActionsProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus("success");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch (error) {
      setCopyStatus("error");
      setTimeout(() => setCopyStatus("idle"), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="actions-row no-print">
      <button className="button secondary table-action" type="button" onClick={handlePrint}>
        Print
      </button>
      <button className="button primary" type="button" onClick={handleCopy}>
        Copy Reference ID
      </button>
      {copyStatus === "success" ? (
        <span className="form-helper" role="status">
          Copied
        </span>
      ) : null}
      {copyStatus === "error" ? (
        <span className="form-helper" role="status">
          Unable to copy
        </span>
      ) : null}
    </div>
  );
}
