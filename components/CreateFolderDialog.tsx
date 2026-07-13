"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createFolder } from "@/lib/actions/folder.actions";

interface Props {
    ownerId: string;
    accountId: string;
}

const CreateFolderDialog = ({ ownerId, accountId }: Props) => {
    const path = usePathname();
    const folderId = path.startsWith("/folder/") ? path.split("/folder/")[1] : null;
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) return;
        setIsLoading(true);

        await createFolder({
            name: name.trim(),
            ownerId,
            accountId,
            parent: folderId,
            path,
        });

        setIsLoading(false);
        setName("");
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button type="button" className="uploader-button">
                    <Image
                        src="/assets/icons/dashboard.svg"
                        alt="Create Folder"
                        width={24}
                        height={24}
                    />
                    <p>new Folder</p>
                </Button>
            </DialogTrigger>
      <DialogContent className="shad-dialog button">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-light-100">
            new Folder
          </DialogTitle>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Folder name"
          />
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-3 md:flex-row">
          <Button onClick={() => setIsOpen(false)} className="modal-cancel-button">
            cancel
          </Button>
          <Button onClick={handleCreate} className="modal-submit-button">
            <p className="capitalize">create</p>
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
    </Dialog>
  );
};

export default CreateFolderDialog;