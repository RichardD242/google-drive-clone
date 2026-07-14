import { getTrashedFiles } from "@/lib/actions/file.actions";
import { getTrashedFolders } from "@/lib/actions/folder.actions";
import TrashCard from "@/components/TrashCard";
import TrashFolderCard from "@/components/TrashFolderCard";
import EmptyTrashButton from "@/components/EmptyTrashButton";

const Page = async () => {
  const [files, folders] = await Promise.all([
    getTrashedFiles(),
    getTrashedFolders(),
  ]);

  const isEmpty = files.total === 0 && folders.total === 0;

  return (
    <div className="page-container">
      <section className="flex w-full items-center justify-between">
        <h1 className="h1 capitalize">Trash</h1>
        <EmptyTrashButton disabled={isEmpty} />
      </section>

      {!isEmpty ? (
        <section className="file-list">
          {folders.documents.map((folder: FolderDocument) => (
            <TrashFolderCard key={folder.$id} folder={folder} />
          ))}
          {files.documents.map((file: FileDocument) => (
            <TrashCard key={file.$id} file={file} />
          ))}
        </section>
      ) : (
        <p className="empty-list">Trash is empty</p>
      )}
    </div>
  );
};

export default Page;