import { getTrashedFiles } from "@/lib/actions/file.actions";
import TrashCard from "@/components/TrashCard";

const Page = async () => {
  const files = await getTrashedFiles();

  return (
    <div className="page-container">
      <section className="w-full">
        <h1 className="h1 capitalize">Trash</h1>
      </section>

      {files.total > 0 ? (
        <section className="file-list">
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
