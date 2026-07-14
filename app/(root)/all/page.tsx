import Sort from "@/components/Sort";
import Card from "@/components/Card";
import FolderCard from "@/components/FolderCard";
import { getFiles } from "@/lib/actions/file.actions";
import { getAllFolders } from "@/lib/actions/folder.actions";
import { convertFileSize } from "@/lib/utils";

const Page = async ({ searchParams }: SearchParamProps) => {
  const searchText = ((await searchParams)?.query as string) || "";
  const sort = ((await searchParams)?.sort as string) || "";

  const [files, folders] = await Promise.all([
    getFiles({ types: [], searchText, sort }),
    getAllFolders(),
  ]);

  const totalSize = files.documents.reduce((sum: number, file: FileDocument) => sum + file.size, 0);
  const isEmpty = files.total === 0 && folders.total === 0;

  return (
    <div className="page-container">
      <section className="w-full">
        <h1 className="h1 capitalize">All Files</h1>

        <div className="total-size-section">
          <p className="body-1">
            Total: <span className="h5">{convertFileSize(totalSize)}</span>
          </p>

          <div className="sort-container">
            <p className="body-1 hidden text-light-200 sm:block">Sort by:</p>
            <Sort />
          </div>
        </div>
      </section>

      {!isEmpty ? (
        <section className="file-list">
          {folders.documents.map((folder: FolderDocument) => (
            <FolderCard key={folder.$id} folder={folder} />
          ))}
          {files.documents.map((file: FileDocument) => (
            <Card key={file.$id} file={file} />
          ))}
        </section>
      ) : (
        <p className="empty-list">No files uploaded</p>
      )}
    </div>
  );
};

export default Page;
