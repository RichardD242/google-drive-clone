import FolderCard from "@/components/FolderCard";
import Card from "@/components/Card";
import { getFavoriteFiles } from "@/lib/actions/file.actions";
import { getFavoriteFolders } from "@/lib/actions/folder.actions";

const Page = async () => {
    const [files, folders] = await Promise.all([
        getFavoriteFiles(),
        getFavoriteFolders(),
    ]);

    
    return (
        <div className="page-container">
            <section className="w-full">
                <h1 className="h1 capitalize">Favorites</h1>
            </section>

            {files.total > 0 || folders.total > 0 ? (
                <section className="file-list">
                    {folders.documents.map((folder: FolderDocument) => (
                        <FolderCard key={folder.$id} folder={folder} />
                    ))}
                    {files.documents.map((file: FileDocument) => (
                        <Card key={file.$id} file={file} />
                    ))}
                </section>
            ) : (
                <p className="empty-list">no favorites yet</p>
            )}
        </div>
    );
};


export default Page;