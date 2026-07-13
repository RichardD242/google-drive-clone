import Link from "next/link";
import Image from "next/image";
import FormattedDateTime from "@/components/FormattedDateTime";
import FolderActionDropdown from "@/components/FolderActionDropdown";

const FolderCard = ({ folder }: { folder: FolderDocument }) => {
  
    return (

    <div className="file-card">
      <div className="flex justify-between">
        <Link href={`/folder/${folder.$id}`} className="flex items-center gap-3">
          <Image
            src="/assets/icons/dashboard.svg"
            alt="folder"
            width={40}
            height={40}
          />
        </Link>

        <FolderActionDropdown folder={folder} />
      </div>

      <div className="file-card-details">
        <Link href={`/folder/${folder.$id}`}>
          <p className="subtitle-2 line-clamp-1">{folder.name}</p>
        </Link>
        <FormattedDateTime
          date={folder.$createdAt}
          className="body-2 text-light-100"
        />
        
      </div>
    </div>
  );
};

export default FolderCard;