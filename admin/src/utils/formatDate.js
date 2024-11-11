import moment from 'moment';
export function formatDate(createdAt) {
    const momentCreatedAt = moment(createdAt);
    const now = moment();

    const duration = moment.duration(now.diff(momentCreatedAt));

    if (duration.asSeconds() < 60) {
        return `${duration.seconds()} giây trước`;
    } else if (duration.asMinutes() < 60) {
        return `${duration.minutes()} phút trước`;
    } else if (duration.asHours() < 24) {
        return `${duration.hours()} giờ trước`;
    } else if (duration.asDays() < 30) {
        return `${duration.days()} ngày trước`;
    } else if (duration.asMonths() < 12) {
        return `${duration.months()} tháng trước`;
    } else {
        return momentCreatedAt.format('DD/MM/YYYY');
    }
};