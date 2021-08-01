import { Logger } from 'tslog';

export default new Logger({
    dateTimeTimezone: 'America/Sao_Paulo',
    dateTimePattern: 'day-month-year hour:minute:second',
    prettyInspectHighlightStyles: {
        string: 'yellow',
    },
});
