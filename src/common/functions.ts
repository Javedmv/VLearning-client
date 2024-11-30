import date from "date-and-time";

export const getPassedDataOnwardDateForInput = (inputDateString: string) => {
    const inputDate = new Date(inputDateString);
    const formattedDate = date.format(inputDate,"YYYY-MM-DD");
    return formattedDate;
}