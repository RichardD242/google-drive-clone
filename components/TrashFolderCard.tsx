import Image from "next/image";
import FormattedDateTime from "@/components/FormattedDateTime";
import TrashFolderActionDropdown from "@/components/TrashFolderActionDropdown";


const TrashFolderCard = ({ folder }: { folder: FolderDocument }) => {
    return (
        <div className="file-card">
            <div className="flex justify-between">
                <Image
                    src="/assets/icons/folder.svg"
                    alt="folder"
                    width={40}
                    height={40}
                />
                <TrashFolderActionDropdown folder={folder} />
            </div>

            <div className="file-card-details">
                <p className="subtitle-2 line-clamp-1">{folder.name}</p>
                <FormattedDateTime
                    date={folder.$createdAt}
                    className="body-2 text-light-100"
                />
            </div>
        </div>
    );
};

export default TrashFolderCard;