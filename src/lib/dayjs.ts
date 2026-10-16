import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Register plugins once, here. Import this module anywhere you need dayjs.
dayjs.extend(utc);
dayjs.extend(timezone);

export default dayjs;
