"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { toggleFavoriteFile } from "@/lib/actions/file.actions";
import { toggleFavoriteFolder } from "@/lib/actions/folder.actions";


interface Props {
  id: string;
  favorited: boolean;
  kind: "file" | "folder";
}


const FavoriteStar = ({ id, favorited, kind }: Props) => {
  const path = usePathname();
  const [isFavorited, setIsFavorited] = useState(favorited);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading) return;
    setIsLoading(true);

    const next = !isFavorited;
    setIsFavorited(next);

    if (kind === "file") {
      await toggleFavoriteFile({ fileId: id, favorited: next, path });
    } else {
      await toggleFavoriteFolder({ folderId: id, favorited: next, path });
    }

    setIsLoading(false);
  };


  return (
    <button type="button" onClick={handleToggle} className="shad-no-focus">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill={isFavorited ? "#F9AB00" : "none"}
        stroke={isFavorited ? "#F9AB00" : "#a3a3a3"}
        strokeWidth="1.5"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
      </svg>
    </button>
  );
};

export default FavoriteStar;