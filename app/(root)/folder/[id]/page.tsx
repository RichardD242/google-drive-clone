import Sort from "@/components/Sort";
import FolderCard from "@/components/FolderCard";
import Card from "@/components/Card";
import { getFiles } from "@/lib/actions/file.actions";
import { getFolder, getFolders } from "@/lib/actions/folder.actions";

const Page = async ({ params, searchParams }: SearchParamProps) => {
  const folderId = ((await params)?.id as string) || "";
  const searchText = ((await searchParams)?.query as string) || "";
  const sort = ((await searchParams)?.sort as string) || "";

  const [folder, subfolders, files] = await Promise.all([
    getFolder(folderId),
    getFolders({ parent: folderId }),
    getFiles({ types: [], searchText, sort, parent: folderId }),
  ]);

  return (
    <div className="page-container">
      <section className="w-full">
        <h1 className="h1 capitalize">{folder?.name}</h1>

        <div className="total-size-section">
          <p className="body-1">
            Total: <span className="h5">0 mb</span>
          </p>

          <div className="sort-container">
            <p className="body-1 hidden text-light-200 sm:block">Sort by:</p>
            <Sort />
          </div>
        </div>
      </section>

      {subfolders.total > 0 || files.total > 0 ? (
        <section className="file-list">
          {subfolders.documents.map((subfolder: FolderDocument) => (
            <FolderCard key={subfolder.$id} folder={subfolder} />
          ))}
          {files.documents.map((file: FileDocument) => (
            <Card key={file.$id} file={file} />
          ))}
        </section>
      ) : (
        <p className="empty-list">this folder is empty</p>
      )}
    </div>
  );
};

export default Page;