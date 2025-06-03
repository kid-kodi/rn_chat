import moment from 'moment';
import 'moment/locale/fr';
import {config, myFileType} from "../constants/Config";
import {Dimensions} from "react-native";

const getWidth = Dimensions.get('window').width;
const getHeight = Dimensions.get('window').height;
export const windowWidth = getWidth < getHeight ? getWidth : getHeight;
export const windowHeight = getHeight > getWidth ? getHeight : getWidth;

moment.locale("fr");

export const validateEmail = (email) => {
    let re = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
    return re.test(String(email).toLowerCase());
}

export const clearDupRoom = (roomArray) => {
    let hash = {};
    let array = [];
    const length = roomArray.length;
    let newLength = 0;

    for (let i = 0; i < length; i++) {
        const roomId = roomArray[i].id;
        if (hash[roomId] == null) {
            const joinTime = [roomArray[i].time];
            hash[roomId] = roomArray[i];
            hash[roomId].time = joinTime;
            newLength++;
            array.push(roomArray[i]);
        } else {
            hash[roomId].time.push(roomArray[i].time);
        }
    }

    let index = newLength - 1;
    for (let item in hash) {
        array[index--] = hash[item];
    }

    return array;
}

export function getFileTypeFromMimeType(mimeType) {
  if (!mimeType) return 'unknown';

  // Convert to lowercase for case-insensitive comparison
  const mime = mimeType.toLowerCase();

  // Common MIME type categories
  const mimeCategories = {
    // Images
    'image/': 'image',

    // Videos
    'video/': 'video',

    // Audio
    'audio/': 'audio',

    // Documents
    'application/pdf': 'document',
    'application/msword': 'document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
    'application/vnd.ms-excel': 'document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'document',
    'application/vnd.ms-powerpoint': 'document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'document',
    'text/plain': 'document',
    'text/csv': 'document',
    'text/html': 'document',
    'application/json': 'document',
    'application/rtf': 'document',

    // Archives
    'application/zip': 'archive',
    'application/x-rar-compressed': 'archive',
    'application/x-7z-compressed': 'archive',
    'application/x-tar': 'archive',
    'application/gzip': 'archive',

    // Executables
    'application/x-msdownload': 'executable',
    'application/x-sh': 'executable',
    'application/x-executable': 'executable',

    // Fonts
    'font/': 'font',
    'application/font-woff': 'font',
    'application/x-font-ttf': 'font',
  };

  // Check for exact matches first
  if (mimeCategories[mime]) {
    return mimeCategories[mime];
  }

  // Check for partial matches (e.g., 'image/', 'video/')
  for (const [prefix, type] of Object.entries(mimeCategories)) {
    if (prefix.endsWith('/') && mime.startsWith(prefix)) {
      return type;
    }
  }

  // Default to 'unknown' if no match found
  return 'unknown';
}

export const judgeFileType = (fileMIME, filename) => {
    if (fileMIME.indexOf('image') !== -1) {
        return myFileType.image;
    }

    if (filename.indexOf('.zip') !== -1) {
        return myFileType.zip;
    }

    if (fileMIME.indexOf('text/plain') !== -1) {
        return myFileType.text;
    }

    if (fileMIME.indexOf('application/pdf') !== -1) {
        return myFileType.pdf;
    }

    if (filename.indexOf('.ppt') !== -1) {
        return myFileType.ppt;
    }

    if (filename.indexOf('.doc') !== -1) {
        return myFileType.word;
    }

    if (filename.indexOf('.xls') !== -1) {
        return myFileType.excel;
    }

    if (filename.indexOf('.mp4') !== -1) {
        return myFileType.mp4;
    }
}

export const preventDoubleClick = (func, inf, interval = 500) => {
    if (!inf.isCalled) {
        inf.isCalled = true
        setTimeout(() => {
            inf.isCalled = false
        }, interval)
        return func();
    }
}

export const formatToDate = timestamp => {
  return moment(timestamp).format('LL');
};

export const formatToTime = timestamp => {
  return moment(timestamp).format('h:mm A');
};

export const formatChatDate = (date) => {
  const now = moment();
  const inputDate = moment(date);

  if (inputDate.isSame(now, 'day')) {
    return "Aujourd'hui"; // Today
  } else if (inputDate.isSame(now.subtract(1, 'days'), 'day')) {
    return 'Hier';
  } else if (inputDate.isSame(now, 'week')) {
    return inputDate.format('dddd'); // Same week
  } else {
    return inputDate.format('MMM D, YYYY'); // Older
  }
}

export const formatDate = rawDate => {
  let date = new Date(rawDate);
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  month = month < 10 ? `0${month}` : month;
  day = day < 10 ? `0${day}` : day;

  return `${day}/${month}/${year}`;
};

export const TimeAgo = (timestamp) =>{
    return moment(timestamp).fromNow();
}

export const countDown = EndDate => {
  var _second = 1000;
  var _minute = _second * 60;
  var _hour = _minute * 60;
  var _day = _hour * 24;
  const Today = new Date();
  var distance = EndDate - Today;
  var expired = false;
  if (distance < 0) {
    expired = true;
  }

  var days = Math.floor(distance / _day);
  var hours = Math.floor((distance % _day) / _hour);
  var minutes = Math.floor((distance % _hour) / _minute);
  var seconds = Math.floor((distance % _minute) / _second);
  return {days, hours, minutes, seconds, expired};
};

export  const compareDates = (d1, d2, state) => {
  let response = false;
  let date1 = new Date(d1).getTime();
  let date2 = new Date(d2).getTime();

  switch (state) {
    case "LESS":
      if (date1 < date2) {
        response = true;
      }
      break;
    case "GREATER":
      if (date1 > date2) {
        response = true;
      }
      break;
    case "EQUAL":
      if (date1 = date2) {
        response = true;
      }
      break;
  
    default:
      break;
  }

  // if (date1 < date2) {
  //   console.log(`${d1} is less than ${d2}`);
  // } else if (date1 > date2) {
  //   console.log(`${d1} is greater than ${d2}`);
  // } else {
  //   console.log(`Both dates are equal`);
  // }
};
