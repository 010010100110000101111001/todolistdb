exports.getDate = function () {

    const options = {
        weekday: `long`,
        day: `numeric`,
        month: `long`
    };

    const getCurrentDate = new Date();
    const day = getCurrentDate.toLocaleDateString(`en-US`, options);

    return day;

}

exports.getDay = function () {

    const options = {
        weekday: `long`,
    };

    const getCurrentDate = new Date();
    const day = getCurrentDate.toLocaleDateString(`en-US`, options);

    return day;

}