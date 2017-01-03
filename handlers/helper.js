'use strict'

let helper = {}


helper.formatDate = (date) => {
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    let hours = date.getHours()
    let min = date.getMinutes()

    return helper.addZero(day) + '.' + helper.addZero(month) + '.' + helper.addZero(year) + ' '
        + helper.addZero(hours) + ':' + helper.addZero(min)
}

helper.addZero = (val, length) => {
    length = length || 2
    let result = val.toString()
    while (result.length < length) {
        result = '0' + result;
    }

    return result
}

module.exports = helper