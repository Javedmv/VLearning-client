import date from "date-and-time";

export const getPassedDataOnwardDateForInput = (inputDateString: string) => {
    const inputDate = new Date(inputDateString);
    const formattedDate = date.format(inputDate,"YYYY-MM-DD");
    return formattedDate;
}

export const capitalizeFirstLetter = (str: string | undefined) => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
};

export const getVideoDuration = (vidoeFile:string) => 
    new Promise<string>((resolve) => {
      const video = document.createElement("video");
      video.src = vidoeFile;
      video.onloadedmetadata = () => {
        const duration = Math.floor(video.duration); // Get duration in seconds
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = duration % 60;
  
        if (hours > 0) {
          resolve(`${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
        } else {
          resolve(`${minutes}:${seconds.toString().padStart(2, "0")}`);
        }
    };
});