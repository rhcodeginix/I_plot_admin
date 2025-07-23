import { getMetadata, getStorage, ref } from "firebase/storage";
import { useEffect, useState } from "react";

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const getFileInfoFromUrl = async (url: string) => {
  try {
    const storage = getStorage();
    const decodedUrl = decodeURIComponent(url);
    const path = decodedUrl.split("/o/")[1].split("?")[0].replace(/%2F/g, "/");
    const fileRef = ref(storage, path);

    const metadata = await getMetadata(fileRef);
    const fileSizeFormatted = metadata.size
      ? formatFileSize(metadata.size)
      : "Unknown size";

    return {
      fileName: metadata.name,
      fileSize: fileSizeFormatted,
    };
  } catch (error) {
    console.error("Error fetching file info:", error);
    return { fileName: "Unknown", fileSize: "Unknown size" };
  }
};

const FileInfo = ({ file }: { file: string }) => {
  const [fileInfo, setFileInfo] = useState({ fileName: "", fileSize: "" });

  useEffect(() => {
    const fetchFileInfo = async () => {
      const info: any = await getFileInfoFromUrl(file);
      setFileInfo(info);
    };
    fetchFileInfo();
  }, [file]);

  return (
    <div className="truncate">
      <h5 className="text-darkBlack text-xs md:text-sm font-medium mb-1 truncate">
        {fileInfo.fileName || "Loading..."}
      </h5>
      <p className="text-gray text-[10px] md:text-xs">
        {fileInfo.fileSize || "Fetching size..."}
      </p>
    </div>
  );
};

export default FileInfo;
