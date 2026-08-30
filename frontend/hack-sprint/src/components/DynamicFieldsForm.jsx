import React, { useState } from "react";
import { X, FileText, Loader2 } from "lucide-react";
import { MediaAPI } from "../api/media.api.js";
import toast from "react-hot-toast";

const inputCls =
  "font-[family-name:'JetBrains_Mono',monospace] w-full bg-[rgba(18,22,18,0.7)] border border-[rgba(95,255,96,0.15)] rounded-[3px] px-3 py-2.5 text-[0.72rem] text-[#e8ffe8] placeholder-[rgba(95,255,96,0.28)] focus:outline-none focus:border-[rgba(95,255,96,0.45)] focus:shadow-[0_0_0_2px_rgba(95,255,96,0.07)] transition-all";

const Label = ({ children, required }) => (
  <label className="font-[family-name:'JetBrains_Mono',monospace] text-[0.58rem] tracking-[0.14em] uppercase text-[rgba(95,255,96,0.55)] mb-1.5 block">
    {children}
    {required && <span className="text-[#ff9090] ml-1">*</span>}
  </label>
);

const ErrorText = ({ children }) =>
  children ? (
    <p className="text-[0.58rem] text-[#ff9090] mt-1">{children}</p>
  ) : null;

function FileInput({ field, value, onChange, error, resourceType, hackathonId }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (field.maxSizeMB && file.size > field.maxSizeMB * 1024 * 1024) {
      toast.error(`File exceeds ${field.maxSizeMB}MB limit`);
      return;
    }
    setUploading(true);
    try {
      const res = await MediaAPI.uploadFile(file, resourceType, hackathonId);
      const uploaded = res.data.file || res.data;
      onChange(field.fieldName, uploaded);
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Label required={field.required}>{field.label}</Label>
      <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-[rgba(95,255,96,0.2)] rounded-[3px] cursor-pointer hover:border-[rgba(95,255,96,0.38)] transition-all px-3">
        <input
          type="file"
          accept={field.accept}
          onChange={handleFile}
          className="hidden"
          disabled={uploading}
        />
        {uploading ? (
          <Loader2 size={18} className="animate-spin text-[#5fff60]" />
        ) : value?.url ? (
          <div className="flex items-center gap-2 text-[0.62rem] text-[rgba(180,220,180,0.6)] max-w-full">
            <FileText size={14} className="text-[#5fff60] flex-shrink-0" />
            <span className="truncate">{value.originalName || "File uploaded"}</span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onChange(field.fieldName, null);
              }}
              className="ml-2 flex-shrink-0"
            >
              <X size={12} className="text-[rgba(255,100,100,0.7)]" />
            </button>
          </div>
        ) : (
          <span className="text-[0.6rem] text-[rgba(95,255,96,0.3)]">
            Click to upload
          </span>
        )}
      </label>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

function MultiFileInput({ field, value = [], onChange, error, resourceType, hackathonId }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    const remaining = field.maxFiles - value.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${field.maxFiles} files allowed`);
      return;
    }

    let toUpload = files;
    if (files.length > remaining) {
      toast.error(`Only ${remaining} more file(s) allowed — uploading the first ${remaining}`);
      toUpload = files.slice(0, remaining);
    }

    const oversized = toUpload.find(
      (f) => field.maxSizeMB && f.size > field.maxSizeMB * 1024 * 1024
    );
    if (oversized) {
      toast.error(`${oversized.name} exceeds ${field.maxSizeMB}MB limit`);
      toUpload = toUpload.filter(
        (f) => !field.maxSizeMB || f.size <= field.maxSizeMB * 1024 * 1024
      );
    }
    if (!toUpload.length) return;

    setUploading(true);
    try {
      const uploaded = [];
      for (const file of toUpload) {
        const res = await MediaAPI.uploadFile(file, resourceType, hackathonId);
        uploaded.push(res.data.file || res.data);
      }
      onChange(field.fieldName, [...value, ...uploaded]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeAt = (idx) => {
    onChange(field.fieldName, value.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <Label required={field.required}>
        {field.label} ({value.length}/{field.maxFiles})
      </Label>
      <div className="flex flex-col gap-2">
        {value.map((f, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-2 bg-[rgba(95,255,96,0.04)] border border-[rgba(95,255,96,0.12)] rounded-[3px] px-3 py-2"
          >
            <span className="text-[0.62rem] text-[rgba(180,220,180,0.6)] truncate">
              {f.originalName || `File ${i + 1}`}
            </span>
            <button type="button" onClick={() => removeAt(i)}>
              <X size={12} className="text-[rgba(255,100,100,0.7)]" />
            </button>
          </div>
        ))}
        {value.length < field.maxFiles && (
          <label className="flex items-center justify-center h-16 border border-dashed border-[rgba(95,255,96,0.2)] rounded-[3px] cursor-pointer hover:border-[rgba(95,255,96,0.38)] transition-all">
            <input
              type="file"
              accept={field.accept}
              multiple
              onChange={handleFile}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <Loader2 size={16} className="animate-spin text-[#5fff60]" />
            ) : (
              <span className="text-[0.58rem] text-[rgba(95,255,96,0.3)]">
                + Add file{field.maxFiles - value.length > 1 ? "s" : ""}
              </span>
            )}
          </label>
        )}
      </div>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

export default function DynamicFieldsForm({
  fields,
  values,
  onChange,
  errors = {},
  resourceType = "resource",
  hackathonId,
}) {
  return (
    <div className="flex flex-col gap-5">
      {fields.map((field) => {
        const error = errors[field.fieldName];
        const value = values[field.fieldName];

        if (field.inputKind === "file") {
          return (
            <FileInput
              key={field.fieldName}
              field={field}
              value={value}
              onChange={onChange}
              error={error}
              resourceType={resourceType}
              hackathonId={hackathonId}
            />
          );
        }
        if (field.inputKind === "multifile") {
          return (
            <MultiFileInput
              key={field.fieldName}
              field={field}
              value={value}
              onChange={onChange}
              error={error}
              resourceType={resourceType}
              hackathonId={hackathonId}
            />
          );
        }
        if (field.inputKind === "textarea") {
          return (
            <div key={field.fieldName}>
              <Label required={field.required}>{field.label}</Label>
              <textarea
                className={inputCls}
                rows={4}
                value={value}
                disabled={!field.editable}
                onChange={(e) => onChange(field.fieldName, e.target.value)}
              />
              <ErrorText>{error}</ErrorText>
            </div>
          );
        }
        if (field.inputKind === "select") {
          return (
            <div key={field.fieldName}>
              <Label required={field.required}>{field.label}</Label>
              <select
                className={inputCls}
                value={value}
                disabled={!field.editable}
                onChange={(e) => onChange(field.fieldName, e.target.value)}
              >
                <option value="">Select...</option>
                {field.options.map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ErrorText>{error}</ErrorText>
            </div>
          );
        }
        if (field.inputKind === "checkbox") {
          return (
            <div key={field.fieldName} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!value}
                disabled={!field.editable}
                onChange={(e) => onChange(field.fieldName, e.target.checked)}
              />
              <Label required={field.required}>{field.label}</Label>
              <ErrorText>{error}</ErrorText>
            </div>
          );
        }

        return (
          <div key={field.fieldName}>
            <Label required={field.required}>{field.label}</Label>
            <input
              type={field.inputKind}
              className={inputCls}
              value={value}
              disabled={!field.editable}
              onChange={(e) => onChange(field.fieldName, e.target.value)}
            />
            <ErrorText>{error}</ErrorText>
          </div>
        );
      })}
    </div>
  );
}