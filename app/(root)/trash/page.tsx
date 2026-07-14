import { getTrashedFiles } from "@/lib/actions/file.actions";
import { getTrashedFolders } from "@/lib/actions/folder.actions";
import TrashCard from "@/components/TrashCard";
import TrashFolderCard from "@/components/TrashFolderCard";

const Page = async () => {
  const [files, folders] = await Promise.all([
    getTrashedFiles(),
    getTrashedFolders(),
  ]);

  return (
    <div className="page-container">
      <section className="w-full">
        <h1 className="h1 capitalize">Trash</h1>
      </section>

      {files.total > 0 || folders.total > 0 ? (
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