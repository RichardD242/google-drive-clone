"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import FormattedDateTime from "@/components/FormattedDateTime";
import FolderActionDropdown from "@/components/FolderActionDropdown";
import { moveFile } from "@/lib/actions/file.actions";
import { moveFolder } from "@/lib/actions/folder.actions";

const FolderCard = ({ folder }: { folder: FolderDocument }) => {
  const router = useRouter();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ id: folder.$id, kind: "folder" }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const data = e.dataTransfer.getData("application/json");
    if (!data) return;

    const dragged = JSON.parse(data) as { id: string; kind: "file" | "folder" };
    if (dragged.kind === "folder" && dragged.id === folder.$id) return;

    if (dragged.kind === "file") {
      await moveFile({ fileId: dragged.id, parent: folder.$id, path: window.location.pathname });
    } else {
      await moveFolder({ folderId: dragged.id, parent: folder.$id, path: window.location.pathname });
    }

    router.refresh();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`file-card ${isDragOver ? "outline outline-2 outline-brand" : ""}`}
    >
      <div className="flex justify-between">
        <Link href={`/folder/${folder.$id}`} className="flex items-center gap-3">
          <Image
            src="/assets/icons/folder.svg"
            alt="folder"
            width={40}
            height={40}
          />
        </Link>

        <FolderActionDropdown folder={folder} />
      </div>

      <div className="file-card-details">
        <Link href={`/folder/${folder.$id}`}>
          <p className="subtitle-2 line-clamp-1">{folder.name}</p>
        </Link>
        <FormattedDateTime
          date={folder.$createdAt}
          className="body-2 text-light-100"
        />
      </div>
    </div>
  );
};

export default FolderCard;