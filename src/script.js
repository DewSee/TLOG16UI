var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var amountOfDaysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


var currentDate = new Date();
var visibleDate = new Date(currentDate);


function loadIndexPageElements() {
    addRowsToMonthTable();
    loadCurrentMonth();

}


function addRowsToMonthTable() {
    var rowNumber = 1;
    $('#calendar').find('tr').each(function () {
        if ($(this).attr('id') === ("row" + rowNumber)) {
            $(this).append("<td class=\"Monday\"></td>\n" +
                "           <td class=\"Tuesday\"></td>\n" +
                "           <td class=\"Wednesday\"></td>\n" +
                "           <td class=\"Thursday\"></td>\n" +
                "           <td class=\"Friday\"></td>\n" +
                "           <td class=\"Saturday\"></td>\n" +
                "           <td class=\"Sunday\"></td>");
            rowNumber++;
        }
    })
}


function loadCurrentMonth() {
    $('#actualMonth').text(months[visibleDate.getMonth()] + ", " + visibleDate.getFullYear());
    fillUpMonthCells();

}

function clickNextMonthButton() {
    visibleDate.setMonth(visibleDate.getMonth() + 1);
    loadCurrentMonth();
}

function clickPreviousMonthButton() {
    visibleDate.setMonth(visibleDate.getMonth() - 1);
    loadCurrentMonth();
}


function fillUpMonthCells() {

    clearTables();
    numberCellsFromFirstDayOfMonth();
    highlightCurrentDay();
    loadMonthStatistics();
}


function clearTables() {
    $('#calendar tr td').each(function () {
        $(this).text("");
        $(this).css("background-color", "white")
    });
    $('.monthStatColumn').each(function () {
        $(this).text("");
    })
}

function numberCellsFromFirstDayOfMonth() {
    var firstDayOfMonth = new Date(visibleDate.getFullYear(), visibleDate.getMonth(), 1, 1);
    var dayOfMonth = 1;
    var dayToPrint = new Date(visibleDate.getFullYear(), visibleDate.getMonth(), dayOfMonth);
    $('#calendar tr td').each(function () {
        if (dayOfMonth <= amountOfDaysInMonths[firstDayOfMonth.getMonth()] && $(this).attr('class') === daysOfWeek[dayToPrint.getDay()]) {
            $(this).append("<a href=\"#\" class=\"monthCell\"><div class=\"cellNumber\" >" + dayOfMonth + "</div></a>");
            loadExistingDaysIntoCells($(this), dayOfMonth);
            dayOfMonth++;
            dayToPrint.setDate(dayOfMonth);
        } else {
            $(this).css("background-color", "#eaefeb");
        }
    })
}


function highlightCurrentDay() {
    if (currentDate.getMonth() === visibleDate.getMonth() && currentDate.getFullYear() === visibleDate.getFullYear()) {
        var currentDayTd = $('#calendar tr td').filter(function () {
            return $(this).text() === currentDate.getDate().toString();
        });
        currentDayTd.css("background-color", "#9bd770");
    }
}

function loadExistingDaysIntoCells(cellToFill, dayOfMonth) {

    $.ajax({
        type: "GET",
        url: 'http://localhost:9080/timelogger/workmonths/' + visibleDate.getFullYear() + '/' + (visibleDate.getMonth() + 1) + '/' + dayOfMonth,
        async: true,
        crossDomain: true,
        success: function (data, status, xhr) {
            if (data !== "") {
                cellToFill.find('a').append("<div class=\"cellSummedMinutes\">" + data.requiredMinPerDay + "/" + data.sumPerDay + "</div>");
            }
            if (data.requiredMinPerDay > data.sumPerDay) {
                // $('.cellSummedMinutes').css("color", "#EA202C");
            }
        }
    });
}

function loadMonthStatistics() {
    $.ajax({
        type: "GET",
        url: 'http://localhost:9080/timelogger/workmonths/' + visibleDate.getFullYear() + '/' + (visibleDate.getMonth() + 1),
        async: true,
        crossDomain: true,
        success: function (data) {
            $('#reqMinPerMonth').text(data.requiredMinPerMonth);
            $('#sumperMonth').text(data.sumPerMonth);
            $('#extraMinperMonth').text(data.extraMinPerMonth);
        }
    });
}

$(document).ready(function () {

    var selectedYear;
    var selectedMonth;
    var selectedDay;


    $('.monthCell').click(function () {
        selectedYear = visibleDate.getFullYear();
        localStorage.setItem("selectedYear", selectedYear);

        selectedMonth = (visibleDate.getMonth() + 1);
        localStorage.setItem("selectedMonth", selectedMonth);

        selectedDay = $(this).find('.cellNumber').text();
        localStorage.setItem("selectedDay", selectedDay);

        if($(this).text().length > 1){
            window.location.href = "dayView.html"
        }else{
            //TODO: FINISH POST/WORKDAY
            // $.ajax({
            //     type: "POST",
            //     url : 'http://localhost:9080/timelogger/workmonths/workdays',
            //     contentType: "application/json; charset=utf-8",
            //     dataType: "json",
            //     async: true,
            //     crossDomain: true,
            //     succes: function (data) {
            //
            //     }
            // })
        }

    });

});


function loadTaskTable() {


    $(window).ready(function () {

        $.ajax({
            type: "GET",
            url: 'http://localhost:9080/timelogger/workmonths/' + localStorage.getItem("selectedYear") + '/' + localStorage.getItem("selectedMonth") + '/' + localStorage.getItem("selectedDay"),
            async: true,
            crossDomain: true,
            success: function (data) {

                $('#actualDay').text(localStorage.getItem("selectedYear") + "." + localStorage.getItem("selectedMonth") + "." + localStorage.getItem("selectedDay"));
                $('#reqMinPerDay').text(data.requiredMinPerDay);
                $('#sumPerDay').text(data.sumPerDay);
                $('#extraMinPerDay').text(data.extraMinPerDay);


                for (i = 0; i < data.tasks.length; i++) {
                    $('#task-table tbody').append("<tr id=\"task" + i + "\">\n" +
                        "            <td class=\"taskId\"></td>\n" +
                        "            <td class=\"startTime\"></td>\n" +
                        "            <td class=\"endTime\"></td>\n" +
                        "            <td class=\"comment\"></td>\n" +
                        "            <td class=\"length\"></td>\n" +
                        "            <td class=\"edit\"></td>\n" +
                        "        </tr>")

                    $('#task-table #task' + i).each(function () {
                        $(this).find('td').filter('.taskId').text(data.tasks[i].taskId);
                        $(this).find('td').filter('.startTime').text(data.tasks[i].startTime[0] + ':' + data.tasks[i].startTime[1]);
                        $(this).find('td').filter('.endTime').text(data.tasks[i].endTime[0] + ':' + data.tasks[i].endTime[1]);
                        $(this).find('td').filter('.comment').text(data.tasks[i].comment);
                        $(this).find('td').filter('.length').text(data.tasks[i].minPerTask);
                        $(this).find('td').filter('.edit').append("<button type=\"button\" class=\"editTaskButton\">Edit</button>");
                    });
                }
            }
        });
    })
}
