import { format } from "date-fns";

export function d3FormatToDateFns(d3Format: string) {
  const formatMap = {
    "%Y": "yyyy",
    "%y": "yy",
    "%m": "MM",
    "%b": "MMM",
    "%B": "MMMM",
    "%d": "dd",
    "%e": "d",
    "%a": "EEE",
    "%A": "EEEE",
    "%j": "DDD",
    "%H": "HH",
    "%I": "hh",
    "%M": "mm",
    "%S": "ss",
    "%L": "SSS",
    "%f": "SSSSSS",
    "%p": "aa",
    "%Z": "XXX",
    "%z": "xxx",
    "%%": "%",
  };

  let dateFnsFormat = d3Format;
  Object.entries(formatMap).forEach(([d3Token, dateFnsToken]) => {
    dateFnsFormat = dateFnsFormat.replace(new RegExp(d3Token, "g"), dateFnsToken);
  });

  return dateFnsFormat;
}

export function createUtcFormatter(d3FormatStr: string, options = {}) {
  return (date: Date) => format(date, d3FormatToDateFns(d3FormatStr), options);
}


