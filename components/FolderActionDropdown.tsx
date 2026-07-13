"use client";

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

import { useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { renameFolder, deleteFolder } from "@/lib/actions/folder.actions";

const folderActionItems = [
    { label: "Rename", icon: "/assets/icons/edit.svg", value: "rename" },
    { label: "Delete", icon: "/assets/icons/delete.svg", value: "delete" },
];

const FolderActionDropdown = ({ folder }: { folder: FolderDocument }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [action, setAction] = useState<ActionType | null>(null);
  const [name, setName] = useState(folder.name);
  const [isLoading, setIsLoading] = useState(false);

  const path = usePathname();
  const router = useRouter();

  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setName(folder.name);
  };

  const handleAction = async () => {
    if (!action) return;
    setIsLoading(true);

    if (action.value === "rename") {
      await renameFolder({ folderId: folder.$id, name, path });
    }

    if (action.value === "delete") {
      await deleteFolder({ folderId: folder.$id, path });
      router.push(path.startsWith("/folder/") ? "/" : path);
    }

    closeAllModals();
    setIsLoading(false);
  };

  const renderDialogContent = () => {
    if (!action) return null;

    const { value, label } = action;
    return (
      <DialogContent className="shad-dialog button">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-light-100">
            {label}
          </DialogTitle>
          {value === "rename" && (
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          {value === "delete" && (
            <p className="delete-confirmation">
              are you sure you want to delete{` `}
              <span className="delete-file-name">{folder.name}</span>?
            </p>
          )}
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-3 md:flex-row">
          <Button onClick={closeAllModals} className="modal-cancel-button">
            cancel
          </Button>
          <Button onClick={handleAction} className="modal-submit-button">
            <p className="capitalize">{value}</p>
            {isLoading && (
              <Image
                src="/assets/icons/loader.svg"
                alt="loader"
                width={24}
                height={24}
                className="animate-spin"
              />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className="shad-no-focus">
          <Image src="/assets/icons/dots.svg" alt="dots" width={34} height={34} />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="max-w-[200px] truncate">
            {folder.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {folderActionItems.map((actionItem) => (
            <DropdownMenuItem
              key={actionItem.value}
              className="shad-dropdown-item"
              onClick={() => {
                setAction(actionItem);
                setIsModalOpen(true);
              }}
            >
              <div className="flex items-center gap-2">
                <Image src={actionItem.icon} alt={actionItem.label} width={30} height={30} />
                {actionItem.label}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {renderDialogContent()}
    </Dialog>
  );
};

export default FolderActionDropdown;