
const monthShort = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
const weekShort = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];

const getDateTime = (date = new Date(), TimeZone="") => {
    let month = monthShort[date.getMonth()];
    let day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
    let year = date.getFullYear() < new Date().getFullYear() ? `, ${date.getFullYear()}` : ``;
    let Hour = date.getHours() <= 9 ? `0${date.getHours()}` : date.getHours() > 12 ? `${date.getHours() - 12 < 10 ? `0${date.getHours() - 12}` : date.getHours() - 12}` : date.getHours() === 0 ? `12}` : date.getHours();
    let AM_PM = date.getHours() >= 12 ? "PM" : "AM";
    let minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : `${date.getMinutes()}`;
    let week = weekShort[date.getDay()];
    let returnDate =`${week}, ${month} ${day}${year} | ${Hour}:${minutes} ${AM_PM} ${TimeZone}`;
    return returnDate;
}
const getDateOnly = (date = new Date(), TimeZone="") => {
    let month = monthShort[date.getMonth()];
    let day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
    let year = date.getFullYear() < new Date().getFullYear() ? `, ${date.getFullYear()}` : ``;
    let week = weekShort[date.getDay()];
    let returnDate =`${week}, ${month} ${day}${year} ${TimeZone}`;
    return returnDate;
}

const getTimeOnly = (date = new Date(), TimeZone="") => {
  let Hour = date.getHours() <= 9 ? `0${date.getHours()}` : date.getHours() > 12 ? `${date.getHours() - 12 < 10 ? `0${date.getHours() - 12}` : date.getHours() - 12}` : date.getHours() === 0 ? `12}` : date.getHours();
    let AM_PM = date.getHours() >= 12 ? "PM" : "AM";
    let minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : `${date.getMinutes()}`;
    let returnDate =`${Hour}:${minutes} ${AM_PM} ${TimeZone}`;
    return returnDate;
}

/**
 * 
 * @param {Date} unixTimestamp 
 * @returns {Date} date
 */
const convertUnixToDate = (unixTimestamp) => {
    const date = new Date(unixTimestamp * 1000);
    return date;
};

export { getDateTime, getDateOnly, getTimeOnly, convertUnixToDate }