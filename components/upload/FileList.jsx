import { FileText, Image, CheckCircle } from "lucide-react";

function FileIcon({ type }) {
  return type === "pdf" ? (
    <FileText size={24} strokeWidth={1.8} />
  ) : (
    <Image size={24} strokeWidth={1.8} />
  );
}

function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

export default function FileList({ files, selectedId, onSelect }) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="file-list">
      {files.map((file) => (
        <div
          key={file.id}
          className={`file-item ${selectedId === file.id ? "active" : ""}`}
          onClick={() => onSelect(file.id)}
        >
          <FileIcon type={file.type} />
          <div className="file-info">
            <h4>{file.name}</h4>
            <p>{formatFileSize(file.size)}</p>
          </div>
          {file.status === "completed" && (
            <CheckCircle size={20} strokeWidth={1.8} />
          )}
        </div>
      ))}
    </div>
  );
}
