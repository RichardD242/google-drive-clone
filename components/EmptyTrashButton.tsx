"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { emptyTrash } from "@/lib/actions/file.actions";

const EmptyTrashButton = ({ disabled }: { disabled: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmptyTrash = async () => {
    setIsLoading(true);
    await emptyTrash();
    setIsLoading(false);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        type="button"
        className="modal-cancel-button"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
      >
        Empty Trash
      </Button>
      <DialogContent className="shad-dialog button">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-light-100">
            Empty Trash
          </DialogTitle>
          <p className="delete-confirmation">
            are you sure you want to permanently delete everything in trash?
            this cannot be undone.
          </p>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-3 md:flex-row">
          <Button onClick={() => setIsOpen(false)} className="modal-cancel-button">
            cancel
          </Button>
          <Button onClick={handleEmptyTrash} className="modal-submit-button">
            <p className="capitalize">empty trash</p>
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

export default EmptyTrashButton;
